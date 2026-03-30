package pe.elitec.academia_taekwondo.auth_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.elitec.academia_taekwondo.auth_service.entity.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email); // Buscará si el correo ya existe
}