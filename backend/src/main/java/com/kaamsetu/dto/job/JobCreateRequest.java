package com.kaamsetu.dto.job;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.ShiftType;
import com.kaamsetu.domain.enums.TradeType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class JobCreateRequest {

    @NotNull(message = "Trade is mandatory")
    @JsonProperty("trade")
    private TradeType trade;

    @NotNull(message = "Profession is mandatory")
    @JsonProperty("profession")
    private ProfessionType profession;

    @DecimalMin(value = "0.0", message = "Experience required must be non-negative")
    @DecimalMax(value = "50.0", message = "Experience required cannot exceed 50.0 years")
    @JsonProperty("experienceRequiredYears")
    @JsonAlias({"experience_required_years", "required_experience_years", "experienceRequiredYears", "experience", "experienceYears", "experience_years"})
    private BigDecimal experienceRequiredYears = BigDecimal.ZERO;

    @NotNull(message = "Salary is mandatory")
    @Min(value = 1000, message = "Monthly salary must be at least ₹1,000")
    @Max(value = 1000000, message = "Monthly salary cannot exceed ₹10,00,000")
    @JsonProperty("salary")
    private Integer salary;

    @JsonProperty("shift")
    private ShiftType shift = ShiftType.DAY;

    @JsonProperty("timing")
    private String timing;

    @DecimalMin(value = "1.0", message = "Radius must be at least 1.0 KM")
    @DecimalMax(value = "500.0", message = "Radius cannot exceed 500.0 KM")
    @JsonProperty("radiusKm")
    @JsonAlias({"radius_km", "radiusKm", "radius"})
    private BigDecimal radiusKm = new BigDecimal("1.0");

    public JobCreateRequest() {}

    public JobCreateRequest(TradeType trade, ProfessionType profession, BigDecimal experienceRequiredYears, Integer salary, ShiftType shift, String timing, BigDecimal radiusKm) {
        this.trade = trade;
        this.profession = profession;
        this.experienceRequiredYears = experienceRequiredYears != null ? experienceRequiredYears : BigDecimal.ZERO;
        this.salary = salary;
        this.shift = shift != null ? shift : ShiftType.DAY;
        this.timing = timing;
        this.radiusKm = radiusKm != null ? radiusKm : new BigDecimal("1.0");
    }

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public BigDecimal getExperienceRequiredYears() { return experienceRequiredYears; }
    public void setExperienceRequiredYears(BigDecimal experienceRequiredYears) { this.experienceRequiredYears = experienceRequiredYears; }

    public Integer getSalary() { return salary; }
    public void setSalary(Integer salary) { this.salary = salary; }

    public ShiftType getShift() { return shift; }
    public void setShift(ShiftType shift) { this.shift = shift; }

    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }

    public BigDecimal getRadiusKm() { return radiusKm; }
    public void setRadiusKm(BigDecimal radiusKm) { this.radiusKm = radiusKm; }
}
