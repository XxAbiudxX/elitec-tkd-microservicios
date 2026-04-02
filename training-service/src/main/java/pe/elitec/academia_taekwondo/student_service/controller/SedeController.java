package pe.elitec.academia_taekwondo.student_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.student_service.entity.Sede;
import pe.elitec.academia_taekwondo.student_service.repository.SedeRepository;

import java.util.List;

@RestController
@RequestMapping("/api/sedes")
public class SedeController {

    @Autowired
    private SedeRepository sedeRepository;

    // --- Listar todas las sedes ---
    @GetMapping
    public List<Sede> listarSedes() {
        return sedeRepository.findAll();
    }

    // --- Crear una nueva sede ---
    @PostMapping
    public Sede registrarSede(@RequestBody Sede sede) {
        return sedeRepository.save(sede);
    }

    // --- Actualizar una sede existente ---
    @PutMapping("/{id}")
    public Sede actualizarSede(@PathVariable Long id, @RequestBody Sede sedeActualizada) {
        return sedeRepository.findById(id).map(sede -> {
            sede.setNombre(sedeActualizada.getNombre());
            sede.setDireccion(sedeActualizada.getDireccion());
            sede.setTelefono(sedeActualizada.getTelefono());
            sede.setEncargado(sedeActualizada.getEncargado());
            return sedeRepository.save(sede);
        }).orElseThrow(() -> new RuntimeException("Sede no encontrada con ID: " + id));
    }

    // --- Eliminar una sede ---
    @DeleteMapping("/{id}")
    public void eliminarSede(@PathVariable Long id) {
        sedeRepository.deleteById(id);
    }
}