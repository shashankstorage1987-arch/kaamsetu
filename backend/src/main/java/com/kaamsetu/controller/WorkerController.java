package com.kaamsetu.controller;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.dto.profile.WorkerProfileResponse;
import com.kaamsetu.dto.profile.WorkerProfileUpdateRequest;
import com.kaamsetu.security.UserPrincipal;
import com.kaamsetu.service.WorkerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workers")
public class WorkerController {

    private final WorkerProfileService workerProfileService;

    public WorkerController(WorkerProfileService workerProfileService) {
        this.workerProfileService = workerProfileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        WorkerProfileResponse response = workerProfileService.getWorkerProfile(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WorkerProfileUpdateRequest request) {
        User user = new User();
        user.setId(principal.getId());
        user.setRole(principal.getRole());
        user.setPhoneNumber(principal.getPhoneNumber());

        WorkerProfileResponse response = workerProfileService.updateWorkerProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/photo")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> uploadPhoto(
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

        WorkerProfileUpdateRequest request = new WorkerProfileUpdateRequest();
        request.setPhotoUrl(photoUrl);

        WorkerProfileResponse response = workerProfileService.updateWorkerProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<com.kaamsetu.dto.profile.WorkerAvailabilityResponse> getMyAvailability(
            @AuthenticationPrincipal UserPrincipal principal) {
        com.kaamsetu.dto.profile.WorkerAvailabilityResponse response = workerProfileService.getAvailability(principal.getId());
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/me/availability", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<com.kaamsetu.dto.profile.WorkerAvailabilityResponse> updateMyAvailability(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody com.kaamsetu.dto.profile.WorkerAvailabilityRequest request) {
        User user = new User();
        user.setId(principal.getId());
        user.setRole(principal.getRole());
        user.setPhoneNumber(principal.getPhoneNumber());

        com.kaamsetu.dto.profile.WorkerAvailabilityResponse response = workerProfileService.setAvailability(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerProfileResponse> getWorkerProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") java.util.UUID workerId) {
        java.util.UUID viewingUserId = principal != null ? principal.getId() : null;
        WorkerProfileResponse response = workerProfileService.getWorkerProfile(viewingUserId, workerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reveal-contact")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<com.kaamsetu.dto.profile.ContactRevealResponse> revealContact(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") java.util.UUID workerId) {
        User employer = new User();
        employer.setId(principal.getId());
        employer.setRole(principal.getRole());
        employer.setPhoneNumber(principal.getPhoneNumber());

        com.kaamsetu.dto.profile.ContactRevealResponse response = workerProfileService.revealContact(employer, workerId);
        return ResponseEntity.ok(response);
    }
}
