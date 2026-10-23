package com.kaamsetu.dto.auth;

import com.kaamsetu.domain.enums.UserRole;
import java.util.UUID;

public class AuthResponse {

    private UUID userId;
    private String phoneNumber;
    private UserRole role;
    private String token;
    private Long expiresIn;

    public AuthResponse() {}

    public AuthResponse(UUID userId, String phoneNumber, UserRole role, String token, Long expiresIn) {
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.token = token;
        this.expiresIn = expiresIn;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
}
