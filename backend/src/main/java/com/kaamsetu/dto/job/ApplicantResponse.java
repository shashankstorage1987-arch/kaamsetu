package com.kaamsetu.dto.job;

import com.kaamsetu.domain.enums.ApplicationStatus;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ApplicantResponse {

    private UUID workerId;
    private String fullName;
    private TradeType trade;
    private ProfessionType profession;
    private BigDecimal experienceYears;
    private BigDecimal distanceKm;
    private Boolean isAvailable;
    private Boolean aadhaarVerified;
    private BigDecimal matchScore;
    private ApplicationStatus status;
    private OffsetDateTime expressedInterestAt;

    public ApplicantResponse() {}

    public UUID getWorkerId() { return workerId; }
    public void setWorkerId(UUID workerId) { this.workerId = workerId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public BigDecimal getExperienceYears() { return experienceYears; }
    public void setExperienceYears(BigDecimal experienceYears) { this.experienceYears = experienceYears; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Boolean getAadhaarVerified() { return aadhaarVerified; }
    public void setAadhaarVerified(Boolean aadhaarVerified) { this.aadhaarVerified = aadhaarVerified; }

    public BigDecimal getMatchScore() { return matchScore; }
    public void setMatchScore(BigDecimal matchScore) { this.matchScore = matchScore; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public OffsetDateTime getExpressedInterestAt() { return expressedInterestAt; }
    public void setExpressedInterestAt(OffsetDateTime expressedInterestAt) { this.expressedInterestAt = expressedInterestAt; }
}
