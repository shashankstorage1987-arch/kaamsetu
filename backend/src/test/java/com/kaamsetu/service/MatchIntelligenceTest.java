package com.kaamsetu.service;

import com.kaamsetu.domain.entity.WorkerExperience;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.dto.search.WorkerSearchResultDto.MatchBreakdown;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class MatchIntelligenceTest {

    private MatchIntelligenceService matchIntelligenceService;

    @BeforeEach
    public void setUp() {
        matchIntelligenceService = new MatchIntelligenceService();
    }

    @Test
    public void testExact88PercentScoringExampleA() {
        // Example A from spec:
        // Job: Trade ELECTRICAL, Profession HELPER, Required Exp 2.0 yrs, Radius 1.0 km
        // Worker (Raj Kumar): 5.0 yrs in ELECTRICAL / HELPER, Distance 0.8 km, Available Now = true
        WorkerProfile rajKumar = new WorkerProfile();
        rajKumar.setUserId(UUID.randomUUID());
        rajKumar.setFullName("Raj Kumar");
        rajKumar.setTotalExperienceYears(new BigDecimal("5.0"));
        rajKumar.setAvailable(true);
        rajKumar.setAvailableUntil(OffsetDateTime.now().plusHours(12));

        WorkerExperience exp = new WorkerExperience(TradeType.ELECTRICAL, ProfessionType.HELPER, "ABC Electric", 60);
        rajKumar.addExperience(exp);

        MatchIntelligenceService.MatchResult result = matchIntelligenceService.calculateMatchScore(
                rajKumar,
                TradeType.ELECTRICAL,
                ProfessionType.HELPER,
                new BigDecimal("2.0"),
                new BigDecimal("0.8"),
                new BigDecimal("1.0")
        );

        // Trade Match: 35.0%
        // Profession Match: 30.0%
        // Experience Score: 15.0% (5.0 >= 2.0)
        // Distance Score: 3.0% (15.0 * (1.0 - 0.8/1.0) = 15.0 * 0.2 = 3.0%)
        // Availability Score: 5.0%
        // Total = 88.0%
        assertEquals(new BigDecimal("88.0"), result.getTotalScore());

        MatchBreakdown breakdown = result.getBreakdown();
        assertTrue(breakdown.isTradeMatch());
        assertTrue(breakdown.isProfessionMatch());
        assertEquals(new BigDecimal("35.0"), breakdown.getTradeScore());
        assertEquals(new BigDecimal("30.0"), breakdown.getProfessionScore());
        assertEquals(new BigDecimal("15.0"), breakdown.getExperienceScore());
        assertEquals(new BigDecimal("3.0"), breakdown.getDistanceScore());
        assertEquals(new BigDecimal("5.0"), breakdown.getAvailabilityScore());
    }

    @Test
    public void testPartialMatchExampleB() {
        // Example B from spec:
        // Job: Trade ELECTRICAL, Profession HELPER, Required Exp 2.0 yrs, Radius 1.0 km
        // Worker (Mohan Lal): 1.0 yr in ELECTRICAL / HELPER, Distance 0.5 km, Available Now = true
        WorkerProfile mohanLal = new WorkerProfile();
        mohanLal.setUserId(UUID.randomUUID());
        mohanLal.setFullName("Mohan Lal");
        mohanLal.setTotalExperienceYears(new BigDecimal("1.0"));
        mohanLal.setAvailable(true);
        mohanLal.setAvailableUntil(OffsetDateTime.now().plusHours(12));

        WorkerExperience exp = new WorkerExperience(TradeType.ELECTRICAL, ProfessionType.HELPER, "XYZ Wiring", 12);
        mohanLal.addExperience(exp);

        MatchIntelligenceService.MatchResult result = matchIntelligenceService.calculateMatchScore(
                mohanLal,
                TradeType.ELECTRICAL,
                ProfessionType.HELPER,
                new BigDecimal("2.0"),
                new BigDecimal("0.5"),
                new BigDecimal("1.0")
        );

        // Trade Match: 35.0%
        // Profession Match: 30.0%
        // Experience Score: 7.5% (15.0 * 1.0 / 2.0)
        // Distance Score: 7.5% (15.0 * (1.0 - 0.5/1.0) = 7.5%)
        // Availability Score: 5.0%
        // Total = 85.0%
        assertEquals(new BigDecimal("85.0"), result.getTotalScore());
    }

    @Test
    public void testRadiusExclusionExampleC() {
        // Example C from spec:
        // Distance 1.6 km > Radius 1.0 km -> distance score 0.0%
        WorkerProfile suresh = new WorkerProfile();
        suresh.setUserId(UUID.randomUUID());
        suresh.setFullName("Suresh V");
        suresh.setTotalExperienceYears(new BigDecimal("5.0"));
        suresh.setAvailable(false);

        WorkerExperience exp = new WorkerExperience(TradeType.ELECTRICAL, ProfessionType.HELPER, "Power Co", 60);
        suresh.addExperience(exp);

        MatchIntelligenceService.MatchResult result = matchIntelligenceService.calculateMatchScore(
                suresh,
                TradeType.ELECTRICAL,
                ProfessionType.HELPER,
                new BigDecimal("2.0"),
                new BigDecimal("1.6"),
                new BigDecimal("1.0")
        );

        assertEquals(new BigDecimal("0.0"), result.getBreakdown().getDistanceScore());
    }

    @Test
    public void testZeroRequiredExperienceFullCredit() {
        WorkerProfile worker = new WorkerProfile();
        worker.setUserId(UUID.randomUUID());
        worker.setFullName("New Worker");
        worker.setTotalExperienceYears(BigDecimal.ZERO);
        worker.setAvailable(true);
        worker.setAvailableUntil(OffsetDateTime.now().plusHours(12));

        MatchIntelligenceService.MatchResult result = matchIntelligenceService.calculateMatchScore(
                worker,
                TradeType.HARDWARE,
                ProfessionType.HELPER,
                BigDecimal.ZERO,
                new BigDecimal("0.0"),
                new BigDecimal("1.0")
        );

        assertEquals(new BigDecimal("15.0"), result.getBreakdown().getExperienceScore());
    }

    @Test
    public void testFresherWorkerFullTradeAndProfessionMatch() {
        WorkerProfile fresher = new WorkerProfile();
        fresher.setUserId(UUID.randomUUID());
        fresher.setFullName("Aakash Sharma");
        fresher.setTotalExperienceYears(BigDecimal.ZERO);
        fresher.setAvailable(true);
        fresher.setAvailableUntil(OffsetDateTime.now().plusHours(12));

        // Fresher experience with 0 months and null/fresher employer
        WorkerExperience exp = new WorkerExperience(TradeType.GROCERY, ProfessionType.HELPER, null, 0);
        assertEquals("Fresher", exp.getPreviousEmployerName());
        assertEquals(0, exp.getDurationMonths());
        fresher.addExperience(exp);

        MatchIntelligenceService.MatchResult result = matchIntelligenceService.calculateMatchScore(
                fresher,
                TradeType.GROCERY,
                ProfessionType.HELPER,
                BigDecimal.ZERO,
                new BigDecimal("0.5"),
                new BigDecimal("1.0")
        );

        // Trade Match: 35.0%
        // Profession Match: 30.0%
        // Experience Score: 15.0% (required = 0)
        // Distance Score: 7.5% (15 * (1 - 0.5/1.0))
        // Availability: 5.0%
        // Total = 92.5%
        assertEquals(new BigDecimal("92.5"), result.getTotalScore());
        MatchBreakdown breakdown = result.getBreakdown();
        assertTrue(breakdown.isTradeMatch());
        assertTrue(breakdown.isProfessionMatch());
        assertEquals(new BigDecimal("35.0"), breakdown.getTradeScore());
        assertEquals(new BigDecimal("30.0"), breakdown.getProfessionScore());
        assertEquals(new BigDecimal("15.0"), breakdown.getExperienceScore());
    }
}
