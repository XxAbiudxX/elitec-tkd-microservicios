package pe.elitec.academia_taekwondo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.entity.Profesor;

@Repository
public interface ProfesorRepository extends JpaRepository<Profesor, Long> {
    Profesor findByCorreo(String correo);
}
