package pe.elitec.academia_taekwondo.service;

import org.springframework.stereotype.Service;
import pe.elitec.academia_taekwondo.entity.Alumno;
import pe.elitec.academia_taekwondo.repository.AlumnoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;

    public AlumnoService(AlumnoRepository alumnoRepository) {
        this.alumnoRepository = alumnoRepository;
    }

    // Listar todos los alumnos
    public List<Alumno> listarTodos() {
        return alumnoRepository.findAll();
    }

    // Buscar alumno por ID
    public Optional<Alumno> buscarPorId(Long id) {
        return alumnoRepository.findById(id);
    }

    // Guardar alumno nuevo o actualizar existente
    public Alumno guardar(Alumno alumno) {
        return alumnoRepository.save(alumno);
    }

    // Eliminar alumno por ID
    public void eliminar(Long id) {
        alumnoRepository.deleteById(id);
    }

    // Buscar alumno por DNI (usa el método definido en AlumnoRepository)
    public Optional<Alumno> buscarPorDni(String dni) {
        return Optional.ofNullable(alumnoRepository.findByDni(dni));
    }
}
