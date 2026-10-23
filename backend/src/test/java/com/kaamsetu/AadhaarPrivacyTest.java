package com.kaamsetu;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.dto.auth.AuthResponse;
import com.kaamsetu.dto.auth.WorkerSignUpRequest;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.service.AadhaarVerificationService;
import com.kaamsetu.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AadhaarPrivacyTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AadhaarVerificationService aadhaarVerificationService;

    @Test
    public void testAadhaarPrivacy_RawNumberNotPersisted() {
        String rawAadhaar = "999988887777";
        WorkerSignUpRequest request = new WorkerSignUpRequest();
        request.setFullName("Aadhaar Privacy Test Worker");
        request.setPhoneNumber("9876543210");
        request.setPin("123456");
        request.setAadhaarNumber(rawAadhaar);

        AuthResponse response = authService.signupWorker(request);
        assertNotNull(response);
        assertNotNull(response.getUserId());

        Optional<User> userOpt = userRepository.findById(response.getUserId());
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();

        // 1. Aadhaar verified flag must be true
        assertTrue(user.isAadhaarVerified());

        // 2. Reference ID token must be present and start with MOCK-AADHAAR-REF-
        assertNotNull(user.getAadhaarRefId());
        assertTrue(user.getAadhaarRefId().startsWith("MOCK-AADHAAR-REF-"));

        // 3. Raw 12-digit Aadhaar must NOT equal reference ID token or be found anywhere in entity
        assertNotEquals(rawAadhaar, user.getAadhaarRefId());
        assertFalse(user.getAadhaarRefId().contains(rawAadhaar));
    }
}
