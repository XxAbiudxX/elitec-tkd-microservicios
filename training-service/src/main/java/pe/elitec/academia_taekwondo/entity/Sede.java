package pe.elitec.academia_taekwondo.student_service.entity; // Mantendremos el paquete por ahora para no romper nada

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "sede")
public class Sede {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSede;

    private String nombre; // Ej: "Sede Central", "Sede Norte"
    private String direccion; // Ej: "Av. La Marina 123"
    private String telefono;
    private String encargado; // Nombre del administrador de la sede
}