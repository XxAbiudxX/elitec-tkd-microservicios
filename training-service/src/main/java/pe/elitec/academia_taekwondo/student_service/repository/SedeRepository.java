package pe.elitec.academia_taekwondo.student_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.student_service.entity.Sede;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Long> {
}