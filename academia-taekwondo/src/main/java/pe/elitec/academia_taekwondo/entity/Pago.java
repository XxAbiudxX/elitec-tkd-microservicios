package pe.elitec.academia_taekwondo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pago")
@Getter
@Setter
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPago;

    @ManyToOne
    @JoinColumn(name = "idMatricula", nullable = false)
    private Matricula matricula;

    @ManyToOne
    @JoinColumn(name = "idAlumno", nullable = false)
    private Alumno alumno;

    private LocalDate fechaPago = LocalDate.now();

    @Column(nullable = false)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodo = MetodoPago.Efectivo;

    private String observacion;

    public enum MetodoPago {
        Efectivo,
        Tarjeta,
        Transferencia
    }
}
