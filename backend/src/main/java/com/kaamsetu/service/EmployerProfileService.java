package com.kaamsetu.service;

import com.kaamsetu.domain.entity.EmployerProfile;
import com.kaamsetu.domain.entity.User;
import com.kaamsetu.dto.profile.AddressDto;
import com.kaamsetu.dto.profile.EmployerProfileResponse;
import com.kaamsetu.dto.profile.EmployerProfileUpdateRequest;
import com.kaamsetu.exception.ResourceNotFoundException;
import com.kaamsetu.repository.EmployerProfileRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class EmployerProfileService {

    private final EmployerProfileRepository employerProfileRepository;
    private final GeocodingService geocodingService;
    private final AuditLogService auditLogService;

    public EmployerProfileService(
            EmployerProfileRepository employerProfileRepository,
            GeocodingService geocodingService,
            AuditLogService auditLogService) {
        this.employerProfileRepository = employerProfileRepository;
        this.geocodingService = geocodingService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public EmployerProfileResponse getEmployerProfile(UUID employerId) {
        EmployerProfile profile = employerProfileRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));

        return mapToResponse(profile);
    }

    @Transactional
    public EmployerProfileResponse updateEmployerProfile(User actor, EmployerProfileUpdateRequest request) {
        EmployerProfile profile = employerProfileRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));

        if (request.getBusinessName() != null && !request.getBusinessName().isBlank()) {
            profile.setBusinessName(request.getBusinessName());
        }
        if (request.getOwnerName() != null && !request.getOwnerName().isBlank()) {
            profile.setOwnerName(request.getOwnerName());
        }
        if (request.getBusinessTrade() != null) {
            profile.setBusinessTrade(request.getBusinessTrade());
        }
        if (request.getYearsInBusiness() != null) {
            if (request.getYearsInBusiness() < 0 || request.getYearsInBusiness() > 150) {
                throw new IllegalArgumentException("Years in business must be between 0 and 150");
            }
            profile.setYearsInBusiness(request.getYearsInBusiness());
        }
        if (request.getTypicalRolesHired() != null) {
            profile.setTypicalRolesHired(request.getTypicalRolesHired());
        }
        if (request.getPhotoUrl() != null && !request.getPhotoUrl().isBlank()) {
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

        profile = employerProfileRepository.save(profile);
        auditLogService.log(actor, "EMPLOYER_PROFILE_UPDATED", "{\"user_id\":\"" + actor.getId() + "\"}");

        return mapToResponse(profile);
    }

    private EmployerProfileResponse mapToResponse(EmployerProfile profile) {
        EmployerProfileResponse res = new EmployerProfileResponse();
        res.setUserId(profile.getUserId());
        res.setBusinessName(profile.getBusinessName());
        res.setOwnerName(profile.getOwnerName());
        res.setBusinessTrade(profile.getBusinessTrade());
        res.setYearsInBusiness(profile.getYearsInBusiness());
        res.setTypicalRolesHired(profile.getTypicalRolesHired());
        res.setPhotoUrl(profile.getPhotoUrl());

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

        return res;
    }
}
