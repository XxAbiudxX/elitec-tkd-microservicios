package pe.elitec.academia_taekwondo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "clase")
@Getter
@Setter
public class Clase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idClase;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(length = 20)
    private String nivelRequerido;

    @Column(length = 100)
    private String dias; // Ejemplo: "Lunes, Miércoles, Viernes"

    private String horaInicio;

    private String horaFin;

    @ManyToOne
    @JoinColumn(name = "idProfesor", nullable = false)
    private Profesor profesor;
}
