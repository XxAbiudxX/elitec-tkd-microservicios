package pe.elitec.academia_taekwondo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Alumno;
import pe.elitec.academia_taekwondo.repository.AlumnoRepository;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @GetMapping
    public List<Alumno> getAllAlumnos() {
        return alumnoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Alumno getAlumnoById(@PathVariable Long id) {
        return alumnoRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Alumno createAlumno(@RequestBody Alumno alumno) {
        return alumnoRepository.save(alumno);
    }

    @PutMapping("/{id}")
    public Alumno updateAlumno(@PathVariable Long id, @RequestBody Alumno alumnoDetails) {
        Alumno alumno = alumnoRepository.findById(id).orElse(null);
        if (alumno != null) {
            alumno.setDni(alumnoDetails.getDni());
            alumno.setNombre(alumnoDetails.getNombre());
            alumno.setApellido(alumnoDetails.getApellido());
            alumno.setFechaNacimiento(alumnoDetails.getFechaNacimiento());
            alumno.setTelefono(alumnoDetails.getTelefono());
            alumno.setCorreo(alumnoDetails.getCorreo());
            alumno.setDireccion(alumnoDetails.getDireccion());
            alumno.setCintaActual(alumnoDetails.getCintaActual());
            return alumnoRepository.save(alumno);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public String deleteAlumno(@PathVariable Long id) {
        alumnoRepository.deleteById(id);
        return "Alumno eliminado con éxito";
    }
}
