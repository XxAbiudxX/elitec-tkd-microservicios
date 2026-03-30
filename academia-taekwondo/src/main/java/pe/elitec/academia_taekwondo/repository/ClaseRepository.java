package pe.elitec.academia_taekwondo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.elitec.academia_taekwondo.entity.Clase;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Long> {
}
