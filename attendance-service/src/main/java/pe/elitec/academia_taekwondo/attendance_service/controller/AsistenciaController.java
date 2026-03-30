package pe.elitec.academia_taekwondo.attendance_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.attendance_service.entity.Asistencia;
import pe.elitec.academia_taekwondo.attendance_service.repository.AsistenciaRepository;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    // 1. Marcar asistencia (POST)
    @PostMapping
    public Asistencia registrarAsistencia(@RequestBody Asistencia asistencia) {
        // Si no mandan fecha, ponemos la de hoy
        if (asistencia.getFecha() == null) {
            asistencia.setFecha(LocalDate.now());
        }
        return asistenciaRepository.save(asistencia);
    }

    // 2. Ver historial de un alumno (GET)
    @GetMapping("/alumno/{alumnoId}")
    public List<Asistencia> obtenerHistorial(@PathVariable Long alumnoId) {
        return asistenciaRepository.findByAlumnoId(alumnoId);
    }

    // 3. Listar todas (GET) - Opcional, para debug
    @GetMapping
    public List<Asistencia> listarTodas() {
        return asistenciaRepository.findAll();
    }
}