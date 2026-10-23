package com.kaamsetu.service;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.entity.WorkerExperience;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.dto.search.WorkerSearchRequest;
import com.kaamsetu.dto.search.WorkerSearchResponse;
import com.kaamsetu.dto.search.WorkerSearchResultDto;
import com.kaamsetu.repository.JobInterestRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final WorkerProfileRepository workerProfileRepository;
    private final MatchIntelligenceService matchIntelligenceService;
    private final JobInterestRepository jobInterestRepository;

    public SearchService(WorkerProfileRepository workerProfileRepository,
                         MatchIntelligenceService matchIntelligenceService,
                         JobInterestRepository jobInterestRepository) {
        this.workerProfileRepository = workerProfileRepository;
        this.matchIntelligenceService = matchIntelligenceService;
        this.jobInterestRepository = jobInterestRepository;
    }

    @Transactional(readOnly = true)
    public WorkerSearchResponse searchWorkers(double lat, double lon, WorkerSearchRequest request, User employerUser) {
        BigDecimal radiusKm = (request.getRadiusKm() != null && request.getRadiusKm().compareTo(BigDecimal.ZERO) > 0)
                ? request.getRadiusKm()
                : new BigDecimal("1.0");

        boolean isUnconstrained = radiusKm.compareTo(new BigDecimal("500")) >= 0;

        List<WorkerProfile> candidates;
        if (isUnconstrained) {
            candidates = workerProfileRepository.findAll();
        } else {
            double radiusMeters = radiusKm.doubleValue() * 1000.0;
            candidates = workerProfileRepository.findNearbyCandidates(lat, lon, radiusMeters);
        }

        List<WorkerSearchResultDto> results = new ArrayList<>();

        for (WorkerProfile worker : candidates) {
            boolean isEffectiveAvailable = WorkerProfileService.checkEffectiveAvailability(worker);

            // Hard filters
            if (Boolean.TRUE.equals(request.getAvailableNow()) && !isEffectiveAvailable) {
                continue;
            }

            if (Boolean.TRUE.equals(request.getVerified()) && (worker.getUser() == null || !worker.getUser().isAadhaarVerified())) {
                continue;
            }

            if (request.getSalaryMax() != null && worker.getPreferredSalary() != null && worker.getPreferredSalary() > request.getSalaryMax()) {
                continue;
            }

            if (request.getExperienceMin() != null && worker.getTotalExperienceYears() != null
                    && worker.getTotalExperienceYears().compareTo(request.getExperienceMin()) < 0) {
                continue;
            }

            if (request.getTrade() != null) {
                boolean hasTradeMatch = worker.getExperiences() != null && worker.getExperiences().stream()
                        .anyMatch(exp -> exp.getTrade() == request.getTrade());
                if (!hasTradeMatch) {
                    continue;
                }
            }

            if (request.getProfession() != null) {
                boolean hasProfessionMatch = worker.getExperiences() != null && worker.getExperiences().stream()
                        .anyMatch(exp -> exp.getProfession() == request.getProfession());
                if (!hasProfessionMatch) {
                    continue;
                }
            }

            // Calculate exact distance using Haversine
            double workerLat = worker.getLocation() != null ? worker.getLocation().getY() : lat;
            double workerLon = worker.getLocation() != null ? worker.getLocation().getX() : lon;
            BigDecimal distKm = calculateHaversineDistanceKm(lat, lon, workerLat, workerLon);

            // Hard exclusion check if outside radius (unless 500KM+)
            if (!isUnconstrained && distKm.compareTo(radiusKm) > 0) {
                continue;
            }

            // Match Intelligence Scoring
            MatchIntelligenceService.MatchResult matchResult = matchIntelligenceService.calculateMatchScore(
                    worker,
                    request.getTrade(),
                    request.getProfession(),
                    request.getExperienceMin(),
                    distKm,
                    radiusKm
            );

            WorkerSearchResultDto dto = new WorkerSearchResultDto();
            dto.setWorkerId(worker.getUserId());
            dto.setFullName(worker.getFullName());
            dto.setPhotoUrl(worker.getPhotoUrl());

            // Worker's actual Primary Trade and Profession for UI display
            TradeType primaryTrade = null;
            ProfessionType primaryProfession = null;
            if (worker.getExperiences() != null && !worker.getExperiences().isEmpty()) {
                primaryTrade = worker.getExperiences().get(0).getTrade();
                primaryProfession = worker.getExperiences().get(0).getProfession();
            }
            dto.setTrade(primaryTrade);
            dto.setProfession(primaryProfession);

            dto.setExperienceYears(worker.getTotalExperienceYears());
            dto.setDistanceKm(distKm);
            dto.setAvailable(isEffectiveAvailable);
            dto.setAadhaarVerified(worker.getUser() != null && worker.getUser().isAadhaarVerified());
            dto.setMatchScore(matchResult.getTotalScore());
            dto.setMatchBreakdown(matchResult.getBreakdown());

            boolean hasApplied = (employerUser != null)
                    ? jobInterestRepository.existsByWorkerIdAndEmployerId(worker.getUserId(), employerUser.getId())
                    : jobInterestRepository.existsByWorkerProfileUserId(worker.getUserId());
            dto.setHasApplied(hasApplied);

            results.add(dto);
        }

        // Deterministic sorting: matchScore DESC, distanceKm ASC, workerId ASC
        results.sort(Comparator
                .comparing(WorkerSearchResultDto::getMatchScore, Comparator.reverseOrder())
                .thenComparing(WorkerSearchResultDto::getDistanceKm)
                .thenComparing(WorkerSearchResultDto::getWorkerId));

        return new WorkerSearchResponse(results.size(), radiusKm, results);
    }

    public static BigDecimal calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return BigDecimal.valueOf(R * c).setScale(2, RoundingMode.HALF_UP);
    }
}
