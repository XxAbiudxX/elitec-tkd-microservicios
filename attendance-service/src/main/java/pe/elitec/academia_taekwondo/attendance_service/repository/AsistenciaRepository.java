package pe.elitec.academia_taekwondo.attendance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.elitec.academia_taekwondo.attendance_service.entity.Asistencia;
import java.util.List;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    // Método mágico para buscar asistencias de un alumno específico
    List<Asistencia> findByAlumnoId(Long alumnoId);
}