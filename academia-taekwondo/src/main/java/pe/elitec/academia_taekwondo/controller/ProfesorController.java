package pe.elitec.academia_taekwondo.controller;

import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Profesor;
import pe.elitec.academia_taekwondo.service.ProfesorService;

import java.util.List;

@RestController
@RequestMapping("/api/profesores")
public class ProfesorController {

    private final ProfesorService profesorService;

    public ProfesorController(ProfesorService profesorService) {
        this.profesorService = profesorService;
    }

    // Listar todos
    @GetMapping
    public List<Profesor> getAll() {
        return profesorService.listarTodos();
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public Profesor getById(@PathVariable Long id) {
        return profesorService.buscarPorId(id).orElse(null);
    }

    // Registrar nuevo
    @PostMapping
    public Profesor create(@RequestBody Profesor profesor) {
        return profesorService.guardar(profesor);
    }

    // Actualizar
    @PutMapping("/{id}")
    public Profesor update(@PathVariable Long id, @RequestBody Profesor detalles) {
        return profesorService.buscarPorId(id).map(profesor -> {
            profesor.setNombre(detalles.getNombre());
            profesor.setApellido(detalles.getApellido());
            profesor.setTelefono(detalles.getTelefono());
            profesor.setCorreo(detalles.getCorreo());
            profesor.setEspecialidad(detalles.getEspecialidad());
            return profesorService.guardar(profesor);
        }).orElse(null);
    }

    // Eliminar
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        profesorService.eliminar(id);
        return "Profesor eliminado correctamente";
    }
}
