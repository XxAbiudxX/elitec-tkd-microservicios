package pe.elitec.academia_taekwondo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Sede;
import pe.elitec.academia_taekwondo.repository.SedeRepository;
import java.util.List;

@RestController
@RequestMapping("/api/sedes")
public class SedeController {

    @Autowired
    private SedeRepository sedeRepository;

    @GetMapping
    public List<Sede> listarSedes() {
        return sedeRepository.findAll();
    }

    @PostMapping
    public Sede registrarSede(@RequestBody Sede sede) {
        return sedeRepository.save(sede);
    }

    @PutMapping("/{id}")
    public Sede actualizarSede(@PathVariable Long id, @RequestBody Sede sedeActualizada) {
        return sedeRepository.findById(id).map(sede -> {
            sede.setNombre(sedeActualizada.getNombre());
            sede.setDireccion(sedeActualizada.getDireccion());
            sede.setEncargado(sedeActualizada.getEncargado());
            return sedeRepository.save(sede);
        }).orElseThrow(() -> new RuntimeException("Sede no encontrada"));
    }

    @DeleteMapping("/{id}")
    public void eliminarSede(@PathVariable Long id) {
        sedeRepository.deleteById(id);
    }
}