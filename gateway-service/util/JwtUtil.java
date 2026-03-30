package pe.elitec.academia_taekwondo.gateway_service.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    // 🛑 ¡DEBE SER EXACTAMENTE LA MISMA LLAVE DEL AUTH-SERVICE!
    private final String SECRET_KEY = "TaekwondoElitecSecretKeyParaTokensInquebrantables2026";

    public void validateToken(final String token) {
        // Esto intentará leer el token. Si está modificado, caducado o es falso,
        // ¡explotará y lanzará un error!
        Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token);
    }
}