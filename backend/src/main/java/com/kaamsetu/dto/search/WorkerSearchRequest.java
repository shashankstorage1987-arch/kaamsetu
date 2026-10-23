package com.kaamsetu.dto.search;

import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;

import java.math.BigDecimal;

public class WorkerSearchRequest {

    private TradeType trade;
    private ProfessionType profession;
    private Boolean availableNow;
    private Boolean verified;
    private Boolean similarShop;
    private Integer salaryMax;
    private BigDecimal experienceMin;
    private BigDecimal radiusKm = new BigDecimal("1.0");

    public WorkerSearchRequest() {}

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public Boolean getAvailableNow() { return availableNow; }
    public void setAvailableNow(Boolean availableNow) { this.availableNow = availableNow; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public Boolean getSimilarShop() { return similarShop; }
    public void setSimilarShop(Boolean similarShop) { this.similarShop = similarShop; }

    public Integer getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }

    public BigDecimal getExperienceMin() { return experienceMin; }
    public void setExperienceMin(BigDecimal experienceMin) { this.experienceMin = experienceMin; }

    public BigDecimal getRadiusKm() { return radiusKm; }
    public void setRadiusKm(BigDecimal radiusKm) { this.radiusKm = radiusKm; }
}
