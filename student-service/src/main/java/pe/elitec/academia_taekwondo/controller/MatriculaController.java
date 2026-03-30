package pe.elitec.academia_taekwondo.controller;

import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Matricula;
import pe.elitec.academia_taekwondo.service.MatriculaService;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    private final MatriculaService matriculaService;

    public MatriculaController(MatriculaService matriculaService) {
        this.matriculaService = matriculaService;
    }

    @GetMapping
    public List<Matricula> getAll() {
        return matriculaService.listarTodas();
    }

    @GetMapping("/{id}")
    public Matricula getById(@PathVariable Long id) {
        return matriculaService.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public Matricula create(@RequestBody Matricula matricula) {
        return matriculaService.guardar(matricula);
    }

    @PutMapping("/{id}")
    public Matricula update(@PathVariable Long id, @RequestBody Matricula detalles) {
        return matriculaService.buscarPorId(id).map(m -> {
            m.setAlumno(detalles.getAlumno());

            // --- CORRECCIÓN AQUÍ ---
            // Cambiamos 'setClase' por 'setIdClase' porque ahora trabajamos con
            // Microservicios
            m.setIdClase(detalles.getIdClase());
            // -----------------------

            m.setFechaMatricula(detalles.getFechaMatricula());
            m.setFechaVencimiento(detalles.getFechaVencimiento());
            m.setEstado(detalles.getEstado());
            return matriculaService.guardar(m);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        matriculaService.eliminar(id);
        return "Matrícula eliminada correctamente";
    }
}