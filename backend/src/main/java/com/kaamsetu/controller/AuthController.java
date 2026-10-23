package com.kaamsetu.controller;

import com.kaamsetu.dto.auth.*;
import com.kaamsetu.dto.common.ApiResponse;
import com.kaamsetu.security.UserPrincipal;
import com.kaamsetu.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup/worker")
    public ResponseEntity<AuthResponse> signupWorker(@Valid @RequestBody WorkerSignUpRequest request) {
        AuthResponse response = authService.signupWorker(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/signup/employer")
    public ResponseEntity<AuthResponse> signupEmployer(@Valid @RequestBody EmployerSignUpRequest request) {
        AuthResponse response = authService.signupEmployer(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-pin/request-otp")
    public ResponseEntity<OtpResponse> requestForgotPinOtp(@Valid @RequestBody ForgotPinRequestOtpRequest request) {
        OtpResponse response = authService.requestForgotPinOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-pin/reset")
    public ResponseEntity<ApiResponse<String>> resetForgotPin(@Valid @RequestBody ForgotPinResetRequest request) {
        authService.resetForgotPin(request);
        return ResponseEntity.ok(ApiResponse.success("PIN reset successfully. Please log in with your new PIN.", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) LogoutRequest logoutRequest,
            HttpServletRequest request) {
        String jwtToken = extractJwtToken(request);
        authService.logout(principal != null ? new com.kaamsetu.domain.entity.User() {{ setId(principal.getId()); }} : null, jwtToken, logoutRequest);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    private String extractJwtToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
