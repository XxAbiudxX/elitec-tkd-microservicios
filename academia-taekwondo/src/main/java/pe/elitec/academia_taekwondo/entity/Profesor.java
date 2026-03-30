package pe.elitec.academia_taekwondo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "profesor")
@Getter
@Setter
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProfesor;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String apellido;

    @Column(length = 20)
    private String telefono;

    @Column(length = 100, unique = true)
    private String correo;

    @Column(length = 50)
    private String especialidad;
}
