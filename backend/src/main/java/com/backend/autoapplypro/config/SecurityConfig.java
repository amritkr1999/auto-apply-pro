package com.backend.autoapplypro.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable configured CORS support
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/feedback/public").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/billing/status").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/profiles/candidate/*/resume", "/api/v1/profiles/candidate/*/profile/*/resume", "/api/users/profile/cover-letter").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/feedback/status").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/feedback").hasRole("ADMIN")
                .requestMatchers(
                    "/api/v1/auth/**",
                    "/api/v1/public/**",
                    "/api/v1/marketing/**",
                    "/api/v1/outreach/oauth2/callback",
                    "/api/v1/billing/plans",
                    "/api/v1/billing/status",
                    "/api/v1/billing/webhook",
                    "/api/v1/payments/telegram-webhook",
                    "/api/v1/jobs/scraper/**",
                    "/api/v1/jobs/postings/**",
                    "/api/v1/govt-exams/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/error"
                ).permitAll()
                .requestMatchers("/api/drafts/llm-stats").hasRole("ADMIN")
                .requestMatchers("/api/v1/learning/submissions/pending", "/api/v1/learning/submissions/*/review").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        java.util.List<String> origins = java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
        origins.add("chrome-extension://*");
        origins.add("http://localhost:*");
        origins.add("http://127.0.0.1:*");
        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow all headers to prevent preflight rejection from extra headers
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setExposedHeaders(java.util.Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}
