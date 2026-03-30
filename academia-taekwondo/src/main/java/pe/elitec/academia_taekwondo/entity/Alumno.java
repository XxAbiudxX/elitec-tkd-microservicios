package pe.elitec.academia_taekwondo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAlumno;

    @Column(unique = true, nullable = false, length = 15)
    private String dni;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String apellido;

    private LocalDate fechaNacimiento;
    private String telefono;
    private String correo;
    private String direccion;

    @Column(nullable = false)
    private String cintaActual = "Blanca";

    private LocalDate fechaIngreso = LocalDate.now();
}
