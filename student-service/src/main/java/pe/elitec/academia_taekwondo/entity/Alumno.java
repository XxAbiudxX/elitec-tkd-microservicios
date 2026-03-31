package pe.elitec.academia_taekwondo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "alumno") // Aseguramos que apunte a la tabla correcta
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alumno") // Coincide con tu captura de Neon
    private Long idAlumno;

    @Column(unique = true, nullable = false, length = 15)
    private String dni;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String apellido;

    @Column(name = "fecha_nacimiento") // Mapeo exacto para Postgres
    private LocalDate fechaNacimiento;

    private String telefono;
    private String correo;
    private String direccion;

    @Column(name = "cinta_actual", nullable = false) // Mapeo exacto para Postgres
    private String cintaActual = "Blanca";

    @Column(name = "fecha_ingreso") // Mapeo exacto para Postgres
    private LocalDate fechaIngreso = LocalDate.now();
}