package pe.elitec.academia_taekwondo.controller;

import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Asistencia;
import pe.elitec.academia_taekwondo.service.AsistenciaService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping
    public List<Asistencia> getAll() {
        return asistenciaService.listarTodas();
    }

    @GetMapping("/{id}")
    public Asistencia getById(@PathVariable Long id) {
        return asistenciaService.buscarPorId(id).orElse(null);
    }

    @GetMapping("/alumno/{idAlumno}")
    public List<Asistencia> getByAlumno(@PathVariable Long idAlumno) {
        return asistenciaService.listarPorAlumno(idAlumno);
    }

    @GetMapping("/clase/{idClase}")
    public List<Asistencia> getByClase(@PathVariable Long idClase) {
        return asistenciaService.listarPorClase(idClase);
    }

    @GetMapping("/fecha/{fecha}")
    public List<Asistencia> getByFecha(@PathVariable String fecha) {
        return asistenciaService.listarPorFecha(LocalDate.parse(fecha));
    }

    @PostMapping
    public Asistencia create(@RequestBody Asistencia asistencia) {
        return asistenciaService.guardar(asistencia);
    }

    @PutMapping("/{id}")
    public Asistencia update(@PathVariable Long id, @RequestBody Asistencia detalles) {
        return asistenciaService.buscarPorId(id).map(a -> {
            a.setAlumno(detalles.getAlumno());
            a.setClase(detalles.getClase());
            a.setFecha(detalles.getFecha());
            a.setEstado(detalles.getEstado());
            return asistenciaService.guardar(a);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        asistenciaService.eliminar(id);
        return "Asistencia eliminada correctamente";
    }
}
