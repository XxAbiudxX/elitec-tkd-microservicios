package pe.elitec.academia_taekwondo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.entity.Asistencia;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    List<Asistencia> findByAlumno_IdAlumno(Long idAlumno);

    List<Asistencia> findByClase_IdClase(Long idClase);

    List<Asistencia> findByFecha(LocalDate fecha);
}
