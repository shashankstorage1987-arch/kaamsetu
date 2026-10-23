package com.kaamsetu.integration;

import com.kaamsetu.domain.entity.*;
import com.kaamsetu.domain.enums.*;
import com.kaamsetu.dto.auth.AuthResponse;
import com.kaamsetu.dto.auth.EmployerSignUpRequest;
import com.kaamsetu.dto.auth.WorkerSignUpRequest;
import com.kaamsetu.dto.job.*;
import com.kaamsetu.repository.*;
import com.kaamsetu.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class Phase5IntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobInterestRepository jobInterestRepository;

    @Autowired
    private HireConfirmationRepository hireConfirmationRepository;

    private GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

    private User employerA;
    private User employerB;
    private User worker1;
    private User worker2;
    private Job activeJob;

    @BeforeEach
    public void setUp() {
        // Signup Employer A
        EmployerSignUpRequest empReqA = new EmployerSignUpRequest();
        empReqA.setBusinessName("Raj Electricals");
        empReqA.setOwnerName("Raj Kumar");
        empReqA.setPhoneNumber("9711122233");
        empReqA.setPin("123456");
        AuthResponse respA = authService.signupEmployer(empReqA);
        employerA = userRepository.findById(respA.getUserId()).orElseThrow();

        EmployerProfile profA = employerProfileRepository.findById(employerA.getId()).orElseThrow();
        Point locA = gf.createPoint(new Coordinate(77.2167, 28.6315));
        profA.setLocation(locA);
        employerProfileRepository.save(profA);

        // Signup Employer B
        EmployerSignUpRequest empReqB = new EmployerSignUpRequest();
        empReqB.setBusinessName("Gupta Electronics");
        empReqB.setOwnerName("Amit Gupta");
        empReqB.setPhoneNumber("9711122244");
        empReqB.setPin("123456");
        AuthResponse respB = authService.signupEmployer(empReqB);
        employerB = userRepository.findById(respB.getUserId()).orElseThrow();

        // Signup Worker 1
        WorkerSignUpRequest wReq1 = new WorkerSignUpRequest();
        wReq1.setFullName("Suresh Kumar");
        wReq1.setPhoneNumber("9711122255");
        wReq1.setPin("123456");
        wReq1.setAadhaarNumber("222233334444");
        AuthResponse wResp1 = authService.signupWorker(wReq1);
        worker1 = userRepository.findById(wResp1.getUserId()).orElseThrow();

        WorkerProfile wp1 = workerProfileRepository.findById(worker1.getId()).orElseThrow();
        wp1.setTotalExperienceYears(new BigDecimal("3.0"));
        wp1.setLocation(locA);
        wp1.setAvailable(true);
        wp1.addExperience(new WorkerExperience(TradeType.ELECTRICAL, ProfessionType.HELPER, "Past Company", 36));
        workerProfileRepository.save(wp1);

        // Signup Worker 2
        WorkerSignUpRequest wReq2 = new WorkerSignUpRequest();
        wReq2.setFullName("Ramesh Sharma");
        wReq2.setPhoneNumber("9711122266");
        wReq2.setPin("123456");
        wReq2.setAadhaarNumber("333344445555");
        AuthResponse wResp2 = authService.signupWorker(wReq2);
        worker2 = userRepository.findById(wResp2.getUserId()).orElseThrow();

        WorkerProfile wp2 = workerProfileRepository.findById(worker2.getId()).orElseThrow();
        wp2.setTotalExperienceYears(new BigDecimal("1.0"));
        wp2.setLocation(locA);
        wp2.setAvailable(true);
        wp2.addExperience(new WorkerExperience(TradeType.ELECTRICAL, ProfessionType.HELPER, "Other Company", 12));
        workerProfileRepository.save(wp2);

        // Employer A posts an active job
        JobCreateRequest jobReq = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("2.0"), 18000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse jobResp = jobService.createJob(employerA, jobReq);
        activeJob = jobRepository.findById(jobResp.getJobId()).orElseThrow();
    }

    @Test
    public void testWorkerExpressInterestSuccessAndScoreSnapshot() {
        JobInterestResponse resp = applicationService.expressInterest(worker1, activeJob.getId());

        assertNotNull(resp.getId());
        assertEquals(activeJob.getId(), resp.getJobId());
        assertEquals(worker1.getId(), resp.getWorkerId());
        assertNotNull(resp.getMatchScore());
        assertTrue(resp.getMatchScore().compareTo(BigDecimal.ZERO) > 0);
        assertEquals(ApplicationStatus.INTERESTED, resp.getStatus());

        // Verify snapshot in database
        JobInterest saved = jobInterestRepository.findById(resp.getId()).orElseThrow();
        assertEquals(resp.getMatchScore(), saved.getMatchScore());
    }

    @Test
    public void testDuplicateInterestExpressionRejected() {
        applicationService.expressInterest(worker1, activeJob.getId());

        assertThrows(RuntimeException.class, () -> {
            applicationService.expressInterest(worker1, activeJob.getId());
        });
    }

    @Test
    public void testEmployerCannotExpressInterest() {
        assertThrows(AccessDeniedException.class, () -> {
            applicationService.expressInterest(employerA, activeJob.getId());
        });
    }

    @Test
    public void testWorkerApplicationsIsolation() {
        applicationService.expressInterest(worker1, activeJob.getId());

        List<WorkerApplicationResponse> apps1 = applicationService.getWorkerApplications(worker1);
        assertEquals(1, apps1.size());

        List<WorkerApplicationResponse> apps2 = applicationService.getWorkerApplications(worker2);
        assertEquals(0, apps2.size());
    }

    @Test
    public void testEmployerApplicantViewAndSecurity() {
        applicationService.expressInterest(worker1, activeJob.getId());
        applicationService.expressInterest(worker2, activeJob.getId());

        // Employer A can view applicants sorted by match score
        List<ApplicantResponse> applicants = applicationService.getJobApplicants(employerA, activeJob.getId());
        assertEquals(2, applicants.size());

        // Employer B receives 403 Forbidden attempting to view Employer A's applicants
        assertThrows(AccessDeniedException.class, () -> {
            applicationService.getJobApplicants(employerB, activeJob.getId());
        });
    }

    @Test
    public void testAtomicHireTransaction() {
        // Worker 1 expresses interest
        applicationService.expressInterest(worker1, activeJob.getId());

        // Employer A hires Worker 1
        HireRequest hireReq = new HireRequest(worker1.getId());
        HireConfirmationResponse hcResp = applicationService.hireWorker(employerA, activeJob.getId(), hireReq);

        assertNotNull(hcResp.getHireConfirmationId());
        assertTrue(hcResp.isEmployerConfirmed());
        assertNull(hcResp.getWorkerConfirmed());
        assertEquals(HireStatus.PENDING, hcResp.getStatus());
        assertEquals(JobStatus.CLOSED, hcResp.getJobStatus());
        assertEquals(JobCloseReason.HIRED_VIA_KAAMSETU, hcResp.getCloseReason());

        // Verify Job status in database is IMMEDIATELY CLOSED with HIRED_VIA_KAAMSETU
        Job reloadedJob = jobRepository.findById(activeJob.getId()).orElseThrow();
        assertEquals(JobStatus.CLOSED, reloadedJob.getStatus());
        assertEquals(JobCloseReason.HIRED_VIA_KAAMSETU, reloadedJob.getCloseReason());

        // Verify Application status updated to HIRED
        JobInterest interest = jobInterestRepository.findByJobIdAndWorkerProfileUserId(activeJob.getId(), worker1.getId()).orElseThrow();
        assertEquals(ApplicationStatus.HIRED, interest.getStatus());
    }

    @Test
    public void testHireUnappliedWorkerRejected() {
        // Worker 1 did NOT express interest
        HireRequest hireReq = new HireRequest(worker1.getId());
        assertThrows(RuntimeException.class, () -> {
            applicationService.hireWorker(employerA, activeJob.getId(), hireReq);
        });
    }

    @Test
    public void testSingleHireConcurrencyProtection() {
        applicationService.expressInterest(worker1, activeJob.getId());
        applicationService.expressInterest(worker2, activeJob.getId());

        // First hire succeeds
        applicationService.hireWorker(employerA, activeJob.getId(), new HireRequest(worker1.getId()));

        // Second hire attempt on same job fails
        assertThrows(RuntimeException.class, () -> {
            applicationService.hireWorker(employerA, activeJob.getId(), new HireRequest(worker2.getId()));
        });
    }

    @Test
    public void testWorkerConfirmHireYES() {
        applicationService.expressInterest(worker1, activeJob.getId());
        HireConfirmationResponse hcResp = applicationService.hireWorker(employerA, activeJob.getId(), new HireRequest(worker1.getId()));

        // Worker 1 accepts hire
        HireResponseRequest yesReq = new HireResponseRequest(true);
        HireConfirmationResponse confirmed = applicationService.respondToHireConfirmation(worker1, hcResp.getHireConfirmationId(), yesReq);

        assertTrue(confirmed.getWorkerConfirmed());
        assertEquals(HireStatus.CONFIRMED, confirmed.getStatus());
        assertNotNull(confirmed.getConfirmedAt());

        // Job remains CLOSED
        Job reloadedJob = jobRepository.findById(activeJob.getId()).orElseThrow();
        assertEquals(JobStatus.CLOSED, reloadedJob.getStatus());
    }

    @Test
    public void testWorkerDeclineHireNO_MismatchRule() {
        applicationService.expressInterest(worker1, activeJob.getId());
        HireConfirmationResponse hcResp = applicationService.hireWorker(employerA, activeJob.getId(), new HireRequest(worker1.getId()));

        // Worker 1 declines hire
        HireResponseRequest noReq = new HireResponseRequest(false);
        HireConfirmationResponse mismatch = applicationService.respondToHireConfirmation(worker1, hcResp.getHireConfirmationId(), noReq);

        assertFalse(mismatch.getWorkerConfirmed());
        assertEquals(HireStatus.MISMATCH, mismatch.getStatus());
        assertNotNull(mismatch.getConfirmedAt());

        // CRITICAL MISMATCH RULE: Job remains CLOSED (does NOT reopen)
        Job reloadedJob = jobRepository.findById(activeJob.getId()).orElseThrow();
        assertEquals(JobStatus.CLOSED, reloadedJob.getStatus());
    }

    @Test
    public void testCrossWorkerConfirmationSecurity() {
        applicationService.expressInterest(worker1, activeJob.getId());
        HireConfirmationResponse hcResp = applicationService.hireWorker(employerA, activeJob.getId(), new HireRequest(worker1.getId()));

        assertThrows(AccessDeniedException.class, () -> {
            applicationService.respondToHireConfirmation(worker2, hcResp.getHireConfirmationId(), new HireResponseRequest(true));
        });
    }

    @Test
    public void testWorkerCanViewClosedJobDetailIfApplied() {
        applicationService.expressInterest(worker1, activeJob.getId());
        applicationService.hireWorker(employerA, activeJob.getId(), new HireRequest(worker1.getId()));

        JobResponse detail = jobService.getJobDetail(worker1, activeJob.getId());
        assertNotNull(detail);
        assertEquals(activeJob.getId(), detail.getJobId());
        assertTrue(detail.getHasApplied());
        assertEquals(JobStatus.CLOSED, detail.getStatus());
    }

    @Test
    public void testClosedJobExcludedFromWorkerSearch() {
        jobService.closeJob(employerA, activeJob.getId(), new JobCloseRequest(JobCloseReason.NO_LONGER_HIRING));

        List<JobResponse> results = jobService.searchJobsForWorker(worker1, 28.6315, 77.2167, null, null, new BigDecimal("50.0"));
        assertFalse(results.stream().anyMatch(j -> j.getJobId().equals(activeJob.getId())), "Closed job should be excluded from search");
    }

    @Test
    public void testRejectedJobExcludedFromWorkerSearch() {
        applicationService.expressInterest(worker1, activeJob.getId());
        applicationService.rejectApplicant(employerA, activeJob.getId(), worker1.getId());

        List<JobResponse> worker1Results = jobService.searchJobsForWorker(worker1, 28.6315, 77.2167, null, null, new BigDecimal("50.0"));
        assertFalse(worker1Results.stream().anyMatch(j -> j.getJobId().equals(activeJob.getId())), "Rejected job should be excluded from Worker 1's search");

        List<JobResponse> worker2Results = jobService.searchJobsForWorker(worker2, 28.6315, 77.2167, null, null, new BigDecimal("50.0"));
        assertTrue(worker2Results.stream().anyMatch(j -> j.getJobId().equals(activeJob.getId())), "Worker 2 should still see active job");
    }
}
