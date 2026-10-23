package com.kaamsetu.service;

import com.kaamsetu.domain.entity.EmployerProfile;
import com.kaamsetu.domain.entity.Job;
import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.enums.ApplicationStatus;
import com.kaamsetu.domain.enums.JobCloseReason;
import com.kaamsetu.domain.enums.JobStatus;
import com.kaamsetu.domain.enums.UserRole;
import com.kaamsetu.dto.job.*;
import com.kaamsetu.exception.BadRequestException;
import com.kaamsetu.exception.ResourceNotFoundException;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.repository.EmployerProfileRepository;
import com.kaamsetu.repository.JobInterestRepository;
import com.kaamsetu.repository.JobRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final JobInterestRepository jobInterestRepository;
    private final com.kaamsetu.repository.HireConfirmationRepository hireConfirmationRepository;
    private final AuditLogService auditLogService;

    public JobService(
            JobRepository jobRepository,
            EmployerProfileRepository employerProfileRepository,
            JobInterestRepository jobInterestRepository,
            com.kaamsetu.repository.HireConfirmationRepository hireConfirmationRepository,
            AuditLogService auditLogService) {
        this.jobRepository = jobRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.jobInterestRepository = jobInterestRepository;
        this.hireConfirmationRepository = hireConfirmationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public JobResponse createJob(User actor, JobCreateRequest request) {
        if (actor == null || actor.getRole() != UserRole.EMPLOYER) {
            throw new AccessDeniedException("Only employers can create jobs");
        }

        EmployerProfile employerProfile = employerProfileRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));

        if (request.getSalary() == null || request.getSalary() < 1000 || request.getSalary() > 1000000) {
            throw new BadRequestException("Monthly salary must be between ₹1,000 and ₹10,00,000");
        }
        if (request.getExperienceRequiredYears() != null &&
                (request.getExperienceRequiredYears().compareTo(BigDecimal.ZERO) < 0 || request.getExperienceRequiredYears().compareTo(new BigDecimal("50.0")) > 0)) {
            throw new BadRequestException("Experience required must be between 0 and 50 years");
        }
        if (request.getRadiusKm() != null &&
                (request.getRadiusKm().compareTo(new BigDecimal("1.0")) < 0 || request.getRadiusKm().compareTo(new BigDecimal("500.0")) > 0)) {
            throw new BadRequestException("Radius must be between 1.0 KM and 500.0 KM");
        }

        Job job = new Job();
        job.setEmployerProfile(employerProfile);
        job.setTrade(request.getTrade());
        job.setProfession(request.getProfession());
        job.setExperienceRequiredYears(request.getExperienceRequiredYears() != null ? request.getExperienceRequiredYears() : BigDecimal.ZERO);
        job.setSalary(request.getSalary());
        job.setShift(request.getShift());
        job.setTiming(request.getTiming());
        job.setRadiusKm(request.getRadiusKm() != null ? request.getRadiusKm() : new BigDecimal("1.0"));
        job.setStatus(JobStatus.ACTIVE);
        job.setLocation(employerProfile.getLocation());

        job = jobRepository.save(job);

        auditLogService.log(actor, "JOB_POSTED",
                "{\"job_id\":\"" + job.getId() + "\",\"trade\":\"" + job.getTrade() + "\",\"profession\":\"" + job.getProfession() + "\"}");

        return mapToResponse(job);
    }

    @Transactional(readOnly = true)
    public EmployerDashboardResponse getEmployerDashboard(User actor) {
        if (actor == null || actor.getRole() != UserRole.EMPLOYER) {
            throw new AccessDeniedException("Only employers can view dashboard");
        }

        long activeCount = jobRepository.countByEmployerProfileUserIdAndStatus(actor.getId(), JobStatus.ACTIVE);
        long closedCount = jobRepository.countByEmployerProfileUserIdAndStatus(actor.getId(), JobStatus.CLOSED);

        long totalApplied = jobInterestRepository.countByJobEmployerProfileUserId(actor.getId());
        long totalSelected = jobInterestRepository.countByJobEmployerProfileUserIdAndStatus(actor.getId(), com.kaamsetu.domain.enums.ApplicationStatus.HIRED);
        long totalRejected = jobInterestRepository.countByJobEmployerProfileUserIdAndStatus(actor.getId(), com.kaamsetu.domain.enums.ApplicationStatus.NOT_SELECTED);

        List<Job> jobs = jobRepository.findByEmployerProfileUserIdOrderByCreatedAtDesc(actor.getId());
        List<JobResponse> jobResponses = jobs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new EmployerDashboardResponse((int) activeCount, (int) closedCount, (int) totalApplied, (int) totalSelected, (int) totalRejected, jobResponses);
    }

    @Transactional(readOnly = true)
    public JobResponse getJobForEmployer(User actor, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerProfile().getUserId().equals(actor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job");
        }

        return mapToResponse(job);
    }

    @Transactional(readOnly = true)
    public JobResponse getJobDetail(User actor, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        boolean hasApplied = false;
        if (actor != null && actor.getRole() == UserRole.WORKER) {
            hasApplied = jobInterestRepository.findByJobIdAndWorkerProfileUserId(jobId, actor.getId()).isPresent();
        }

        if (actor != null && actor.getRole() == UserRole.EMPLOYER) {
            if (!job.getEmployerProfile().getUserId().equals(actor.getId())) {
                throw new AccessDeniedException("Access denied: You do not own this job");
            }
        } else if (actor != null && actor.getRole() == UserRole.WORKER) {
            if (job.getStatus() != JobStatus.ACTIVE && !hasApplied) {
                throw new AccessDeniedException("Access denied: Job is no longer active");
            }
        }

        JobResponse res = mapToResponse(job);
        if (actor != null && actor.getRole() == UserRole.WORKER) {
            res.setHasApplied(hasApplied);
        }
        return res;
    }

    @Transactional(readOnly = true)
    public List<JobResponse> searchJobsForWorker(User workerUser, Double lat, Double lon, TradeType trade, ProfessionType profession, BigDecimal radiusKm) {
        List<Job> jobs = null;
        double effectiveKm = radiusKm != null ? radiusKm.doubleValue() : 50.0;
        boolean isUnconstrained = effectiveKm >= 500.0;

        if (lat != null && lon != null) {
            if (isUnconstrained) {
                jobs = jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.ACTIVE);
            } else {
                double radiusMeters = effectiveKm * 1000.0;
                jobs = jobRepository.findNearbyActiveJobs(lat, lon, radiusMeters);
            }
        } else {
            jobs = jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.ACTIVE);
        }

        if (jobs == null) {
            jobs = Collections.emptyList();
        }

        Set<UUID> rejectedJobIds = (workerUser != null)
                ? jobInterestRepository.findByWorkerProfileUserIdAndStatus(workerUser.getId(), ApplicationStatus.NOT_SELECTED)
                        .stream()
                        .map(ji -> ji.getJob().getId())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return jobs.stream()
                .filter(j -> j.getStatus() == JobStatus.ACTIVE)
                .filter(j -> trade == null || j.getTrade() == trade)
                .filter(j -> profession == null || j.getProfession() == profession)
                .filter(j -> workerUser == null || !rejectedJobIds.contains(j.getId()))
                .filter(j -> {
                    if (isUnconstrained || lat == null || lon == null || j.getLocation() == null) {
                        return true;
                    }
                    double dist = calculateHaversineDistanceKm(lat, lon, j.getLocation().getY(), j.getLocation().getX());
                    return dist <= effectiveKm;
                })
                .map(job -> {
                    JobResponse res = mapToResponse(job);
                    if (workerUser != null) {
                        boolean hasApplied = jobInterestRepository.findByJobIdAndWorkerProfileUserId(job.getId(), workerUser.getId()).isPresent();
                        res.setHasApplied(hasApplied);
                    }
                    if (lat != null && lon != null && job.getLocation() != null) {
                        double distanceKm = calculateHaversineDistanceKm(lat, lon, job.getLocation().getY(), job.getLocation().getX());
                        res.setDistanceKm(Math.round(distanceKm * 10.0) / 10.0);
                    }
                    return res;
                })
                .collect(Collectors.toList());
    }

    private double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth radius in KM
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Transactional
    public JobResponse updateJob(User actor, UUID jobId, JobUpdateRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerProfile().getUserId().equals(actor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job");
        }

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new BadRequestException("Cannot edit a closed job");
        }

        if (request.getExperienceRequiredYears() != null) {
            if (request.getExperienceRequiredYears().compareTo(BigDecimal.ZERO) < 0 || request.getExperienceRequiredYears().compareTo(new BigDecimal("50.0")) > 0) {
                throw new BadRequestException("Experience required must be between 0 and 50 years");
            }
            job.setExperienceRequiredYears(request.getExperienceRequiredYears());
        }

        if (request.getSalary() != null) {
            if (request.getSalary() < 1000 || request.getSalary() > 1000000) {
                throw new BadRequestException("Monthly salary must be between ₹1,000 and ₹10,00,000");
            }
            job.setSalary(request.getSalary());
        }

        if (request.getShift() != null) {
            job.setShift(request.getShift());
        }

        if (request.getTiming() != null) {
            job.setTiming(request.getTiming());
        }

        if (request.getRadiusKm() != null) {
            if (request.getRadiusKm().compareTo(new BigDecimal("1.0")) < 0 || request.getRadiusKm().compareTo(new BigDecimal("500.0")) > 0) {
                throw new BadRequestException("Radius must be between 1.0 KM and 500.0 KM");
            }
            job.setRadiusKm(request.getRadiusKm());
        }

        job = jobRepository.save(job);

        auditLogService.log(actor, "JOB_UPDATED", "{\"job_id\":\"" + job.getId() + "\"}");

        return mapToResponse(job);
    }

    @Transactional
    public JobResponse closeJob(User actor, UUID jobId, JobCloseRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerProfile().getUserId().equals(actor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job");
        }

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new BadRequestException("Job is already closed");
        }

        JobCloseReason reason = request.getCloseReason();
        if (reason == null || reason == JobCloseReason.HIRED_VIA_KAAMSETU) {
            throw new BadRequestException("Invalid close reason for non-hire closure. HIRED_VIA_KAAMSETU is prohibited on this endpoint");
        }

        job.setStatus(JobStatus.CLOSED);
        job.setCloseReason(reason);

        job = jobRepository.saveAndFlush(job);

        auditLogService.log(actor, "JOB_CLOSED", "{\"job_id\":\"" + job.getId() + "\",\"close_reason\":\"" + reason + "\"}");

        return mapToResponse(job);
    }

    private JobResponse mapToResponse(Job job) {
        JobResponse res = new JobResponse();
        res.setJobId(job.getId());
        if (job.getEmployerProfile() != null) {
            res.setEmployerId(job.getEmployerProfile().getUserId());
            res.setEmployerBusinessName(job.getEmployerProfile().getBusinessName());
            res.setAddressLine(job.getEmployerProfile().getAddressLine());
            res.setArea(job.getEmployerProfile().getArea());
            res.setCity(job.getEmployerProfile().getCity());
            res.setPincode(job.getEmployerProfile().getPincode());
            if (job.getEmployerProfile().getLocation() != null) {
                res.setLatitude(job.getEmployerProfile().getLocation().getY());
                res.setLongitude(job.getEmployerProfile().getLocation().getX());
            } else if (job.getLocation() != null) {
                res.setLatitude(job.getLocation().getY());
                res.setLongitude(job.getLocation().getX());
            }
        }
        res.setTrade(job.getTrade());
        res.setProfession(job.getProfession());
        res.setExperienceRequiredYears(job.getExperienceRequiredYears());
        res.setSalary(job.getSalary());
        res.setShift(job.getShift());
        res.setTiming(job.getTiming());
        res.setRadiusKm(job.getRadiusKm());
        res.setStatus(job.getStatus());
        res.setCloseReason(job.getCloseReason());
        res.setCreatedAt(job.getCreatedAt());
        res.setUpdatedAt(job.getUpdatedAt());

        long totalApp = jobInterestRepository.countByJobId(job.getId());
        long selectedApp = jobInterestRepository.countByJobIdAndStatus(job.getId(), com.kaamsetu.domain.enums.ApplicationStatus.HIRED);
        long rejectedApp = jobInterestRepository.countByJobIdAndStatus(job.getId(), com.kaamsetu.domain.enums.ApplicationStatus.NOT_SELECTED);
        res.setApplicantsCount((int) totalApp);
        res.setSelectedCount((int) selectedApp);
        res.setRejectedCount((int) rejectedApp);

        if (job.getStatus() == JobStatus.CLOSED) {
            hireConfirmationRepository.findByJobId(job.getId()).ifPresent(hc -> {
                com.kaamsetu.domain.entity.WorkerProfile wp = hc.getWorkerProfile();
                if (wp != null) {
                    res.setHiredWorkerId(wp.getUserId());
                    res.setHiredWorkerName(wp.getFullName());
                    res.setHiredWorkerPhotoUrl(wp.getPhotoUrl());
                    if (wp.getUser() != null) {
                        res.setHiredWorkerPhone(wp.getUser().getPhoneNumber());
                    }
                }
                if (hc.getStatus() != null) {
                    res.setHireStatus(hc.getStatus().name());
                }
            });
        }

        return res;
    }
}
