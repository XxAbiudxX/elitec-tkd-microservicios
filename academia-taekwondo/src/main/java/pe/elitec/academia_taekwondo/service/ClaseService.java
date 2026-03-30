package pe.elitec.academia_taekwondo.service;

import org.springframework.stereotype.Service;
import pe.elitec.academia_taekwondo.entity.Clase;
import pe.elitec.academia_taekwondo.repository.ClaseRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ClaseService {

    private final ClaseRepository claseRepository;

    public ClaseService(ClaseRepository claseRepository) {
        this.claseRepository = claseRepository;
    }

    public List<Clase> listarTodas() {
        return claseRepository.findAll();
    }

    public Optional<Clase> buscarPorId(Long id) {
        return claseRepository.findById(id);
    }

    public Clase guardar(Clase clase) {
        return claseRepository.save(clase);
    }

    public void eliminar(Long id) {
        claseRepository.deleteById(id);
    }
}
