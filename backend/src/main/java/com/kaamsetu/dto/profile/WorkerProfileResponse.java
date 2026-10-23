package com.kaamsetu.dto.profile;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class WorkerProfileResponse {

    @JsonProperty("userId")
    @JsonAlias({"user_id", "userId"})
    private UUID userId;

    @JsonProperty("fullName")
    @JsonAlias({"full_name", "fullName"})
    private String fullName;

    @JsonProperty("totalExperienceYears")
    @JsonAlias({"total_experience_years", "totalExperienceYears"})
    private BigDecimal totalExperienceYears;

    @JsonProperty("languages")
    private List<String> languages;

    @JsonProperty("preferredSalary")
    @JsonAlias({"preferred_salary", "preferredSalary"})
    private Integer preferredSalary;

    @JsonProperty("preferredDistanceKm")
    @JsonAlias({"preferred_distance_km", "preferredDistanceKm"})
    private BigDecimal preferredDistanceKm;

    @JsonProperty("isAvailable")
    @JsonAlias({"is_available", "isAvailable"})
    private Boolean isAvailable;

    @JsonProperty("availableUntil")
    @JsonAlias({"available_until", "availableUntil"})
    private OffsetDateTime availableUntil;

    @JsonProperty("address")
    private AddressDto address;

    @JsonProperty("experiences")
    private List<WorkerExperienceDto> experiences;

    @JsonProperty("shopCategories")
    @JsonAlias({"shop_categories", "shopCategories"})
    private List<String> shopCategories;

    @JsonProperty("recentlyCompletedHiresCount")
    @JsonAlias({"recently_completed_hires_count", "recentlyCompletedHiresCount"})
    private Long recentlyCompletedHiresCount;

    @JsonProperty("phoneNumber")
    @JsonAlias({"phone_number", "phoneNumber"})
    private String phoneNumber;

    @JsonProperty("aadhaarVerified")
    @JsonAlias({"aadhaar_verified", "aadhaarVerified"})
    private Boolean aadhaarVerified;

    @JsonProperty("photoUrl")
    @JsonAlias({"photo_url", "photoUrl"})
    private String photoUrl;

    public WorkerProfileResponse() {}

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

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

    public OffsetDateTime getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(OffsetDateTime availableUntil) { this.availableUntil = availableUntil; }

    public AddressDto getAddress() { return address; }
    public void setAddress(AddressDto address) { this.address = address; }

    public List<WorkerExperienceDto> getExperiences() { return experiences; }
    public void setExperiences(List<WorkerExperienceDto> experiences) { this.experiences = experiences; }

    public List<String> getShopCategories() { return shopCategories; }
    public void setShopCategories(List<String> shopCategories) { this.shopCategories = shopCategories; }

    public Long getRecentlyCompletedHiresCount() { return recentlyCompletedHiresCount; }
    public void setRecentlyCompletedHiresCount(Long recentlyCompletedHiresCount) { this.recentlyCompletedHiresCount = recentlyCompletedHiresCount; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Boolean getAadhaarVerified() { return aadhaarVerified; }
    public void setAadhaarVerified(Boolean aadhaarVerified) { this.aadhaarVerified = aadhaarVerified; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
