package pe.elitec.academia_taekwondo.controller;

import org.springframework.web.bind.annotation.*;
import pe.elitec.academia_taekwondo.entity.Pago;
import pe.elitec.academia_taekwondo.service.PagoService;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping
    public List<Pago> getAll() {
        return pagoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Pago getById(@PathVariable Long id) {
        return pagoService.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public Pago create(@RequestBody Pago pago) {
        return pagoService.guardar(pago);
    }

    @PutMapping("/{id}")
    public Pago update(@PathVariable Long id, @RequestBody Pago detalles) {
        return pagoService.buscarPorId(id).map(p -> {
            p.setAlumno(detalles.getAlumno());
            p.setMatricula(detalles.getMatricula());
            p.setFechaPago(detalles.getFechaPago());
            p.setMonto(detalles.getMonto());
            p.setMetodo(detalles.getMetodo());
            p.setObservacion(detalles.getObservacion());
            return pagoService.guardar(p);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        pagoService.eliminar(id);
        return "Pago eliminado correctamente";
    }
}
