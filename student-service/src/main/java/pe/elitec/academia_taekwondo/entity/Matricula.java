package pe.elitec.academia_taekwondo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "matricula")
@Getter
@Setter
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMatricula;

    @ManyToOne
    @JoinColumn(name = "id_alumno", nullable = false)
    private Alumno alumno;

    @Column(name = "id_clase", nullable = false)
    private Long idClase;

    private LocalDate fechaMatricula = LocalDate.now();

    private LocalDate fechaVencimiento;

    @Enumerated(EnumType.STRING)
    private EstadoMatricula estado = EstadoMatricula.Activa;

    public enum EstadoMatricula {
        Activa,
        Vencida,
        Congelada
    }
}