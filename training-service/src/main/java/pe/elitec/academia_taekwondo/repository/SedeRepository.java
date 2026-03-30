package pe.elitec.academia_taekwondo.student_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.elitec.academia_taekwondo.student_service.entity.Sede;

public interface SedeRepository extends JpaRepository<Sede, Long> {
}