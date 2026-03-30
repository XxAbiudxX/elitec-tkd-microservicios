package pe.elitec.academia_taekwondo.attendance_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients; // <--- IMPORTANTE

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients // <--- ¡AGREGA ESTO!
public class AttendanceServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AttendanceServiceApplication.class, args);
	}

}