package pe.elitec.academia_taekwondo.auth_service.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.elitec.academia_taekwondo.auth_service.entity.Rol;
import pe.elitec.academia_taekwondo.auth_service.entity.Usuario;
import pe.elitec.academia_taekwondo.auth_service.repository.RolRepository;
import pe.elitec.academia_taekwondo.auth_service.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.Set;

@Configuration
public class RoleInitializer {

    @Bean
    CommandLineRunner initDatabase(RolRepository rolRepository, UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Crear Roles si no existen
            if (rolRepository.findByNombre("ADMIN").isEmpty()) {
                Rol admin = new Rol();
                admin.setNombre("ADMIN");
                rolRepository.save(admin);
            }
            if (rolRepository.findByNombre("PROFESOR").isEmpty()) {
                Rol profe = new Rol();
                profe.setNombre("PROFESOR");
                rolRepository.save(profe);
            }
            if (rolRepository.findByNombre("ALUMNO").isEmpty()) {
                Rol alumno = new Rol();
                alumno.setNombre("ALUMNO");
                rolRepository.save(alumno);
            }

            // 2. Crear al Sensei (Administrador Supremo)
            if (usuarioRepository.findByEmail("admin@elitec.pe").isEmpty()) {
                Usuario adminUser = new Usuario();
                adminUser.setNombre("Abiud");
                adminUser.setApellido("Arreaza");
                adminUser.setDni("002014436");
                adminUser.setEmail("admin@elitec.pe");
                // ¡Aquí ocurre la magia! La contraseña "admin123" se encripta antes de
                // guardarse
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setFechaNacimiento(LocalDate.of(2006, 5, 9));
                adminUser.setEstado(true);

                // Asignarle el rol de ADMIN
                Rol adminRol = rolRepository.findByNombre("ADMIN").get();
                adminUser.setRoles(Set.of(adminRol));

                usuarioRepository.save(adminUser);
                System.out.println("✅ ¡Usuario Administrador Maestro creado con éxito!");
            }
        };
    }
}