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

    @GetMapping
    public List<Sede> listarSedes() {
        return sedeRepository.findAll();
    }

    @PostMapping
    public Sede registrarSede(@RequestBody Sede sede) {
        return sedeRepository.save(sede);
    }
}