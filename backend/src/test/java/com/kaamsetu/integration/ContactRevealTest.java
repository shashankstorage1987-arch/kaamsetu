package com.kaamsetu.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaamsetu.domain.entity.AuditLog;
import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.UserRole;
import com.kaamsetu.dto.auth.AuthResponse;
import com.kaamsetu.dto.auth.EmployerSignUpRequest;
import com.kaamsetu.dto.auth.WorkerSignUpRequest;
import com.kaamsetu.dto.profile.WorkerProfileResponse;
import com.kaamsetu.repository.AuditLogRepository;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import com.kaamsetu.service.AuthService;
import com.kaamsetu.service.WorkerProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ContactRevealTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private WorkerProfileService workerProfileService;

    private AuthResponse workerAuth;
    private AuthResponse employerAuth;
    private UUID workerUserId;

    @BeforeEach
    public void setUp() {
        // Create Worker
        WorkerSignUpRequest workerReq = new WorkerSignUpRequest();
        workerReq.setFullName("Vikas Sharma");
        workerReq.setPhoneNumber("9811223344");
        workerReq.setPin("123456");
        workerReq.setAadhaarNumber("111122223333");
        workerAuth = authService.signupWorker(workerReq);
        workerUserId = workerAuth.getUserId();

        // Create Employer
        EmployerSignUpRequest empReq = new EmployerSignUpRequest();
        empReq.setBusinessName("Sharma Enterprises");
        empReq.setOwnerName("Vijay Sharma");
        empReq.setPhoneNumber("9855667788");
        empReq.setPin("654321");
        employerAuth = authService.signupEmployer(empReq);
    }

    @Test
    public void testContactRevealByEmployerSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/workers/" + workerUserId + "/reveal-contact")
                .header("Authorization", "Bearer " + employerAuth.getToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workerId").value(workerUserId.toString()))
                .andExpect(jsonPath("$.fullName").value("Vikas Sharma"))
                .andExpect(jsonPath("$.phoneNumber").value("9811223344"));

        // Verify audit log entry CONTACT_REVEALED
        List<AuditLog> auditLogs = auditLogRepository.findByActor_Id(employerAuth.getUserId());
        boolean hasContactRevealedLog = auditLogs.stream()
                .anyMatch(log -> "CONTACT_REVEALED".equals(log.getAction()));
        assertTrue(hasContactRevealedLog, "Audit log must record CONTACT_REVEALED event");
    }

    @Test
    public void testContactRevealByWorkerDenied() throws Exception {
        // Worker attempting to call reveal-contact should receive 403 Forbidden
        mockMvc.perform(post("/api/v1/workers/" + workerUserId + "/reveal-contact")
                .header("Authorization", "Bearer " + workerAuth.getToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testSkillPassportMaskedPhoneForEmployer() throws Exception {
        // GET /api/v1/workers/{id} by employer shows masked phone number
        mockMvc.perform(get("/api/v1/workers/" + workerUserId)
                .header("Authorization", "Bearer " + employerAuth.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(workerUserId.toString()))
                .andExpect(jsonPath("$.phoneNumber").value(WorkerProfileService.maskPhoneNumber("9811223344")));
    }

    @Test
    public void testSkillPassportUnmaskedPhoneForSelf() throws Exception {
        // GET /api/v1/workers/{id} by worker self shows unmasked phone number
        mockMvc.perform(get("/api/v1/workers/" + workerUserId)
                .header("Authorization", "Bearer " + workerAuth.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(workerUserId.toString()))
                .andExpect(jsonPath("$.phoneNumber").value("9811223344"));
    }
}
