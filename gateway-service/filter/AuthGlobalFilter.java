package pe.elitec.academia_taekwondo.gateway_service.filter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import pe.elitec.academia_taekwondo.gateway_service.util.JwtUtil;
import reactor.core.publisher.Mono;

@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        System.out.println("🛡️ Gateway interceptó petición hacia: " + request.getURI().getPath());

        // 1. ¿Va a la ventanilla de Login? (O a Eureka) ¡Déjalo pasar!
        if (request.getURI().getPath().contains("/api/auth") || request.getURI().getPath().contains("/eureka")) {
            System.out.println("✅ Ruta pública permitida.");
            return chain.filter(exchange);
        }

        // 2. Comprobar si trae el encabezado "Authorization"
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            System.out.println("❌ Acceso Denegado: No trae Token JWT.");
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // 3. Validar el sello oficial
                jwtUtil.validateToken(token);
                System.out.println("✅ Token válido. ¡Pase VIP aceptado!");
            } catch (Exception e) {
                System.out.println("❌ Acceso Denegado: Token inválido o expirado. Razón: " + e.getMessage());
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        } else {
            System.out.println("❌ Acceso Denegado: El Token no tiene el formato 'Bearer '.");
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // 4. ¡Todo en orden! Pasa al microservicio.
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}