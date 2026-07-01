package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.dto.AuthResponse;
import com.backend.autoapplypro.modules.users.dto.LoginRequest;
import com.backend.autoapplypro.modules.users.dto.RegisterRequest;
import com.backend.autoapplypro.modules.users.dto.ForgotPasswordRequest;
import com.backend.autoapplypro.modules.users.dto.ResetPasswordRequest;
import com.backend.autoapplypro.modules.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            return new ResponseEntity<>(userService.register(request), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(AuthResponse.builder().token(e.getMessage()).build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(userService.login(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthResponse.builder().token(e.getMessage()).build());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            userService.initiatePasswordReset(request);
            return ResponseEntity.ok(java.util.Map.of("message", "If the email is registered, we have sent a reset password link to it."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request);
            return ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
