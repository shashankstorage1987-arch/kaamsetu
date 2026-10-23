package com.kaamsetu.service;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.entity.WorkerExperience;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.HireStatus;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.dto.profile.*;
import com.kaamsetu.exception.ResourceNotFoundException;
import com.kaamsetu.repository.WorkerProfileRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkerProfileService {

    private final WorkerProfileRepository workerProfileRepository;
    private final GeocodingService geocodingService;
    private final AuditLogService auditLogService;
    private final RedisAvailabilityService redisAvailabilityService;

    public WorkerProfileService(
            WorkerProfileRepository workerProfileRepository,
            GeocodingService geocodingService,
            AuditLogService auditLogService,
            RedisAvailabilityService redisAvailabilityService) {
        this.workerProfileRepository = workerProfileRepository;
        this.geocodingService = geocodingService;
        this.auditLogService = auditLogService;
        this.redisAvailabilityService = redisAvailabilityService;
    }

    @Transactional
    public WorkerAvailabilityResponse getAvailability(UUID workerId) {
        WorkerProfile profile = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        // If worker marked themselves available during onboarding (isAvailable=true) but availableUntil is null,
        // initialize the fresh 12-hour availability window and warm the Redis cache.
        if (profile.isAvailable() && profile.getAvailableUntil() == null) {
            profile.setAvailableUntil(OffsetDateTime.now().plusHours(12));
            profile = workerProfileRepository.save(profile);
            redisAvailabilityService.cacheAvailability(workerId, profile.getAvailableUntil());
        }

        boolean effective = checkEffectiveAvailability(profile);
        if (profile.isAvailable() && !effective) {
            // Auto-expire in database if past due
            profile.setAvailable(false);
            workerProfileRepository.save(profile);
            redisAvailabilityService.evictAvailability(workerId);
        }

        long remaining = 0L;
        if (effective && profile.getAvailableUntil() != null) {
            remaining = Math.max(0L, java.time.Duration.between(OffsetDateTime.now(), profile.getAvailableUntil()).getSeconds());
        }

        return new WorkerAvailabilityResponse(profile.isAvailable(), profile.getAvailableUntil(), remaining, effective);
    }

    @Transactional
    public WorkerAvailabilityResponse setAvailability(User actor, WorkerAvailabilityRequest request) {
        WorkerProfile profile = workerProfileRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        boolean wantAvailable = Boolean.TRUE.equals(request.getIsAvailable());
        boolean currentlyActive = checkEffectiveAvailability(profile);

        if (wantAvailable) {
            if (!currentlyActive) {
                // Activate fresh 12-hour window
                profile.setAvailable(true);
                profile.setAvailableUntil(OffsetDateTime.now().plusHours(12));
            }
            // If already active, maintain existing availableUntil (idempotency rule)
            redisAvailabilityService.cacheAvailability(profile.getUserId(), profile.getAvailableUntil());
        } else {
            profile.setAvailable(false);
            // availableUntil timestamp is preserved, not set to null
            redisAvailabilityService.evictAvailability(profile.getUserId());
        }

        profile = workerProfileRepository.save(profile);
        auditLogService.log(actor, "AVAILABILITY_TOGGLED",
                "{\"user_id\":\"" + actor.getId() + "\",\"is_available\":" + profile.isAvailable() + "}");

        boolean effective = checkEffectiveAvailability(profile);
        long remaining = 0L;
        if (effective && profile.getAvailableUntil() != null) {
            remaining = Math.max(0L, java.time.Duration.between(OffsetDateTime.now(), profile.getAvailableUntil()).getSeconds());
        }

        return new WorkerAvailabilityResponse(profile.isAvailable(), profile.getAvailableUntil(), remaining, effective);
    }

    public static boolean checkEffectiveAvailability(WorkerProfile profile) {
        return profile != null
                && profile.isAvailable()
                && profile.getAvailableUntil() != null
                && profile.getAvailableUntil().isAfter(OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public WorkerProfileResponse getWorkerProfile(UUID workerId) {
        return getWorkerProfile(null, workerId);
    }

    @Transactional(readOnly = true)
    public WorkerProfileResponse getWorkerProfile(UUID viewingUserId, UUID workerId) {
        WorkerProfile profile = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        return mapToResponse(profile, viewingUserId);
    }

    @Transactional
    public ContactRevealResponse revealContact(User employerActor, UUID workerId) {
        WorkerProfile profile = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        String rawPhone = profile.getUser() != null ? profile.getUser().getPhoneNumber() : "";
        
        auditLogService.log(employerActor, "CONTACT_REVEALED", 
                "{\"worker_id\":\"" + workerId + "\",\"phone_masked\":\"" + maskPhoneNumber(rawPhone) + "\"}");

        return new ContactRevealResponse(workerId, profile.getFullName(), rawPhone, OffsetDateTime.now());
    }

    @Transactional
    public WorkerProfileResponse updateWorkerProfile(User actor, WorkerProfileUpdateRequest request) {
        WorkerProfile profile = workerProfileRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            profile.setFullName(request.getFullName());
        }
        if (request.getTotalExperienceYears() != null) {
            profile.setTotalExperienceYears(request.getTotalExperienceYears());
        }
        if (request.getLanguages() != null) {
            profile.setLanguages(request.getLanguages());
        }
        if (request.getPreferredSalary() != null) {
            if (request.getPreferredSalary() < 1000 || request.getPreferredSalary() > 500000) {
                throw new IllegalArgumentException("Preferred monthly salary must be between ₹1,000 and ₹5,00,000");
            }
            profile.setPreferredSalary(request.getPreferredSalary());
        }
        if (request.getPreferredDistanceKm() != null) {
            if (request.getPreferredDistanceKm().compareTo(new BigDecimal("0.5")) < 0 
                    || request.getPreferredDistanceKm().compareTo(new BigDecimal("100.0")) > 0) {
                throw new IllegalArgumentException("Preferred distance must be between 0.5 KM and 100.0 KM");
            }
            profile.setPreferredDistanceKm(request.getPreferredDistanceKm());
        }
        if (request.getIsAvailable() != null) {
            profile.setAvailable(request.getIsAvailable());
            // available_until MUST remain NULL in Phase 1 profile onboarding/updates
        }

        if (request.getPhotoUrl() != null) {
            profile.setPhotoUrl(request.getPhotoUrl());
        }

        if (request.getLatitude() != null && request.getLongitude() != null) {
            Point point = geocodingService.createPoint(request.getLatitude(), request.getLongitude());
            profile.setLocation(point);
            if (request.getAddressLine() != null) profile.setAddressLine(request.getAddressLine());
            if (request.getArea() != null) profile.setArea(request.getArea());
            if (request.getCity() != null) profile.setCity(request.getCity());
            if (request.getPincode() != null) profile.setPincode(request.getPincode());
        } else if (request.getAddressLine() != null || request.getArea() != null || request.getCity() != null || request.getPincode() != null) {
            if (request.getAddressLine() != null) profile.setAddressLine(request.getAddressLine());
            if (request.getArea() != null) profile.setArea(request.getArea());
            if (request.getCity() != null) profile.setCity(request.getCity());
            if (request.getPincode() != null) profile.setPincode(request.getPincode());

            Point point = geocodingService.geocodeAddress(profile.getAddressLine(), profile.getArea(), profile.getCity(), profile.getPincode());
            profile.setLocation(point);
        }

        if (request.getExperiences() != null) {
            profile.getExperiences().clear();
            for (WorkerExperienceDto dto : request.getExperiences()) {
                if (dto.getDurationMonths() != null && dto.getDurationMonths() < 0) {
                    throw new IllegalArgumentException("Experience duration cannot be negative");
                }
                String prevEmp = (dto.getPreviousEmployerName() != null && !dto.getPreviousEmployerName().isBlank())
                        ? dto.getPreviousEmployerName()
                        : (dto.getDurationMonths() != null && dto.getDurationMonths() == 0 ? "Fresher" : "Self-Employed");
                WorkerExperience exp = new WorkerExperience(
                        dto.getTrade(),
                        dto.getProfession(),
                        prevEmp,
                        dto.getDurationMonths() != null ? Math.max(0, dto.getDurationMonths()) : 0
                );
                if (dto.getCoreSkills() != null) {
                    exp.setCoreSkills(dto.getCoreSkills());
                }
                profile.addExperience(exp);
            }
        }

        profile = workerProfileRepository.save(profile);
        auditLogService.log(actor, "WORKER_PROFILE_UPDATED", "{\"user_id\":\"" + actor.getId() + "\"}");

        return mapToResponse(profile, actor.getId());
    }

    private WorkerProfileResponse mapToResponse(WorkerProfile profile, UUID viewingUserId) {
        WorkerProfileResponse res = new WorkerProfileResponse();
        res.setUserId(profile.getUserId());
        res.setFullName(profile.getFullName());
        res.setTotalExperienceYears(profile.getTotalExperienceYears());
        res.setLanguages(profile.getLanguages());
        res.setPreferredSalary(profile.getPreferredSalary());
        res.setPreferredDistanceKm(profile.getPreferredDistanceKm());
        res.setIsAvailable(profile.isAvailable());
        res.setAvailableUntil(profile.getAvailableUntil());
        res.setPhotoUrl(profile.getPhotoUrl());

        String rawPhone = profile.getUser() != null ? profile.getUser().getPhoneNumber() : "";
        if (viewingUserId != null && viewingUserId.equals(profile.getUserId())) {
            res.setPhoneNumber(rawPhone);
        } else {
            res.setPhoneNumber(maskPhoneNumber(rawPhone));
        }

        if (profile.getUser() != null) {
            res.setAadhaarVerified(profile.getUser().isAadhaarVerified());
        } else {
            res.setAadhaarVerified(false);
        }

        if (profile.getAddressLine() != null || profile.getArea() != null || profile.getLocation() != null) {
            AddressDto address = new AddressDto();
            address.setAddressLine(profile.getAddressLine());
            address.setArea(profile.getArea());
            address.setCity(profile.getCity());
            address.setPincode(profile.getPincode());
            if (profile.getLocation() != null) {
                address.setLatitude(profile.getLocation().getY());
                address.setLongitude(profile.getLocation().getX());
            }
            res.setAddress(address);
        }

        res.setExperiences(profile.getExperiences().stream()
                .map(exp -> new WorkerExperienceDto(exp.getId(), exp.getTrade(), exp.getProfession(), exp.getPreviousEmployerName(), exp.getDurationMonths(), exp.getCoreSkills()))
                .collect(Collectors.toList()));

        List<TradeType> trades = workerProfileRepository.findDistinctTradesWorked(profile.getUserId());
        res.setShopCategories(trades.stream().map(Enum::name).collect(Collectors.toList()));

        long hiresCount = workerProfileRepository.countRecentlyCompletedHires(profile.getUserId(), HireStatus.CONFIRMED, OffsetDateTime.now().minusMonths(3));
        res.setRecentlyCompletedHiresCount(hiresCount);

        return res;
    }

    public static String maskPhoneNumber(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) return "+91 XXXXX XXXXX";
        String digits = rawPhone.replaceAll("\\D", "");
        if (digits.length() >= 10) {
            String last4 = digits.substring(digits.length() - 4);
            return "+91 XXXXX X" + last4;
        }
        return "+91 XXXXX XXXXX";
    }
}
