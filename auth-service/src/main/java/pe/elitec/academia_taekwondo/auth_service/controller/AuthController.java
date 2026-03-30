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
                String rol = usuario.getRoles().iterator().next().getNombre();
                String token = jwtProvider.generateToken(usuario.getEmail(), rol);
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

        // 3. Creamos al nuevo Sensei
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setEmail(request.getEmail());
        // Si tu entidad Usuario tiene setNombre(), descomenta la siguiente línea:
        // nuevoUsuario.setNombre(request.getNombre());

        // 4. Encriptamos la contraseña (¡Nadie podrá leerla en Neon!)
        String contrasenaEncriptada = passwordEncoder.encode(request.getPassword());
        nuevoUsuario.setPassword(contrasenaEncriptada);

        // 5. Le asignamos el rol
        nuevoUsuario.setRoles(Set.of(rolAdmin.get()));

        // 6. ¡Guardamos en Neon!
        usuarioRepository.save(nuevoUsuario);

        return ResponseEntity.ok("Cuenta creada exitosamente en la base de datos.");
    }
}