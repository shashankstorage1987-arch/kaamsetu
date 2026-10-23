package com.kaamsetu.controller;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.dto.job.*;
import com.kaamsetu.security.UserPrincipal;
import com.kaamsetu.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/jobs/{id}/interest")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<JobInterestResponse> expressInterest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId) {
        User user = buildUser(principal);
        JobInterestResponse response = applicationService.expressInterest(user, jobId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/workers/me/applications")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<WorkerApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = buildUser(principal);
        List<WorkerApplicationResponse> response = applicationService.getWorkerApplications(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{id}/applicants")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<ApplicantResponse>> getJobApplicants(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId) {
        User user = buildUser(principal);
        List<ApplicantResponse> response = applicationService.getJobApplicants(user, jobId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/jobs/{id}/applicants/{workerId}/reject")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Void> rejectApplicant(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId,
            @PathVariable("workerId") UUID workerId) {
        User user = buildUser(principal);
        applicationService.rejectApplicant(user, jobId, workerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/jobs/{id}/hire")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<HireConfirmationResponse> hireWorker(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId,
            @Valid @RequestBody HireRequest request) {
        User user = buildUser(principal);
        HireConfirmationResponse response = applicationService.hireWorker(user, jobId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/hire-confirmations/me")
    @PreAuthorize("hasAnyRole('WORKER', 'EMPLOYER')")
    public ResponseEntity<List<HireConfirmationResponse>> getMyHireConfirmations(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = buildUser(principal);
        if (user.getRole() == com.kaamsetu.domain.enums.UserRole.EMPLOYER) {
            return ResponseEntity.ok(applicationService.getEmployerHireConfirmations(user));
        }
        List<HireConfirmationResponse> response = applicationService.getWorkerHireConfirmations(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employers/me/hired-workers")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<HireConfirmationResponse>> getEmployerHiredWorkers(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = buildUser(principal);
        List<HireConfirmationResponse> response = applicationService.getEmployerHireConfirmations(user);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/hire-confirmations/{id}/response")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<HireConfirmationResponse> respondToHireConfirmation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID confirmationId,
            @Valid @RequestBody HireResponseRequest request) {
        User user = buildUser(principal);
        HireConfirmationResponse response = applicationService.respondToHireConfirmation(user, confirmationId, request);
        return ResponseEntity.ok(response);
    }

    private User buildUser(UserPrincipal principal) {
        if (principal == null) return null;
        User user = new User();
        user.setId(principal.getId());
        user.setRole(principal.getRole());
        user.setPhoneNumber(principal.getPhoneNumber());
        return user;
    }
}
