package pe.elitec.academia_taekwondo.attendance_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import pe.elitec.academia_taekwondo.attendance_service.dto.StudentDto;

// "name" debe ser IGUAL a como aparece en Eureka (STUDENT-SERVICE)
@FeignClient(name = "student-service")
public interface StudentClient {

    // Esta ruta debe coincidir con la del StudentController original
    @GetMapping("/api/alumnos/{id}")
    StudentDto obtenerAlumnoPorId(@PathVariable("id") Long id);
}