package pe.elitec.academia_taekwondo.attendance_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.attendance_service.entity.Asistencia;
import pe.elitec.academia_taekwondo.attendance_service.repository.AsistenciaRepository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    // 1. Marcar asistencia (POST original)
    @PostMapping
    public Asistencia registrarAsistencia(@RequestBody Asistencia asistencia) {
        if (asistencia.getFecha() == null) {
            asistencia.setFecha(LocalDate.now());
        }
        return asistenciaRepository.save(asistencia);
    }

    // 2. Ver historial de un alumno (GET original)
    @GetMapping("/alumno/{alumnoId}")
    public List<Asistencia> obtenerHistorial(@PathVariable Long alumnoId) {
        return asistenciaRepository.findByAlumnoId(alumnoId);
    }

    // 3. Listar todas (GET original)
    @GetMapping
    public List<Asistencia> listarTodas() {
        return asistenciaRepository.findAll();
    }

    // =========================================================
    // 🔥 NUEVO: LÓGICA PARA MVP DE EXAMEN (80% ASISTENCIA) 🔥
    // =========================================================

    // 4. Marcar asistencia rápida con 1 clic desde el Frontend
    @PostMapping("/marcar/{alumnoId}")
    public ResponseEntity<?> marcarAsistenciaRapida(@PathVariable Long alumnoId) {
        Asistencia asistencia = new Asistencia();
        asistencia.setAlumnoId(alumnoId);
        asistencia.setFecha(LocalDate.now());
        asistencia.setPresente(true);
        asistencia.setObservaciones("Asistencia rápida desde panel MVP");
        asistenciaRepository.save(asistencia);

        return ResponseEntity.ok("Asistencia registrada.");
    }

    // 5. Calcular Status Matemático para el Examen
    @GetMapping("/status/{alumnoId}")
    public ResponseEntity<?> obtenerStatusExamen(@PathVariable Long alumnoId) {
        List<Asistencia> historial = asistenciaRepository.findByAlumnoId(alumnoId);

        // CONFIGURACIÓN MVP: Supongamos que el ciclo tiene 10 clases en total
        double totalClasesCiclo = 10.0;

        // Contamos cuántas veces el alumno tiene 'presente = true'
        long asistenciasLogradas = historial.stream()
                .filter(Asistencia::isPresente)
                .count();

        // Calculamos el porcentaje
        double porcentaje = (asistenciasLogradas / totalClasesCiclo) * 100;

        // Tope visual (para que la barra no se salga si viene 11 veces)
        if (porcentaje > 100)
            porcentaje = 100.0;

        // Regla de negocio: Necesita el 80%
        boolean aptoParaExamen = porcentaje >= 80.0;

        // Empaquetamos la respuesta para el Frontend
        Map<String, Object> response = new HashMap<>();
        response.put("asistencias", asistenciasLogradas);
        response.put("porcentaje", porcentaje);
        response.put("apto", aptoParaExamen);

        return ResponseEntity.ok(response);
    }
}