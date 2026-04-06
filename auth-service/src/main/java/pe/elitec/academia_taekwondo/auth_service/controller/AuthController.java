package pe.elitec.academia_taekwondo.auth_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.auth_service.config.JwtProvider;
import pe.elitec.academia_taekwondo.auth_service.dto.AuthResponse;
import pe.elitec.academia_taekwondo.auth_service.dto.LoginRequest;
import pe.elitec.academia_taekwondo.auth_service.dto.RegisterRequest;
import pe.elitec.academia_taekwondo.auth_service.entity.Rol;
import pe.elitec.academia_taekwondo.auth_service.entity.Usuario;
import pe.elitec.academia_taekwondo.auth_service.repository.RolRepository;
import pe.elitec.academia_taekwondo.auth_service.repository.UsuarioRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet; // <-- ¡Importante! Necesario para las listas mutables de Hibernate
import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    // --- 1. INICIAR SESIÓN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                String rolNombre = "ALUMNO";
                if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
                    rolNombre = usuario.getRoles().iterator().next().getNombre();
                }

                String rolFinal = rolNombre.startsWith("ROLE_") ? rolNombre : "ROLE_" + rolNombre;
                String token = jwtProvider.generateToken(usuario.getEmail(), rolFinal);

                return ResponseEntity.ok(new AuthResponse(token));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Credenciales inválidas");
    }

    // --- 2. CREAR NUEVA CUENTA ---
    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegisterRequest request) {

        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: El correo ya está registrado.");
        }

        Optional<Rol> rolPorDefecto = rolRepository.findByNombre("ALUMNO");
        if (rolPorDefecto.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error crítico: El rol ALUMNO no existe en la base de datos.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setApellido(request.getApellido());
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setEstado(true);

        String contrasenaEncriptada = passwordEncoder.encode(request.getPassword());
        nuevoUsuario.setPassword(contrasenaEncriptada);

        // 🛡️ SOLUCIÓN PARA HIBERNATE: Usar HashSet en lugar de Set.of()
        Set<Rol> roles = new HashSet<>();
        roles.add(rolPorDefecto.get());
        nuevoUsuario.setRoles(roles);

        usuarioRepository.save(nuevoUsuario);

        return ResponseEntity.ok("Cuenta creada exitosamente en la base de datos.");
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> actualizarPerfil(@RequestBody RegisterRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            if (request.getDni() != null && !request.getDni().trim().isEmpty()) {
                usuario.setDni(request.getDni());
            }
            if (request.getTelefono() != null && !request.getTelefono().trim().isEmpty()) {
                usuario.setTelefono(request.getTelefono());
            }
            if (request.getDireccion() != null && !request.getDireccion().trim().isEmpty()) {
                usuario.setDireccion(request.getDireccion());
            }
            if (request.getFechaNacimiento() != null && !request.getFechaNacimiento().trim().isEmpty()) {
                usuario.setFechaNacimiento(LocalDate.parse(request.getFechaNacimiento()));
            }

            usuarioRepository.save(usuario);
            return ResponseEntity.ok("Perfil actualizado de forma segura sin borrar datos.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerMiPerfil(@RequestParam String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> ResponseEntity.ok(usuario))
                .orElse(ResponseEntity.notFound().build());
    }

    // --- LISTAR TODOS LOS USUARIOS (PANEL DE ADMINISTRADOR) ---
    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        usuarios.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(usuarios);
    }

    // --- ACTUALIZAR ROL DE UN USUARIO (CON CORRECCIÓN 500) ---
    @PutMapping("/usuarios/{id}/rol")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoRolNombre = body.get("rol");

            Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
            }

            String rolLimpio = nuevoRolNombre.replace("ROLE_", "");

            Optional<Rol> rolOpt = rolRepository.findByNombre(rolLimpio);
            if (rolOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Error: El rol " + rolLimpio + " no existe en la base de datos.");
            }

            Usuario usuario = usuarioOpt.get();

            // 🛡️ SOLUCIÓN PARA HIBERNATE: HashSet permite modificar la relación de base de
            // datos sin explotar
            Set<Rol> rolesActualizados = new HashSet<>();
            rolesActualizados.add(rolOpt.get());

            usuario.setRoles(rolesActualizados);
            usuarioRepository.save(usuario);

            return ResponseEntity.ok("Rol actualizado con éxito.");

        } catch (Exception e) {
            // Este catch atrapa cualquier explosión interna y te la imprime en Railway para
            // no estar a ciegas
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor al guardar el rol.");
        }
    }
}