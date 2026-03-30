package pe.elitec.academia_taekwondo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.entity.Alumno;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    // método extra para buscar por DNI
    Alumno findByDni(String dni);
}
