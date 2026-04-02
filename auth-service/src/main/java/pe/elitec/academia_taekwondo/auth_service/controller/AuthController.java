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
                // 🛡️ EXTRACCIÓN DE ROL SEGURA
                String rolNombre = "ALUMNO"; // Rol por defecto en caso de vacío
                if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
                    rolNombre = usuario.getRoles().iterator().next().getNombre();
                }

                // Aseguramos que tenga el prefijo ROLE_ para estandarizar el JWT
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

        // 🛑 CORRECCIÓN: Buscamos el rol ALUMNO por defecto para los registros nuevos,
        // ¡no ADMIN!
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

        // Asignamos el rol ALUMNO
        nuevoUsuario.setRoles(Set.of(rolPorDefecto.get()));

        usuarioRepository.save(nuevoUsuario);

        return ResponseEntity.ok("Cuenta creada exitosamente en la base de datos.");
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> actualizarPerfil(@RequestBody RegisterRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            // 🛡️ ESCUDOS ANTI-NULLS: Solo guardamos si el frontend mandó algo válido
            if (request.getDni() != null && !request.getDni().trim().isEmpty()) {
                usuario.setDni(request.getDni());
            }
            if (request.getTelefono() != null && !request.getTelefono().trim().isEmpty()) {
                usuario.setTelefono(request.getTelefono());
            }
            if (request.getDireccion() != null && !request.getDireccion().trim().isEmpty()) {
                usuario.setDireccion(request.getDireccion());
            }

            // CONVERSIÓN DE FECHA SEGURA
            if (request.getFechaNacimiento() != null && !request.getFechaNacimiento().trim().isEmpty()) {
                usuario.setFechaNacimiento(LocalDate.parse(request.getFechaNacimiento()));
            }

            usuarioRepository.save(usuario);
            return ResponseEntity.ok("Perfil actualizado de forma segura sin borrar datos.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
    }

    // --- OBTENER DATOS PARA "MI PERFIL" ---
    @GetMapping("/me")
    public ResponseEntity<?> obtenerMiPerfil(@RequestParam String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    // Creamos un objeto simple con los datos
                    return ResponseEntity.ok(usuario);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- NUEVO: LISTAR TODOS LOS USUARIOS (PANEL DE ADMINISTRADOR) ---
    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        // Ocultamos las contraseñas antes de enviarlas al frontend por seguridad
        usuarios.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(usuarios);
    }

    // --- NUEVO: ACTUALIZAR ROL DE UN USUARIO ---
    @PutMapping("/usuarios/{id}/rol")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoRolNombre = body.get("rol"); // Viene como "ROLE_ADMIN" o "ROLE_ALUMNO" desde el JS

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
        }

        // Limpiamos el prefijo "ROLE_" para buscarlo en la base de datos como "ADMIN" o
        // "ALUMNO"
        String rolLimpio = nuevoRolNombre.replace("ROLE_", "");

        Optional<Rol> rolOpt = rolRepository.findByNombre(rolLimpio);
        if (rolOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: El rol " + rolLimpio + " no existe en la base de datos.");
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setRoles(Set.of(rolOpt.get()));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Rol actualizado con éxito.");
    }
}