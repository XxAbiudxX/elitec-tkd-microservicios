package pe.elitec.academia_taekwondo.training_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.training_service.entity.Horario;

import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Long> {
    // Un método útil por si luego quieres filtrar los horarios por sede
    List<Horario> findBySedeId(Long sedeId);
}