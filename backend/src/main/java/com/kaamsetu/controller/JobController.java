package com.kaamsetu.controller;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.dto.job.*;
import com.kaamsetu.security.UserPrincipal;
import com.kaamsetu.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> createJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JobCreateRequest request) {
        User user = buildUser(principal);
        JobResponse response = jobService.createJob(user, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/employers/me/dashboard")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<EmployerDashboardResponse> getEmployerDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = buildUser(principal);
        EmployerDashboardResponse response = jobService.getEmployerDashboard(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{id}/manage")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> getJobManage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId) {
        User user = buildUser(principal);
        JobResponse response = jobService.getJobForEmployer(user, jobId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'WORKER')")
    public ResponseEntity<JobResponse> getJobDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId) {
        User user = buildUser(principal);
        JobResponse response = jobService.getJobDetail(user, jobId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/jobs/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> updateJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId,
            @Valid @RequestBody JobUpdateRequest request) {
        User user = buildUser(principal);
        JobResponse response = jobService.updateJob(user, jobId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/jobs/{id}/close")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> closeJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID jobId,
            @Valid @RequestBody JobCloseRequest request) {
        User user = buildUser(principal);
        JobResponse response = jobService.closeJob(user, jobId, request);
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
