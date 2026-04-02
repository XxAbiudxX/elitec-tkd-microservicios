package pe.elitec.academia_taekwondo.training_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "horario")
public class Horario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Aquí guardaremos el ID de la Sede (por ahora como un número, ya que la
    // entidad Sede vive en otro microservicio)
    @Column(name = "sede_id", nullable = false)
    private Long sedeId;

    // Ejemplo: "Lunes", "Martes"
    @Column(nullable = false)
    private String dia;

    // Guardaremos la hora en formato HH:mm
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;
}