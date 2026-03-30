package pe.elitec.academia_taekwondo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.entity.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
}
