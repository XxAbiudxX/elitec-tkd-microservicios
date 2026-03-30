package pe.elitec.academia_taekwondo.service;

import org.springframework.stereotype.Service;
import pe.elitec.academia_taekwondo.entity.Profesor;
import pe.elitec.academia_taekwondo.repository.ProfesorRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProfesorService {

    private final ProfesorRepository profesorRepository;

    public ProfesorService(ProfesorRepository profesorRepository) {
        this.profesorRepository = profesorRepository;
    }

    public List<Profesor> listarTodos() {
        return profesorRepository.findAll();
    }

    public Optional<Profesor> buscarPorId(Long id) {
        return profesorRepository.findById(id);
    }

    public Profesor guardar(Profesor profesor) {
        return profesorRepository.save(profesor);
    }

    public void eliminar(Long id) {
        profesorRepository.deleteById(id);
    }

    public Optional<Profesor> buscarPorCorreo(String correo) {
        return Optional.ofNullable(profesorRepository.findByCorreo(correo));
    }
}
