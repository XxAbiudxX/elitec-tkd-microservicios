package pe.elitec.academia_taekwondo.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "alumno")
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alumno")
    private Long idAlumno;

    @Column(unique = true, nullable = false, length = 15)
    private String dni;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String apellido;

    @Column(name = "fecha_nacimiento")
    @JsonFormat(pattern = "yyyy-MM-dd") // 🟢 CRÍTICO: Para que Java entienda el input de la web
    private LocalDate fechaNacimiento;

    private String telefono;
    private String correo;
    private String direccion;

    @Column(name = "cinta_actual", nullable = false)
    private String cintaActual = "Blanca";

    @Column(name = "fecha_ingreso")
    @JsonFormat(pattern = "yyyy-MM-dd") // 🟢 CRÍTICO: Para el formato de ingreso
    private LocalDate fechaIngreso = LocalDate.now();
}