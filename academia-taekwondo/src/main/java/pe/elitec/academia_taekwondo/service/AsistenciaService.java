package pe.elitec.academia_taekwondo.service;

import org.springframework.stereotype.Service;
import pe.elitec.academia_taekwondo.entity.Asistencia;
import pe.elitec.academia_taekwondo.repository.AsistenciaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;

    public AsistenciaService(AsistenciaRepository asistenciaRepository) {
        this.asistenciaRepository = asistenciaRepository;
    }

    public List<Asistencia> listarTodas() {
        return asistenciaRepository.findAll();
    }

    public Optional<Asistencia> buscarPorId(Long id) {
        return asistenciaRepository.findById(id);
    }

    public List<Asistencia> listarPorAlumno(Long idAlumno) {
        return asistenciaRepository.findByAlumno_IdAlumno(idAlumno);
    }

    public List<Asistencia> listarPorClase(Long idClase) {
        return asistenciaRepository.findByClase_IdClase(idClase);
    }

    public List<Asistencia> listarPorFecha(LocalDate fecha) {
        return asistenciaRepository.findByFecha(fecha);
    }

    public Asistencia guardar(Asistencia asistencia) {
        return asistenciaRepository.save(asistencia);
    }

    public void eliminar(Long id) {
        asistenciaRepository.deleteById(id);
    }
}
