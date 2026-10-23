package com.kaamsetu.service;

import com.kaamsetu.domain.entity.WorkerExperience;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.dto.search.WorkerSearchResultDto.MatchBreakdown;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class MatchIntelligenceService {

    public static class MatchResult {
        private final BigDecimal totalScore;
        private final MatchBreakdown breakdown;

        public MatchResult(BigDecimal totalScore, MatchBreakdown breakdown) {
            this.totalScore = totalScore;
            this.breakdown = breakdown;
        }

        public BigDecimal getTotalScore() { return totalScore; }
        public MatchBreakdown getBreakdown() { return breakdown; }
    }

    public MatchResult calculateMatchScore(
            WorkerProfile worker,
            TradeType requestedTrade,
            ProfessionType requestedProfession,
            BigDecimal requiredExpYears,
            BigDecimal distanceKm,
            BigDecimal radiusKm) {

        // 1. Trade Match (35%)
        boolean tradeMatch = false;
        if (requestedTrade != null && worker.getExperiences() != null) {
            tradeMatch = worker.getExperiences().stream()
                    .anyMatch(exp -> exp.getTrade() == requestedTrade);
        }
        BigDecimal tradeScore = tradeMatch ? new BigDecimal("35.0") : BigDecimal.ZERO;

        // 2. Profession Match (30%)
        boolean professionMatch = false;
        if (requestedTrade != null && requestedProfession != null && worker.getExperiences() != null) {
            professionMatch = worker.getExperiences().stream()
                    .anyMatch(exp -> exp.getTrade() == requestedTrade && exp.getProfession() == requestedProfession);
        }
        BigDecimal professionScore = professionMatch ? new BigDecimal("30.0") : BigDecimal.ZERO;

        // 3. Experience Score (15%)
        BigDecimal experienceScore;
        BigDecimal workerExp = worker.getTotalExperienceYears() != null ? worker.getTotalExperienceYears() : BigDecimal.ZERO;

        if (requiredExpYears == null || requiredExpYears.compareTo(BigDecimal.ZERO) <= 0 || workerExp.compareTo(requiredExpYears) >= 0) {
            experienceScore = new BigDecimal("15.0");
        } else {
            experienceScore = new BigDecimal("15.0")
                    .multiply(workerExp)
                    .divide(requiredExpYears, 4, RoundingMode.HALF_UP);
        }

        // 4. Distance Score (15%)
        BigDecimal distanceScore;
        BigDecimal radKm = (radiusKm != null && radiusKm.compareTo(BigDecimal.ZERO) > 0) ? radiusKm : new BigDecimal("1.0");
        BigDecimal distKm = distanceKm != null ? distanceKm : BigDecimal.ZERO;

        if (distKm.compareTo(radKm) > 0) {
            distanceScore = BigDecimal.ZERO;
        } else {
            // 15.0 * (1.0 - (d / radiusKm))
            BigDecimal ratio = distKm.divide(radKm, 4, RoundingMode.HALF_UP);
            BigDecimal factor = BigDecimal.ONE.subtract(ratio);
            distanceScore = new BigDecimal("15.0").multiply(factor);
        }

        // 5. Availability Score (5%)
        boolean isEffective = WorkerProfileService.checkEffectiveAvailability(worker);
        BigDecimal availabilityScore = isEffective ? new BigDecimal("5.0") : BigDecimal.ZERO;

        // Total sum
        BigDecimal totalScore = tradeScore
                .add(professionScore)
                .add(experienceScore)
                .add(distanceScore)
                .add(availabilityScore)
                .setScale(1, RoundingMode.HALF_UP);

        MatchBreakdown breakdown = new MatchBreakdown(
                tradeMatch,
                professionMatch,
                tradeScore.setScale(1, RoundingMode.HALF_UP),
                professionScore.setScale(1, RoundingMode.HALF_UP),
                experienceScore.setScale(1, RoundingMode.HALF_UP),
                distanceScore.setScale(1, RoundingMode.HALF_UP),
                availabilityScore.setScale(1, RoundingMode.HALF_UP)
        );

        return new MatchResult(totalScore, breakdown);
    }
}
