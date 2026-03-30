package pe.elitec.academia_taekwondo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.entity.Matricula;
import java.util.List;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    // Buscar todas las matrículas de una clase específica (usando el ID)
    List<Matricula> findByIdClase(Long idClase);

    // Buscar todas las matrículas de un alumno específico
    List<Matricula> findByAlumno_IdAlumno(Long idAlumno);
}
