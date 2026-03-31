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

import java.util.Optional;
import java.util.Set;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository; // <-- ¡Agregamos el buscador de roles!

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

        // 1. Verificamos que el correo no exista ya
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: El correo ya está registrado.");
        }

        // 2. Buscamos el rol ADMIN en la base de datos
        Optional<Rol> rolAdmin = rolRepository.findByNombre("ADMIN");
        if (rolAdmin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error crítico: El rol ADMIN no existe en la base de datos.");
        }

        // 3. Creamos al nuevo Sensei (UN SOLO OBJETO)
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setApellido(request.getApellido());
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setEstado(true); // Aseguramos que empiece activo

        // 4. Encriptamos la contraseña
        String contrasenaEncriptada = passwordEncoder.encode(request.getPassword());
        nuevoUsuario.setPassword(contrasenaEncriptada);

        // 5. Le asignamos el rol
        nuevoUsuario.setRoles(Set.of(rolAdmin.get()));

        // 6. ¡Guardamos en Neon!
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
}