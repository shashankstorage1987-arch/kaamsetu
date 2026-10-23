package com.kaamsetu.dto.search;

import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;

import java.math.BigDecimal;
import java.util.UUID;

public class WorkerSearchResultDto {

    private UUID workerId;
    private String fullName;
    private String photoUrl;
    private TradeType trade;
    private ProfessionType profession;
    private BigDecimal experienceYears;
    private BigDecimal distanceKm;
    private boolean isAvailable;
    private boolean aadhaarVerified;
    private BigDecimal matchScore;
    private Boolean hasApplied;
    private MatchBreakdown matchBreakdown;

    public static class MatchBreakdown {
        private boolean tradeMatch;
        private boolean professionMatch;
        private BigDecimal tradeScore;
        private BigDecimal professionScore;
        private BigDecimal experienceScore;
        private BigDecimal distanceScore;
        private BigDecimal availabilityScore;

        public MatchBreakdown() {}

        public MatchBreakdown(boolean tradeMatch, boolean professionMatch, BigDecimal tradeScore, BigDecimal professionScore, BigDecimal experienceScore, BigDecimal distanceScore, BigDecimal availabilityScore) {
            this.tradeMatch = tradeMatch;
            this.professionMatch = professionMatch;
            this.tradeScore = tradeScore;
            this.professionScore = professionScore;
            this.experienceScore = experienceScore;
            this.distanceScore = distanceScore;
            this.availabilityScore = availabilityScore;
        }

        public boolean isTradeMatch() { return tradeMatch; }
        public void setTradeMatch(boolean tradeMatch) { this.tradeMatch = tradeMatch; }

        public boolean isProfessionMatch() { return professionMatch; }
        public void setProfessionMatch(boolean professionMatch) { this.professionMatch = professionMatch; }

        public BigDecimal getTradeScore() { return tradeScore; }
        public void setTradeScore(BigDecimal tradeScore) { this.tradeScore = tradeScore; }

        public BigDecimal getProfessionScore() { return professionScore; }
        public void setProfessionScore(BigDecimal professionScore) { this.professionScore = professionScore; }

        public BigDecimal getExperienceScore() { return experienceScore; }
        public void setExperienceScore(BigDecimal experienceScore) { this.experienceScore = experienceScore; }

        public BigDecimal getDistanceScore() { return distanceScore; }
        public void setDistanceScore(BigDecimal distanceScore) { this.distanceScore = distanceScore; }

        public BigDecimal getAvailabilityScore() { return availabilityScore; }
        public void setAvailabilityScore(BigDecimal availabilityScore) { this.availabilityScore = availabilityScore; }
    }

    public WorkerSearchResultDto() {}

    public UUID getWorkerId() { return workerId; }
    public void setWorkerId(UUID workerId) { this.workerId = workerId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public BigDecimal getExperienceYears() { return experienceYears; }
    public void setExperienceYears(BigDecimal experienceYears) { this.experienceYears = experienceYears; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public boolean isAadhaarVerified() { return aadhaarVerified; }
    public void setAadhaarVerified(boolean aadhaarVerified) { this.aadhaarVerified = aadhaarVerified; }

    public BigDecimal getMatchScore() { return matchScore; }
    public void setMatchScore(BigDecimal matchScore) { this.matchScore = matchScore; }

    public MatchBreakdown getMatchBreakdown() { return matchBreakdown; }
    public void setMatchBreakdown(MatchBreakdown matchBreakdown) { this.matchBreakdown = matchBreakdown; }

    public Boolean getHasApplied() { return hasApplied; }
    public void setHasApplied(Boolean hasApplied) { this.hasApplied = hasApplied; }
}
