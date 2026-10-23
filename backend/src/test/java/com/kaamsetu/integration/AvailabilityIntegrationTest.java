package com.kaamsetu.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.entity.WorkerExperience;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.domain.enums.UserRole;
import com.kaamsetu.dto.auth.AuthResponse;
import com.kaamsetu.dto.auth.EmployerSignUpRequest;
import com.kaamsetu.dto.auth.WorkerSignUpRequest;
import com.kaamsetu.dto.profile.WorkerAvailabilityRequest;
import com.kaamsetu.dto.search.WorkerSearchResponse;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import com.kaamsetu.service.AvailabilityExpiryScheduler;
import com.kaamsetu.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AvailabilityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilityExpiryScheduler availabilityExpiryScheduler;

    @Autowired
    private ObjectMapper objectMapper;

    private final GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

    private AuthResponse workerAuth;
    private AuthResponse employerAuth;
    private UUID workerUserId;

    @BeforeEach
    public void setUp() {
        // 1. Create Worker
        WorkerSignUpRequest workerReq = new WorkerSignUpRequest();
        workerReq.setFullName("Sunil Kumar");
        workerReq.setPhoneNumber("9800011122");
        workerReq.setPin("123456");
        workerReq.setAadhaarNumber("999988887777");
        workerAuth = authService.signupWorker(workerReq);
        workerUserId = workerAuth.getUserId();

        // Add location & experience to worker profile
        WorkerProfile wp = workerProfileRepository.findById(workerUserId).get();
        Point location = gf.createPoint(new Coordinate(77.2167, 28.6315));
        wp.setLocation(location);
        WorkerExperience exp = new WorkerExperience(TradeType.ELECTRICAL, ProfessionType.HELPER, "Prev Co", 24);
        wp.addExperience(exp);
        workerProfileRepository.save(wp);

        // 2. Create Employer
        EmployerSignUpRequest empReq = new EmployerSignUpRequest();
        empReq.setBusinessName("Delhi Traders");
        empReq.setOwnerName("Rakesh Delhi");
        empReq.setPhoneNumber("9800033344");
        empReq.setPin("654321");
        employerAuth = authService.signupEmployer(empReq);
    }

    @Test
    public void testFullAvailabilityLifecycle() throws Exception {
        // 1. Worker enables availability
        WorkerAvailabilityRequest enableReq = new WorkerAvailabilityRequest(true);

        mockMvc.perform(patch("/api/v1/workers/me/availability")
                .header("Authorization", "Bearer " + workerAuth.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(enableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(true))
                .andExpect(jsonPath("$.effectiveAvailable").value(true));

        // 2. GET availability
        mockMvc.perform(get("/api/v1/workers/me/availability")
                .header("Authorization", "Bearer " + workerAuth.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(true))
                .andExpect(jsonPath("$.effectiveAvailable").value(true));

        // 3. Employer search sees worker as available
        mockMvc.perform(get("/api/v1/search/workers")
                .param("lat", "28.6315")
                .param("lon", "77.2167")
                .param("radius_km", "1.0")
                .param("available_now", "true")
                .header("Authorization", "Bearer " + employerAuth.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFound").value(1))
                .andExpect(jsonPath("$.workers[0].fullName").value("Sunil Kumar"))
                .andExpect(jsonPath("$.workers[0].available").value(true));

        // 4. Fast forward time: set availableUntil to 5 minutes ago
        WorkerProfile wp = workerProfileRepository.findById(workerUserId).get();
        wp.setAvailableUntil(OffsetDateTime.now().minusMinutes(5));
        workerProfileRepository.save(wp);

        // 5. Run scheduler to auto-expire past-due availabilities
        availabilityExpiryScheduler.processExpiredAvailabilities();

        // 6. Verify worker profile is now unavailable in DB
        WorkerProfile wpExpired = workerProfileRepository.findById(workerUserId).get();
        assertFalse(wpExpired.isAvailable(), "Scheduler must mark expired worker as unavailable");
        assertNotNull(wpExpired.getAvailableUntil(), "availableUntil timestamp must be preserved");

        // 7. Employer search no longer returns worker as available
        mockMvc.perform(get("/api/v1/search/workers")
                .param("lat", "28.6315")
                .param("lon", "77.2167")
                .param("radius_km", "1.0")
                .param("available_now", "true")
                .header("Authorization", "Bearer " + employerAuth.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFound").value(0));

        // 8. Worker reactivates availability
        mockMvc.perform(patch("/api/v1/workers/me/availability")
                .header("Authorization", "Bearer " + workerAuth.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(enableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(true))
                .andExpect(jsonPath("$.effectiveAvailable").value(true));
    }
}
