package pe.elitec.academia_taekwondo.training_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.training_service.entity.Horario;
import pe.elitec.academia_taekwondo.training_service.repository.HorarioRepository;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    @Autowired
    private HorarioRepository horarioRepository;

    // Listar todos los horarios
    @GetMapping
    public List<Horario> obtenerHorarios() {
        return horarioRepository.findAll();
    }

    // Guardar un nuevo horario (Lo que hace el botón "Publicar Horario")
    @PostMapping
    public ResponseEntity<Horario> crearHorario(@RequestBody Horario horario) {
        Horario nuevoHorario = horarioRepository.save(horario);
        return ResponseEntity.ok(nuevoHorario);
    }

    // Eliminar un horario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHorario(@PathVariable Long id) {
        if (!horarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        horarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}