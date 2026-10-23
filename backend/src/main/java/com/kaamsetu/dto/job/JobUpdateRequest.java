package com.kaamsetu.dto.job;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kaamsetu.domain.enums.ShiftType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public class JobUpdateRequest {

    @DecimalMin(value = "0.0", message = "Experience required must be non-negative")
    @DecimalMax(value = "50.0", message = "Experience required cannot exceed 50.0 years")
    @JsonProperty("experienceRequiredYears")
    @JsonAlias({"experience_required_years", "required_experience_years", "experienceRequiredYears", "experience", "experienceYears", "experience_years"})
    private BigDecimal experienceRequiredYears;

    @Min(value = 1000, message = "Monthly salary must be at least ₹1,000")
    @Max(value = 1000000, message = "Monthly salary cannot exceed ₹10,00,000")
    @JsonProperty("salary")
    private Integer salary;

    @JsonProperty("shift")
    private ShiftType shift;

    @JsonProperty("timing")
    private String timing;

    @DecimalMin(value = "1.0", message = "Radius must be at least 1.0 KM")
    @DecimalMax(value = "500.0", message = "Radius cannot exceed 500.0 KM")
    @JsonProperty("radiusKm")
    @JsonAlias({"radius_km", "radiusKm", "radius"})
    private BigDecimal radiusKm;

    public JobUpdateRequest() {}

    public JobUpdateRequest(BigDecimal experienceRequiredYears, Integer salary, ShiftType shift, String timing, BigDecimal radiusKm) {
        this.experienceRequiredYears = experienceRequiredYears;
        this.salary = salary;
        this.shift = shift;
        this.timing = timing;
        this.radiusKm = radiusKm;
    }

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
