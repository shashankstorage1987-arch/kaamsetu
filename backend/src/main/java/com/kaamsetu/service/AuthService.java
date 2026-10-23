package com.kaamsetu.service;

import com.kaamsetu.domain.entity.EmployerProfile;
import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.entity.UserDevice;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.domain.enums.UserRole;
import com.kaamsetu.dto.auth.*;
import com.kaamsetu.exception.BadRequestException;
import com.kaamsetu.exception.ResourceNotFoundException;
import com.kaamsetu.exception.UnauthorizedException;
import com.kaamsetu.repository.EmployerProfileRepository;
import com.kaamsetu.repository.UserDeviceRepository;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import com.kaamsetu.security.JwtTokenProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final UserDeviceRepository userDeviceRepository;
    private final AadhaarVerificationService aadhaarVerificationService;
    private final RateLimiterService rateLimiterService;
    private final AuditLogService auditLogService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;

    public AuthService(
            UserRepository userRepository,
            WorkerProfileRepository workerProfileRepository,
            EmployerProfileRepository employerProfileRepository,
            UserDeviceRepository userDeviceRepository,
            AadhaarVerificationService aadhaarVerificationService,
            RateLimiterService rateLimiterService,
            AuditLogService auditLogService,
            JwtTokenProvider tokenProvider,
            PasswordEncoder passwordEncoder,
            StringRedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.userDeviceRepository = userDeviceRepository;
        this.aadhaarVerificationService = aadhaarVerificationService;
        this.rateLimiterService = rateLimiterService;
        this.auditLogService = auditLogService;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.redisTemplate = redisTemplate;
    }

    @Transactional
    public AuthResponse signupWorker(WorkerSignUpRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number is already registered");
        }

        AadhaarVerificationService.AadhaarVerificationResult verificationResult =
                aadhaarVerificationService.verifyAadhaar(request.getAadhaarNumber());

        if (!verificationResult.isVerified()) {
            throw new BadRequestException("Aadhaar verification failed");
        }

        User user = new User(request.getPhoneNumber(), passwordEncoder.encode(request.getPin()), UserRole.WORKER);
        user.setAadhaarVerified(true);
        user.setAadhaarRefId(verificationResult.getReferenceId());
        user = userRepository.save(user);

        WorkerProfile workerProfile = new WorkerProfile(user, request.getFullName());
        workerProfileRepository.save(workerProfile);

        auditLogService.log(user, "WORKER_REGISTERED", "{\"role\":\"WORKER\"}");

        String token = tokenProvider.generateToken(user.getId(), user.getPhoneNumber(), user.getRole());
        return new AuthResponse(user.getId(), user.getPhoneNumber(), user.getRole(), token, tokenProvider.getExpirationMs() / 1000);
    }

    @Transactional
    public AuthResponse signupEmployer(EmployerSignUpRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number is already registered");
        }

        User user = new User(request.getPhoneNumber(), passwordEncoder.encode(request.getPin()), UserRole.EMPLOYER);
        user = userRepository.save(user);

        EmployerProfile employerProfile = new EmployerProfile(user, request.getBusinessName(), request.getOwnerName(), TradeType.OTHER);
        employerProfileRepository.save(employerProfile);

        auditLogService.log(user, "EMPLOYER_REGISTERED", "{\"role\":\"EMPLOYER\"}");

        String token = tokenProvider.generateToken(user.getId(), user.getPhoneNumber(), user.getRole());
        return new AuthResponse(user.getId(), user.getPhoneNumber(), user.getRole(), token, tokenProvider.getExpirationMs() / 1000);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        rateLimiterService.checkLoginRateLimit(request.getPhoneNumber());

        Optional<User> userOptional = userRepository.findByPhoneNumber(request.getPhoneNumber());
        if (userOptional.isEmpty() || !passwordEncoder.matches(request.getPin(), userOptional.get().getPinHash())) {
            rateLimiterService.recordFailedLoginAttempt(request.getPhoneNumber());
            auditLogService.log(null, "LOGIN_FAILED", "{\"phone\":\"" + request.getPhoneNumber() + "\"}");
            throw new UnauthorizedException("Invalid phone number or PIN");
        }

        User user = userOptional.get();
        if (user.isSuspended()) {
            throw new UnauthorizedException("Account is suspended. Please contact support.");
        }

        rateLimiterService.resetFailedLoginAttempts(request.getPhoneNumber());

        String token = tokenProvider.generateToken(user.getId(), user.getPhoneNumber(), user.getRole());
        return new AuthResponse(user.getId(), user.getPhoneNumber(), user.getRole(), token, tokenProvider.getExpirationMs() / 1000);
    }

    public OtpResponse requestForgotPinOtp(ForgotPinRequestOtpRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new ResourceNotFoundException("This mobile number is not registered with KaamSetu. Please verify your number or register as a new user."));

        String mockOtp = "123456";
        String redisKey = "otp:" + request.getPhoneNumber();
        redisTemplate.opsForValue().set(redisKey, mockOtp, Duration.ofMinutes(5));

        auditLogService.log(user, "OTP_REQUESTED", "{\"phone\":\"" + request.getPhoneNumber() + "\"}");

        return new OtpResponse("OTP sent successfully", UUID.randomUUID());
    }

    @Transactional
    public void resetForgotPin(ForgotPinResetRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new ResourceNotFoundException("This mobile number is not registered with KaamSetu. Please verify your number or register as a new user."));

        String redisKey = "otp:" + request.getPhoneNumber();
        String storedOtp = redisTemplate.opsForValue().get(redisKey);

        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new BadRequestException("The OTP entered is incorrect or has expired. Please try again.");
        }

        user.setPinHash(passwordEncoder.encode(request.getNewPin()));
        userRepository.save(user);

        redisTemplate.delete(redisKey);
        auditLogService.log(user, "PIN_RESET_SUCCESS", "{\"phone\":\"" + request.getPhoneNumber() + "\"}");
    }

    @Transactional
    public void logout(User actor, String jwtToken, LogoutRequest logoutRequest) {
        if (jwtToken != null) {
            String redisKey = "jwt_blocklist:" + jwtToken;
            redisTemplate.opsForValue().set(redisKey, "true", Duration.ofMillis(tokenProvider.getExpirationMs()));
        }

        if (logoutRequest != null && logoutRequest.getFcmToken() != null && !logoutRequest.getFcmToken().isBlank()) {
            Optional<UserDevice> deviceOpt = userDeviceRepository.findByUserIdAndFcmToken(actor.getId(), logoutRequest.getFcmToken());
            deviceOpt.ifPresent(device -> {
                device.setActive(false);
                userDeviceRepository.save(device);
            });
        }
    }
}
