package pe.elitec.academia_taekwondo.service;

import org.springframework.stereotype.Service;
import pe.elitec.academia_taekwondo.entity.Matricula;
import pe.elitec.academia_taekwondo.repository.MatriculaRepository;

import java.util.List;
import java.util.Optional;

@Service
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;

    public MatriculaService(MatriculaRepository matriculaRepository) {
        this.matriculaRepository = matriculaRepository;
    }

    public List<Matricula> listarTodas() {
        return matriculaRepository.findAll();
    }

    public Optional<Matricula> buscarPorId(Long id) {
        return matriculaRepository.findById(id);
    }

    public Matricula guardar(Matricula matricula) {
        return matriculaRepository.save(matricula);
    }

    public void eliminar(Long id) {
        matriculaRepository.deleteById(id);
    }
}
