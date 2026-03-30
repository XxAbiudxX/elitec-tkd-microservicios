package pe.elitec.academia_taekwondo.controller;

import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Clase;
import pe.elitec.academia_taekwondo.service.ClaseService;

import java.util.List;

@RestController
@RequestMapping("/api/clases")
public class ClaseController {

    private final ClaseService claseService;

    public ClaseController(ClaseService claseService) {
        this.claseService = claseService;
    }

    // Listar todas
    @GetMapping
    public List<Clase> getAll() {
        return claseService.listarTodas();
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public Clase getById(@PathVariable Long id) {
        return claseService.buscarPorId(id).orElse(null);
    }

    // Registrar nueva
    @PostMapping
    public Clase create(@RequestBody Clase clase) {
        return claseService.guardar(clase);
    }

    // Actualizar
    @PutMapping("/{id}")
    public Clase update(@PathVariable Long id, @RequestBody Clase detalles) {
        return claseService.buscarPorId(id).map(clase -> {
            clase.setNombre(detalles.getNombre());
            clase.setNivelRequerido(detalles.getNivelRequerido());
            clase.setDias(detalles.getDias());
            clase.setHoraInicio(detalles.getHoraInicio());
            clase.setHoraFin(detalles.getHoraFin());
            clase.setProfesor(detalles.getProfesor());
            return claseService.guardar(clase);
        }).orElse(null);
    }

    // Eliminar
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        claseService.eliminar(id);
        return "Clase eliminada correctamente";
    }
}
