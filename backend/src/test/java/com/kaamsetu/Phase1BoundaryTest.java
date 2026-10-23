package com.kaamsetu;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.dto.auth.AuthResponse;
import com.kaamsetu.dto.auth.WorkerSignUpRequest;
import com.kaamsetu.dto.profile.WorkerProfileResponse;
import com.kaamsetu.dto.profile.WorkerProfileUpdateRequest;
import com.kaamsetu.repository.UserDeviceRepository;
import com.kaamsetu.service.AuthService;
import com.kaamsetu.service.WorkerProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class Phase1BoundaryTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private WorkerProfileService workerProfileService;

    @Autowired
    private UserDeviceRepository userDeviceRepository;

    @Test
    public void testPhase1AvailabilityAndFcmBoundaries() {
        // 1. Signup Worker
        WorkerSignUpRequest workerReq = new WorkerSignUpRequest();
        workerReq.setFullName("Ramesh Kumar");
        workerReq.setPhoneNumber("9555443322");
        workerReq.setPin("123456");
        workerReq.setAadhaarNumber("555566667777");

        AuthResponse authResp = authService.signupWorker(workerReq);

        User user = new User();
        user.setId(authResp.getUserId());

        // 2. Initial Preference in Onboarding (Screen 1.4 preferences)
        WorkerProfileUpdateRequest updateReq = new WorkerProfileUpdateRequest();
        updateReq.setIsAvailable(true); // Preference toggled to true in onboarding

        WorkerProfileResponse profileResp = workerProfileService.updateWorkerProfile(user, updateReq);

        // Preference boolean stored
        assertTrue(profileResp.getIsAvailable());
        // available_until MUST REMAIN NULL (Phase 3 engine boundary)
        assertNull(profileResp.getAvailableUntil(), "available_until must remain NULL during Phase 1 onboarding");

        // 3. User device count in Phase 1 remains 0 (No FCM token registration in Phase 1)
        long deviceCount = userDeviceRepository.count();
        assertEquals(0, deviceCount, "user_devices table must remain unused for token registration in Phase 1");
    }
}
