package com.kaamsetu.integration;

import com.kaamsetu.domain.entity.EmployerProfile;
import com.kaamsetu.domain.entity.User;

import com.kaamsetu.domain.enums.*;
import com.kaamsetu.dto.auth.AuthResponse;
import com.kaamsetu.dto.auth.EmployerSignUpRequest;
import com.kaamsetu.dto.auth.WorkerSignUpRequest;
import com.kaamsetu.dto.job.*;
import com.kaamsetu.repository.EmployerProfileRepository;
import com.kaamsetu.repository.JobRepository;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.service.AuthService;
import com.kaamsetu.service.JobService;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class JobIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private JobService jobService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    private GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

    private User employerA;
    private User employerB;
    private User workerUser;

    @BeforeEach
    public void setUp() {
        // Signup Employer A
        EmployerSignUpRequest empReqA = new EmployerSignUpRequest();
        empReqA.setBusinessName("Sharma Electricals");
        empReqA.setOwnerName("Rakesh Sharma");
        empReqA.setPhoneNumber("9811122233");
        empReqA.setPin("123456");
        AuthResponse respA = authService.signupEmployer(empReqA);
        employerA = userRepository.findById(respA.getUserId()).orElseThrow();

        // Set Location for Employer A
        EmployerProfile profA = employerProfileRepository.findById(employerA.getId()).orElseThrow();
        Point locA = gf.createPoint(new Coordinate(77.2167, 28.6315));
        profA.setLocation(locA);
        employerProfileRepository.save(profA);

        // Signup Employer B
        EmployerSignUpRequest empReqB = new EmployerSignUpRequest();
        empReqB.setBusinessName("Verma Hardware");
        empReqB.setOwnerName("Suresh Verma");
        empReqB.setPhoneNumber("9811122244");
        empReqB.setPin("123456");
        AuthResponse respB = authService.signupEmployer(empReqB);
        employerB = userRepository.findById(respB.getUserId()).orElseThrow();

        // Signup Worker
        WorkerSignUpRequest workerReq = new WorkerSignUpRequest();
        workerReq.setFullName("Mohan Kumar");
        workerReq.setPhoneNumber("9811122255");
        workerReq.setPin("123456");
        workerReq.setAadhaarNumber("111122223333");
        AuthResponse respWorker = authService.signupWorker(workerReq);
        workerUser = userRepository.findById(respWorker.getUserId()).orElseThrow();
    }

    @Test
    public void testEmployerJobCreationSuccess() {
        JobCreateRequest req = new JobCreateRequest();
        req.setTrade(TradeType.ELECTRICAL);
        req.setProfession(ProfessionType.HELPER);
        req.setExperienceRequiredYears(new BigDecimal("2.0"));
        req.setSalary(18000);
        req.setShift(ShiftType.DAY);
        req.setTiming("9 AM - 6 PM");
        req.setRadiusKm(new BigDecimal("1.0"));

        JobResponse resp = jobService.createJob(employerA, req);

        assertNotNull(resp.getJobId());
        assertEquals(JobStatus.ACTIVE, resp.getStatus());
        assertEquals(TradeType.ELECTRICAL, resp.getTrade());
        assertEquals(ProfessionType.HELPER, resp.getProfession());
        assertEquals(18000, resp.getSalary());
        assertEquals(ShiftType.DAY, resp.getShift());
        assertEquals(employerA.getId(), resp.getEmployerId());
    }

    @Test
    public void testWorkerCannotCreateJob() {
        JobCreateRequest req = new JobCreateRequest();
        req.setTrade(TradeType.ELECTRICAL);
        req.setProfession(ProfessionType.HELPER);
        req.setSalary(18000);

        assertThrows(AccessDeniedException.class, () -> {
            jobService.createJob(workerUser, req);
        });
    }

    @Test
    public void testEmployerDashboardRetrieval() {
        // Create 2 jobs for Employer A
        JobCreateRequest req1 = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobCreateRequest req2 = new JobCreateRequest(TradeType.HARDWARE, ProfessionType.BILLER, new BigDecimal("2.0"), 20000, ShiftType.DAY, "10 AM - 7 PM", new BigDecimal("3.0"));

        jobService.createJob(employerA, req1);
        jobService.createJob(employerA, req2);

        EmployerDashboardResponse dashboard = jobService.getEmployerDashboard(employerA);

        assertEquals(2, dashboard.getActiveJobsCount());
        assertEquals(0, dashboard.getClosedJobsCount());
        assertEquals(2, dashboard.getJobs().size());
    }

    @Test
    public void testJobOwnershipSecurity() {
        // Employer A creates a job
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse jobA = jobService.createJob(employerA, req);

        // Employer B attempts to retrieve Employer A's job detail
        assertThrows(AccessDeniedException.class, () -> {
            jobService.getJobForEmployer(employerB, jobA.getJobId());
        });

        // Worker attempts to retrieve Employer A's job detail
        assertThrows(AccessDeniedException.class, () -> {
            jobService.getJobForEmployer(workerUser, jobA.getJobId());
        });

        // Employer B attempts to update Employer A's job
        JobUpdateRequest updateReq = new JobUpdateRequest();
        updateReq.setSalary(25000);
        assertThrows(AccessDeniedException.class, () -> {
            jobService.updateJob(employerB, jobA.getJobId(), updateReq);
        });

        // Employer B attempts to close Employer A's job
        JobCloseRequest closeReq = new JobCloseRequest(JobCloseReason.HIRED_ELSEWHERE);
        assertThrows(AccessDeniedException.class, () -> {
            jobService.closeJob(employerB, jobA.getJobId(), closeReq);
        });
    }

    @Test
    public void testEditActiveJobSuccess() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse job = jobService.createJob(employerA, req);

        JobUpdateRequest updateReq = new JobUpdateRequest();
        updateReq.setSalary(22000);
        updateReq.setShift(ShiftType.NIGHT);
        updateReq.setTiming("8 PM - 5 AM");
        updateReq.setRadiusKm(new BigDecimal("5.0"));

        JobResponse updatedJob = jobService.updateJob(employerA, job.getJobId(), updateReq);

        assertEquals(22000, updatedJob.getSalary());
        assertEquals(ShiftType.NIGHT, updatedJob.getShift());
        assertEquals("8 PM - 5 AM", updatedJob.getTiming());
        assertEquals(new BigDecimal("5.0"), updatedJob.getRadiusKm());
        // Immutable trade & profession preserved
        assertEquals(TradeType.ELECTRICAL, updatedJob.getTrade());
        assertEquals(ProfessionType.HELPER, updatedJob.getProfession());
    }

    @Test
    public void testCloseJobNonKaamSetuReasonSuccess() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse job = jobService.createJob(employerA, req);

        JobCloseRequest closeReq = new JobCloseRequest(JobCloseReason.HIRED_ELSEWHERE);
        JobResponse closedJob = jobService.closeJob(employerA, job.getJobId(), closeReq);

        assertEquals(JobStatus.CLOSED, closedJob.getStatus());
        assertEquals(JobCloseReason.HIRED_ELSEWHERE, closedJob.getCloseReason());
    }

    @Test
    public void testRejectKaamSetuReasonOnCloseEndpoint() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse job = jobService.createJob(employerA, req);

        JobCloseRequest closeReq = new JobCloseRequest(JobCloseReason.HIRED_VIA_KAAMSETU);
        assertThrows(RuntimeException.class, () -> {
            jobService.closeJob(employerA, job.getJobId(), closeReq);
        });
    }

    @Test
    public void testClosedJobCannotBeEdited() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse job = jobService.createJob(employerA, req);

        // Close job
        jobService.closeJob(employerA, job.getJobId(), new JobCloseRequest(JobCloseReason.NO_LONGER_HIRING));

        // Attempt edit
        JobUpdateRequest updateReq = new JobUpdateRequest();
        updateReq.setSalary(30000);

        assertThrows(RuntimeException.class, () -> {
            jobService.updateJob(employerA, job.getJobId(), updateReq);
        });
    }

    @Test
    public void testWorkerCanViewActiveJobDetail() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("3.0"), 18000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("5.0"));
        JobResponse job = jobService.createJob(employerA, req);

        JobResponse detail = jobService.getJobDetail(workerUser, job.getJobId());

        assertNotNull(detail);
        assertEquals(job.getJobId(), detail.getJobId());
        assertEquals(TradeType.ELECTRICAL, detail.getTrade());
        assertEquals(18000, detail.getSalary());
        assertEquals(new BigDecimal("5.0"), detail.getRadiusKm());
        assertEquals(new BigDecimal("3.0"), detail.getExperienceRequiredYears());
        assertFalse(detail.getHasApplied());
    }

    @Test
    public void testWorkerCannotViewClosedJobDetail() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse job = jobService.createJob(employerA, req);
        jobService.closeJob(employerA, job.getJobId(), new JobCloseRequest(JobCloseReason.NO_LONGER_HIRING));

        assertThrows(AccessDeniedException.class, () -> {
            jobService.getJobDetail(workerUser, job.getJobId());
        });
    }

    @Test
    public void testEmployerBCannotViewEmployerAJobDetail() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("1.0"), 15000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("1.0"));
        JobResponse job = jobService.createJob(employerA, req);

        assertThrows(AccessDeniedException.class, () -> {
            jobService.getJobDetail(employerB, job.getJobId());
        });
    }

    @Test
    public void testWorkerJobDiscovery() {
        JobCreateRequest req = new JobCreateRequest(TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("2.0"), 18000, ShiftType.DAY, "9 AM - 6 PM", new BigDecimal("5.0"));
        JobResponse job = jobService.createJob(employerA, req);

        var jobs = jobService.searchJobsForWorker(workerUser, 28.6315, 77.2167, TradeType.ELECTRICAL, ProfessionType.HELPER, new BigDecimal("10.0"));

        assertFalse(jobs.isEmpty());
        assertTrue(jobs.stream().anyMatch(j -> j.getJobId().equals(job.getJobId())));
    }
}
