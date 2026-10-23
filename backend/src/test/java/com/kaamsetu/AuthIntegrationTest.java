package com.kaamsetu;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.enums.UserRole;
import com.kaamsetu.dto.auth.*;
import com.kaamsetu.exception.UnauthorizedException;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testWorkerAndEmployerSignupAndLogin() {
        // 1. Worker Signup
        WorkerSignUpRequest workerReq = new WorkerSignUpRequest();
        workerReq.setFullName("Rahul Verma");
        workerReq.setPhoneNumber("9123456780");
        workerReq.setPin("654321");
        workerReq.setAadhaarNumber("111122223333");

        AuthResponse workerResp = authService.signupWorker(workerReq);
        assertNotNull(workerResp.getToken());
        assertEquals(UserRole.WORKER, workerResp.getRole());

        // Verify PIN is BCrypt hashed in DB
        Optional<User> workerUserOpt = userRepository.findById(workerResp.getUserId());
        assertTrue(workerUserOpt.isPresent());
        assertTrue(passwordEncoder.matches("654321", workerUserOpt.get().getPinHash()));
        assertNotEquals("654321", workerUserOpt.get().getPinHash());

        // 2. Employer Signup
        EmployerSignUpRequest empReq = new EmployerSignUpRequest();
        empReq.setBusinessName("Gupta Electronics");
        empReq.setOwnerName("Suresh Gupta");
        empReq.setPhoneNumber("9988776655");
        empReq.setPin("112233");

        AuthResponse empResp = authService.signupEmployer(empReq);
        assertNotNull(empResp.getToken());
        assertEquals(UserRole.EMPLOYER, empResp.getRole());

        // 3. Login Success
        LoginRequest loginReq = new LoginRequest();
        loginReq.setPhoneNumber("9123456780");
        loginReq.setPin("654321");

        AuthResponse loginResp = authService.login(loginReq);
        assertNotNull(loginResp.getToken());
        assertEquals(UserRole.WORKER, loginResp.getRole());

        // 4. Login Failure
        LoginRequest badLogin = new LoginRequest();
        badLogin.setPhoneNumber("9123456780");
        badLogin.setPin("000000");

        assertThrows(UnauthorizedException.class, () -> authService.login(badLogin));
    }
}
