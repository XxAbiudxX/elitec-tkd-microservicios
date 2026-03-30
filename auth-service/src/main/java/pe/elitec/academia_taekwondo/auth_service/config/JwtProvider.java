package pe.elitec.academia_taekwondo.auth_service.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {
    // 🛑 Llave secreta blindada (Debe ser larga para que sea segura)
    private final String SECRET_KEY = "TaekwondoElitecSecretKeyParaTokensInquebrantables2026";
    private final long EXPIRATION_TIME = 86400000; // El token dura 1 día (en milisegundos)

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Método que fabrica el pase VIP
    public String generateToken(String email, String rol) {
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol) // Guardamos si es ADMIN, PROFESOR o ALUMNO
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Sellado con la firma secreta
                .compact();
    }
}