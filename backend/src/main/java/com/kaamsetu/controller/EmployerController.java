package com.kaamsetu.controller;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.dto.profile.EmployerProfileResponse;
import com.kaamsetu.dto.profile.EmployerProfileUpdateRequest;
import com.kaamsetu.security.UserPrincipal;
import com.kaamsetu.service.EmployerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employers")
public class EmployerController {

    private final EmployerProfileService employerProfileService;

    public EmployerController(EmployerProfileService employerProfileService) {
        this.employerProfileService = employerProfileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<EmployerProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        EmployerProfileResponse response = employerProfileService.getEmployerProfile(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<EmployerProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EmployerProfileUpdateRequest request) {
        User user = new User();
        user.setId(principal.getId());
        user.setRole(principal.getRole());
        user.setPhoneNumber(principal.getPhoneNumber());

        EmployerProfileResponse response = employerProfileService.updateEmployerProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/photo")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<EmployerProfileResponse> uploadPhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody java.util.Map<String, String> body) {
        User user = new User();
        user.setId(principal.getId());
        user.setRole(principal.getRole());
        user.setPhoneNumber(principal.getPhoneNumber());

        String photoUrl = body != null ? (body.get("photo_url") != null ? body.get("photo_url") : body.get("photoUrl")) : null;
        if (photoUrl == null || photoUrl.isBlank()) {
            throw new com.kaamsetu.exception.BadRequestException("photo_url is required");
        }

        EmployerProfileUpdateRequest request = new EmployerProfileUpdateRequest();
        request.setPhotoUrl(photoUrl);

        EmployerProfileResponse response = employerProfileService.updateEmployerProfile(user, request);
        return ResponseEntity.ok(response);
    }
}
