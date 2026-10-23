package com.kaamsetu.service;

import com.kaamsetu.domain.entity.AuditLog;
import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.UserRole;
import com.kaamsetu.dto.profile.WorkerAvailabilityRequest;
import com.kaamsetu.dto.profile.WorkerAvailabilityResponse;
import com.kaamsetu.repository.AuditLogRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class WorkerAvailabilityTest {

    private WorkerProfileRepository workerProfileRepository;
    private AuditLogRepository auditLogRepository;
    private AuditLogService auditLogService;
    private TestRedisAvailabilityService redisAvailabilityService;
    private WorkerProfileService workerProfileService;

    private User workerUser;
    private WorkerProfile profile;
    private UUID workerId;

    static class TestRedisAvailabilityService extends RedisAvailabilityService {
        final AtomicInteger cacheCount = new AtomicInteger(0);
        final AtomicInteger evictCount = new AtomicInteger(0);

        public TestRedisAvailabilityService() {
            super(null);
        }

        @Override
        public void cacheAvailability(UUID workerId, OffsetDateTime availableUntil) {
            cacheCount.incrementAndGet();
        }

        @Override
        public void evictAvailability(UUID workerId) {
            evictCount.incrementAndGet();
        }
    }

    @BeforeEach
    public void setUp() {
        workerProfileRepository = mock(WorkerProfileRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);
        auditLogService = new AuditLogService(auditLogRepository);
        redisAvailabilityService = new TestRedisAvailabilityService();

        workerProfileService = new WorkerProfileService(
                workerProfileRepository,
                null,
                auditLogService,
                redisAvailabilityService
        );

        workerId = UUID.randomUUID();
        workerUser = new User();
        workerUser.setId(workerId);
        workerUser.setRole(UserRole.WORKER);
        workerUser.setPhoneNumber("9876543210");

        profile = new WorkerProfile(workerUser, "Ramesh Kumar");
        profile.setUserId(workerId);
        profile.setAvailable(false);
        profile.setAvailableUntil(null);

        when(workerProfileRepository.findById(workerId)).thenReturn(Optional.of(profile));
        when(workerProfileRepository.save(any(WorkerProfile.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    public void testEnableAvailability12HourDuration() {
        WorkerAvailabilityRequest req = new WorkerAvailabilityRequest(true);
        OffsetDateTime beforeCall = OffsetDateTime.now();

        WorkerAvailabilityResponse resp = workerProfileService.setAvailability(workerUser, req);

        assertTrue(resp.getIsAvailable());
        assertTrue(resp.getEffectiveAvailable());
        assertNotNull(resp.getAvailableUntil());

        // Verify availableUntil is ~12 hours from now
        OffsetDateTime expectedMax = beforeCall.plusHours(12).plusSeconds(5);
        OffsetDateTime expectedMin = beforeCall.plusHours(12).minusSeconds(5);
        assertTrue(resp.getAvailableUntil().isBefore(expectedMax));
        assertTrue(resp.getAvailableUntil().isAfter(expectedMin));

        assertEquals(1, redisAvailabilityService.cacheCount.get());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    public void testIdempotencyOnRepeatedTaps() {
        // First tap: set available
        WorkerAvailabilityRequest req = new WorkerAvailabilityRequest(true);
        WorkerAvailabilityResponse firstResp = workerProfileService.setAvailability(workerUser, req);
        OffsetDateTime firstUntil = firstResp.getAvailableUntil();

        // Second tap immediately: should NOT reset or extend the 12h window
        WorkerAvailabilityResponse secondResp = workerProfileService.setAvailability(workerUser, req);
        assertEquals(firstUntil, secondResp.getAvailableUntil(), "Repeated taps must maintain original 12h expiry");
    }

    @Test
    public void testDisableAvailabilityPreservesTimestamp() {
        // Enable first
        WorkerAvailabilityRequest reqOn = new WorkerAvailabilityRequest(true);
        WorkerAvailabilityResponse onResp = workerProfileService.setAvailability(workerUser, reqOn);
        OffsetDateTime originalUntil = onResp.getAvailableUntil();

        // Disable
        WorkerAvailabilityRequest reqOff = new WorkerAvailabilityRequest(false);
        WorkerAvailabilityResponse offResp = workerProfileService.setAvailability(workerUser, reqOff);

        assertFalse(offResp.getIsAvailable());
        assertFalse(offResp.getEffectiveAvailable());
        assertEquals(0L, offResp.getRemainingSeconds());
        assertEquals(originalUntil, offResp.getAvailableUntil(), "Disabling availability must preserve available_until timestamp");

        assertEquals(1, redisAvailabilityService.evictCount.get());
    }

    @Test
    public void testEffectiveAvailabilityBoundaries() {
        WorkerProfile wp = new WorkerProfile();
        wp.setAvailable(true);

        // Boundary 1: now - 1 second -> false
        wp.setAvailableUntil(OffsetDateTime.now().minusSeconds(1));
        assertFalse(WorkerProfileService.checkEffectiveAvailability(wp));

        // Boundary 2: now + 1 second -> true
        wp.setAvailableUntil(OffsetDateTime.now().plusSeconds(5));
        assertTrue(WorkerProfileService.checkEffectiveAvailability(wp));

        // Boundary 3: null -> false
        wp.setAvailableUntil(null);
        assertFalse(WorkerProfileService.checkEffectiveAvailability(wp));

        // Boundary 4: isAvailable = false but availableUntil in future -> false
        wp.setAvailable(false);
        wp.setAvailableUntil(OffsetDateTime.now().plusHours(1));
        assertFalse(WorkerProfileService.checkEffectiveAvailability(wp));
    }

    @Test
    public void testGetAvailabilityInitializesWindowWhenAvailableUntilIsNull() {
        profile.setAvailable(true);
        profile.setAvailableUntil(null);

        WorkerAvailabilityResponse resp = workerProfileService.getAvailability(workerId);

        assertTrue(resp.getIsAvailable());
        assertTrue(resp.getEffectiveAvailable());
        assertNotNull(resp.getAvailableUntil());
        assertTrue(resp.getRemainingSeconds() > 0);
        assertEquals(1, redisAvailabilityService.cacheCount.get());
    }
}
