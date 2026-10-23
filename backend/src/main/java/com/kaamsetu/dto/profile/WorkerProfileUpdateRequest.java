package com.kaamsetu.dto.profile;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;

public class WorkerProfileUpdateRequest {

    @JsonProperty("fullName")
    @JsonAlias({"full_name", "fullName"})
    private String fullName;

    @JsonProperty("totalExperienceYears")
    @JsonAlias({"total_experience_years", "totalExperienceYears"})
    @DecimalMin(value = "0.0", message = "Total experience cannot be negative")
    @DecimalMax(value = "50.0", message = "Total experience cannot exceed 50.0 years")
    private BigDecimal totalExperienceYears;

    @JsonProperty("languages")
    private List<String> languages;

    @JsonProperty("preferredSalary")
    @JsonAlias({"preferred_salary", "preferredSalary"})
    @Min(value = 1000, message = "Preferred monthly salary must be at least ₹1,000")
    @Max(value = 500000, message = "Preferred monthly salary cannot exceed ₹5,00,000")
    private Integer preferredSalary;

    @JsonProperty("preferredDistanceKm")
    @JsonAlias({"preferred_distance_km", "preferredDistanceKm"})
    @DecimalMin(value = "0.5", message = "Preferred distance must be at least 0.5 KM")
    @DecimalMax(value = "100.0", message = "Preferred distance cannot exceed 100.0 KM")
    private BigDecimal preferredDistanceKm;

    @JsonProperty("isAvailable")
    @JsonAlias({"is_available", "isAvailable"})
    private Boolean isAvailable;

    @JsonProperty("addressLine")
    @JsonAlias({"address_line", "addressLine"})
    private String addressLine;

    private String area;
    private String city;
    private String pincode;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("photoUrl")
    @JsonAlias({"photo_url", "photoUrl"})
    private String photoUrl;

    private List<WorkerExperienceDto> experiences;

    public WorkerProfileUpdateRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public BigDecimal getTotalExperienceYears() { return totalExperienceYears; }
    public void setTotalExperienceYears(BigDecimal totalExperienceYears) { this.totalExperienceYears = totalExperienceYears; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public Integer getPreferredSalary() { return preferredSalary; }
    public void setPreferredSalary(Integer preferredSalary) { this.preferredSalary = preferredSalary; }

    public BigDecimal getPreferredDistanceKm() { return preferredDistanceKm; }
    public void setPreferredDistanceKm(BigDecimal preferredDistanceKm) { this.preferredDistanceKm = preferredDistanceKm; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public List<WorkerExperienceDto> getExperiences() { return experiences; }
    public void setExperiences(List<WorkerExperienceDto> experiences) { this.experiences = experiences; }
}
