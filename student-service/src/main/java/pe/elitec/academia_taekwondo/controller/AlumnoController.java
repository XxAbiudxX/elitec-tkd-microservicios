package pe.elitec.academia_taekwondo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Alumno;
import pe.elitec.academia_taekwondo.repository.AlumnoRepository;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    @Autowired
    private AlumnoRepository alumnoRepository;

    // 1. LISTAR TODOS
    @GetMapping
    public List<Alumno> getAllAlumnos() {
        return alumnoRepository.findAll();
    }

    // 2. BUSCAR POR ID (Con manejo de error 404)
    @GetMapping("/{id}")
    public ResponseEntity<Alumno> getAlumnoById(@PathVariable Long id) {
        return alumnoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CREAR ALUMNO
    @PostMapping
    public Alumno createAlumno(@RequestBody Alumno alumno) {
        // Podrías añadir lógica aquí para formatear el nombre antes de guardar
        return alumnoRepository.save(alumno);
    }

    // 4. ACTUALIZAR (Optimizado)
    @PutMapping("/{id}")
    public ResponseEntity<Alumno> updateAlumno(@PathVariable Long id, @RequestBody Alumno details) {
        return alumnoRepository.findById(id)
                .map(alumno -> {
                    alumno.setDni(details.getDni());
                    alumno.setNombre(details.getNombre());
                    alumno.setApellido(details.getApellido());
                    alumno.setFechaNacimiento(details.getFechaNacimiento());
                    alumno.setTelefono(details.getTelefono());
                    alumno.setCorreo(details.getCorreo());
                    alumno.setDireccion(details.getDireccion());
                    alumno.setCintaActual(details.getCintaActual());
                    // Agregamos fechaIngreso si la tienes en tu entidad
                    // alumno.setFechaIngreso(details.getFechaIngreso());

                    Alumno actualizado = alumnoRepository.save(alumno);
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlumno(@PathVariable Long id) {
        return alumnoRepository.findById(id)
                .map(alumno -> {
                    alumnoRepository.delete(alumno);
                    return ResponseEntity.ok().body("Alumno eliminado con éxito");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}