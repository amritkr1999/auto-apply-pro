package com.backend.autoapplypro.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class JwtUtil {

    private final Algorithm algorithm;
    private final JWTVerifier verifier;

    @Value("${app.jwt.expiration-ms:86400000}") // Default 24 hours
    private long expirationMs;

    public JwtUtil(@Value("${app.jwt.secret:auto-apply-pro-jwt-super-secret-key-change-in-production}") String secret) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.verifier = JWT.require(algorithm).build();
    }

    public String generateToken(Long userId, String email, String role) {
        return JWT.create()
                .withSubject(email)
                .withClaim("userId", userId)
                .withClaim("role", role)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationMs))
                .sign(algorithm);
    }

    public DecodedJWT verifyToken(String token) {
        return verifier.verify(token);
    }

    public String getEmailFromToken(DecodedJWT jwt) {
        return jwt.getSubject();
    }

    public Long getUserIdFromToken(DecodedJWT jwt) {
        return jwt.getClaim("userId").asLong();
    }

    public String getRoleFromToken(DecodedJWT jwt) {
        return jwt.getClaim("role").asString();
    }
}
