package com.kaamsetu.service;

import com.kaamsetu.domain.entity.*;
import com.kaamsetu.domain.enums.*;
import com.kaamsetu.dto.job.*;
import com.kaamsetu.exception.BadRequestException;
import com.kaamsetu.exception.ResourceNotFoundException;
import com.kaamsetu.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final JobRepository jobRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final JobInterestRepository jobInterestRepository;
    private final HireConfirmationRepository hireConfirmationRepository;
    private final MatchIntelligenceService matchIntelligenceService;
    private final AuditLogService auditLogService;

    public ApplicationService(
            JobRepository jobRepository,
            WorkerProfileRepository workerProfileRepository,
            JobInterestRepository jobInterestRepository,
            HireConfirmationRepository hireConfirmationRepository,
            MatchIntelligenceService matchIntelligenceService,
            AuditLogService auditLogService) {
        this.jobRepository = jobRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.jobInterestRepository = jobInterestRepository;
        this.hireConfirmationRepository = hireConfirmationRepository;
        this.matchIntelligenceService = matchIntelligenceService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public JobInterestResponse expressInterest(User actor, UUID jobId) {
        if (actor == null || actor.getRole() != UserRole.WORKER) {
            throw new AccessDeniedException("Only workers can express interest in jobs");
        }

        WorkerProfile workerProfile = workerProfileRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        if (actor.isSuspended()) {
            throw new AccessDeniedException("Suspended workers cannot apply for jobs");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new BadRequestException("Cannot express interest in a closed job");
        }

        // Duplicate application check
        if (jobInterestRepository.findByJobIdAndWorkerProfileUserId(jobId, actor.getId()).isPresent()) {
            throw new BadRequestException("Worker has already expressed interest in this job");
        }

        // Calculate distance for Match Intelligence
        double workerLat = workerProfile.getLocation() != null ? workerProfile.getLocation().getY() : 28.6315;
        double workerLon = workerProfile.getLocation() != null ? workerProfile.getLocation().getX() : 77.2167;
        double jobLat = job.getLocation() != null ? job.getLocation().getY() : workerLat;
        double jobLon = job.getLocation() != null ? job.getLocation().getX() : workerLon;

        BigDecimal distKm = SearchService.calculateHaversineDistanceKm(jobLat, jobLon, workerLat, workerLon);

        MatchIntelligenceService.MatchResult matchResult = matchIntelligenceService.calculateMatchScore(
                workerProfile,
                job.getTrade(),
                job.getProfession(),
                job.getExperienceRequiredYears(),
                distKm,
                job.getRadiusKm()
        );

        JobInterest interest = new JobInterest();
        interest.setJob(job);
        interest.setWorkerProfile(workerProfile);
        interest.setMatchScore(matchResult.getTotalScore());
        interest.setStatus(ApplicationStatus.INTERESTED);

        interest = jobInterestRepository.save(interest);

        auditLogService.log(actor, "JOB_INTEREST_EXPRESSED",
                "{\"job_id\":\"" + jobId + "\",\"worker_id\":\"" + actor.getId() + "\",\"match_score\":" + matchResult.getTotalScore() + "}");

        return new JobInterestResponse(
                interest.getId(),
                job.getId(),
                workerProfile.getUserId(),
                interest.getMatchScore(),
                interest.getStatus(),
                interest.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<WorkerApplicationResponse> getWorkerApplications(User actor) {
        if (actor == null || actor.getRole() != UserRole.WORKER) {
            throw new AccessDeniedException("Only workers can view their applications");
        }

        List<JobInterest> interests = jobInterestRepository.findByWorkerProfileUserIdOrderByCreatedAtDesc(actor.getId());
        return interests.stream().map(interest -> {
            Job job = interest.getJob();
            WorkerApplicationResponse res = new WorkerApplicationResponse();
            res.setId(interest.getId());
            res.setJobId(job.getId());
            res.setTrade(job.getTrade());
            res.setProfession(job.getProfession());
            res.setSalary(job.getSalary());
            res.setShift(job.getShift());
            res.setTiming(job.getTiming());
            res.setEmployerBusinessName(job.getEmployerProfile().getBusinessName());
            res.setMatchScore(interest.getMatchScore());
            res.setStatus(interest.getStatus());
            res.setCreatedAt(interest.getCreatedAt());
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicantResponse> getJobApplicants(User actor, UUID jobId) {
        if (actor == null || actor.getRole() != UserRole.EMPLOYER) {
            throw new AccessDeniedException("Only employers can view applicants");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerProfile().getUserId().equals(actor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job");
        }

        List<JobInterest> interests = jobInterestRepository.findByJobIdOrderByMatchScoreDesc(jobId);
        double jobLat = job.getLocation() != null ? job.getLocation().getY() : 28.6315;
        double jobLon = job.getLocation() != null ? job.getLocation().getX() : 77.2167;

        return interests.stream().map(interest -> {
            WorkerProfile wp = interest.getWorkerProfile();
            ApplicantResponse res = new ApplicantResponse();
            res.setWorkerId(wp.getUserId());
            res.setFullName(wp.getFullName());
            res.setTrade(job.getTrade());
            res.setProfession(job.getProfession());
            res.setExperienceYears(wp.getTotalExperienceYears());

            double wLat = wp.getLocation() != null ? wp.getLocation().getY() : jobLat;
            double wLon = wp.getLocation() != null ? wp.getLocation().getX() : jobLon;
            res.setDistanceKm(SearchService.calculateHaversineDistanceKm(jobLat, jobLon, wLat, wLon));

            res.setIsAvailable(WorkerProfileService.checkEffectiveAvailability(wp));
            res.setAadhaarVerified(wp.getUser() != null && wp.getUser().isAadhaarVerified());
            res.setMatchScore(interest.getMatchScore());
            res.setStatus(interest.getStatus());
            res.setExpressedInterestAt(interest.getCreatedAt());
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void rejectApplicant(User actor, UUID jobId, UUID workerId) {
        if (actor == null || actor.getRole() != UserRole.EMPLOYER) {
            throw new AccessDeniedException("Only employers can reject applicants");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerProfile().getUserId().equals(actor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job");
        }

        JobInterest interest = jobInterestRepository.findByJobIdAndWorkerProfileUserId(jobId, workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found for this worker"));

        interest.setStatus(ApplicationStatus.NOT_SELECTED);
        jobInterestRepository.saveAndFlush(interest);

        auditLogService.log(actor, "APPLICANT_REJECTED",
                "{\"job_id\":\"" + jobId + "\",\"worker_id\":\"" + workerId + "\"}");
    }

    @Transactional
    public HireConfirmationResponse hireWorker(User actor, UUID jobId, HireRequest request) {
        if (actor == null || actor.getRole() != UserRole.EMPLOYER) {
            throw new AccessDeniedException("Only employers can execute hire operations");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerProfile().getUserId().equals(actor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job");
        }

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new BadRequestException("Cannot execute hire on a closed job");
        }

        UUID selectedWorkerId = request.getWorkerId();
        WorkerProfile selectedWorker = workerProfileRepository.findById(selectedWorkerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        if (selectedWorker.getUser() != null && selectedWorker.getUser().isSuspended()) {
            throw new BadRequestException("Selected worker is suspended");
        }

        // Must have an existing application
        JobInterest interest = jobInterestRepository.findByJobIdAndWorkerProfileUserId(jobId, selectedWorkerId)
                .orElseThrow(() -> new BadRequestException("Selected worker has not expressed interest in this job"));

        // Concurrency & Single-Hire Protection
        if (hireConfirmationRepository.existsByJobId(jobId)) {
            throw new BadRequestException("A hire operation has already been executed for this job");
        }

        // Atomic Transaction: Create HireConfirmation, Close Job (HIRED_VIA_KAAMSETU), Update Interest (HIRED)
        HireConfirmation hc = new HireConfirmation();
        hc.setJob(job);
        hc.setWorkerProfile(selectedWorker);
        hc.setEmployerConfirmed(true);
        hc.setWorkerConfirmed(null);
        hc.setStatus(HireStatus.PENDING);
        hc = hireConfirmationRepository.save(hc);

        job.setStatus(JobStatus.CLOSED);
        job.setCloseReason(JobCloseReason.HIRED_VIA_KAAMSETU);
        jobRepository.save(job);

        interest.setStatus(ApplicationStatus.HIRED);
        jobInterestRepository.save(interest);

        auditLogService.log(actor, "HIRING_INITIATED",
                "{\"job_id\":\"" + jobId + "\",\"worker_id\":\"" + selectedWorkerId + "\",\"hire_confirmation_id\":\"" + hc.getId() + "\"}");

        return mapToHireConfirmationResponse(hc);
    }

    @Transactional(readOnly = true)
    public List<HireConfirmationResponse> getWorkerHireConfirmations(User actor) {
        if (actor == null || actor.getRole() != UserRole.WORKER) {
            throw new AccessDeniedException("Only workers can view hire confirmations");
        }

        List<HireConfirmation> hcs = hireConfirmationRepository.findByWorkerProfileUserIdOrderByCreatedAtDesc(actor.getId());
        return hcs.stream().map(this::mapToHireConfirmationResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HireConfirmationResponse> getEmployerHireConfirmations(User actor) {
        if (actor == null || actor.getRole() != UserRole.EMPLOYER) {
            throw new AccessDeniedException("Only employers can view hired workers");
        }

        List<HireConfirmation> hcs = hireConfirmationRepository.findByJobEmployerProfileUserIdOrderByCreatedAtDesc(actor.getId());
        return hcs.stream().map(this::mapToHireConfirmationResponse).collect(Collectors.toList());
    }

    @Transactional
    public HireConfirmationResponse respondToHireConfirmation(User actor, UUID confirmationId, HireResponseRequest request) {
        if (actor == null || actor.getRole() != UserRole.WORKER) {
            throw new AccessDeniedException("Only workers can respond to hire confirmations");
        }

        HireConfirmation hc = hireConfirmationRepository.findById(confirmationId)
                .orElseThrow(() -> new ResourceNotFoundException("Hire confirmation not found"));

        if (!hc.getWorkerProfile().getUserId().equals(actor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this hire confirmation");
        }

        if (hc.getStatus() != HireStatus.PENDING) {
            throw new BadRequestException("Hire confirmation has already been responded to");
        }

        if (Boolean.TRUE.equals(request.getAccepted())) {
            hc.setWorkerConfirmed(true);
            hc.setStatus(HireStatus.CONFIRMED);
            hc.setConfirmedAt(OffsetDateTime.now());
            // Job remains CLOSED

            auditLogService.log(actor, "HIRE_CONFIRMED",
                    "{\"hire_confirmation_id\":\"" + hc.getId() + "\",\"job_id\":\"" + hc.getJob().getId() + "\"}");
        } else {
            hc.setWorkerConfirmed(false);
            hc.setStatus(HireStatus.MISMATCH);
            hc.setConfirmedAt(OffsetDateTime.now());
            // MISMATCH RULE: Job remains CLOSED.

            auditLogService.log(actor, "HIRE_MISMATCH_FLAGGED",
                    "{\"hire_confirmation_id\":\"" + hc.getId() + "\",\"job_id\":\"" + hc.getJob().getId() + "\"}");
        }

        hc = hireConfirmationRepository.save(hc);

        return mapToHireConfirmationResponse(hc);
    }

    private HireConfirmationResponse mapToHireConfirmationResponse(HireConfirmation hc) {
        HireConfirmationResponse res = new HireConfirmationResponse();
        res.setHireConfirmationId(hc.getId());
        res.setJobId(hc.getJob().getId());
        res.setWorkerId(hc.getWorkerProfile().getUserId());
        res.setTrade(hc.getJob().getTrade());
        res.setProfession(hc.getJob().getProfession());
        res.setSalary(hc.getJob().getSalary());
        res.setShift(hc.getJob().getShift());
        res.setEmployerBusinessName(hc.getJob().getEmployerProfile().getBusinessName());
        res.setEmployerConfirmed(hc.isEmployerConfirmed());
        res.setWorkerConfirmed(hc.getWorkerConfirmed());
        res.setStatus(hc.getStatus());
        res.setJobStatus(hc.getJob().getStatus());
        res.setCloseReason(hc.getJob().getCloseReason());
        res.setConfirmedAt(hc.getConfirmedAt());
        res.setCreatedAt(hc.getCreatedAt());

        WorkerProfile wp = hc.getWorkerProfile();
        if (wp != null) {
            res.setWorkerFullName(wp.getFullName());
            res.setWorkerPhotoUrl(wp.getPhotoUrl());
            res.setWorkerExperienceYears(wp.getTotalExperienceYears());
            if (wp.getUser() != null) {
                res.setWorkerPhoneNumber(wp.getUser().getPhoneNumber());
            }
            res.setWorkerAddressArea(wp.getArea());
            res.setWorkerAddressCity(wp.getCity());
            if (wp.getExperiences() != null && !wp.getExperiences().isEmpty()) {
                res.setWorkerTrade(wp.getExperiences().get(0).getTrade());
            }
        }

        return res;
    }
}
