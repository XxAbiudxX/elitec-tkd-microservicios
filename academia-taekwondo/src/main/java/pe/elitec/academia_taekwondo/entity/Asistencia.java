package pe.elitec.academia_taekwondo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "asistencia")
@Getter
@Setter
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAsistencia;

    @ManyToOne
    @JoinColumn(name = "idAlumno", nullable = false)
    private Alumno alumno;

    @ManyToOne
    @JoinColumn(name = "idClase", nullable = false)
    private Clase clase;

    private LocalDate fecha = LocalDate.now();

    @Enumerated(EnumType.STRING)
    private EstadoAsistencia estado = EstadoAsistencia.Presente;

    public enum EstadoAsistencia {
        Presente,
        Ausente,
        Justificado
    }
}
