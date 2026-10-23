package com.kaamsetu.dto.job;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kaamsetu.domain.enums.JobCloseReason;
import com.kaamsetu.domain.enums.JobStatus;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.ShiftType;
import com.kaamsetu.domain.enums.TradeType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class JobResponse {

    @JsonProperty("jobId")
    @JsonAlias({"job_id", "jobId", "id"})
    private UUID jobId;

    @JsonProperty("employerId")
    @JsonAlias({"employer_id", "employerId"})
    private UUID employerId;

    @JsonProperty("employerBusinessName")
    @JsonAlias({"employer_business_name", "employerBusinessName"})
    private String employerBusinessName;

    @JsonProperty("trade")
    private TradeType trade;

    @JsonProperty("profession")
    private ProfessionType profession;

    @JsonProperty("experienceRequiredYears")
    @JsonAlias({"experience_required_years", "required_experience_years", "experienceRequiredYears", "experience", "experienceYears"})
    private BigDecimal experienceRequiredYears;

    @JsonProperty("salary")
    private Integer salary;

    @JsonProperty("shift")
    private ShiftType shift;

    @JsonProperty("timing")
    private String timing;

    @JsonProperty("radiusKm")
    @JsonAlias({"radius_km", "radiusKm", "radius"})
    private BigDecimal radiusKm;

    @JsonProperty("status")
    private JobStatus status;

    @JsonProperty("closeReason")
    @JsonAlias({"close_reason", "closeReason"})
    private JobCloseReason closeReason;

    @JsonProperty("distanceKm")
    @JsonAlias({"distance_km", "distanceKm"})
    private Double distanceKm;

    @JsonProperty("addressLine")
    @JsonAlias({"address_line", "addressLine"})
    private String addressLine;

    @JsonProperty("area")
    private String area;

    @JsonProperty("city")
    private String city;

    @JsonProperty("pincode")
    private String pincode;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("hasApplied")
    @JsonAlias({"has_applied", "hasApplied"})
    private Boolean hasApplied;

    @JsonProperty("applicantsCount")
    @JsonAlias({"applicants_count", "applicantsCount"})
    private Integer applicantsCount;

    @JsonProperty("selectedCount")
    @JsonAlias({"selected_count", "selectedCount"})
    private Integer selectedCount;

    @JsonProperty("rejectedCount")
    @JsonAlias({"rejected_count", "rejectedCount"})
    private Integer rejectedCount;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at", "createdAt"})
    private OffsetDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at", "updatedAt"})
    private OffsetDateTime updatedAt;

    // Hired worker details for closed jobs
    @JsonProperty("hiredWorkerId")
    @JsonAlias({"hired_worker_id", "hiredWorkerId"})
    private UUID hiredWorkerId;

    @JsonProperty("hiredWorkerName")
    @JsonAlias({"hired_worker_name", "hiredWorkerName"})
    private String hiredWorkerName;

    @JsonProperty("hiredWorkerPhone")
    @JsonAlias({"hired_worker_phone", "hiredWorkerPhone"})
    private String hiredWorkerPhone;

    @JsonProperty("hiredWorkerPhotoUrl")
    @JsonAlias({"hired_worker_photo_url", "hiredWorkerPhotoUrl"})
    private String hiredWorkerPhotoUrl;

    @JsonProperty("hireStatus")
    @JsonAlias({"hire_status", "hireStatus"})
    private String hireStatus;

    public JobResponse() {}

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }

    public UUID getEmployerId() { return employerId; }
    public void setEmployerId(UUID employerId) { this.employerId = employerId; }

    public String getEmployerBusinessName() { return employerBusinessName; }
    public void setEmployerBusinessName(String employerBusinessName) { this.employerBusinessName = employerBusinessName; }

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

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public JobCloseReason getCloseReason() { return closeReason; }
    public void setCloseReason(JobCloseReason closeReason) { this.closeReason = closeReason; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

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

    public Boolean getHasApplied() { return hasApplied; }
    public void setHasApplied(Boolean hasApplied) { this.hasApplied = hasApplied; }

    public Integer getApplicantsCount() { return applicantsCount; }
    public void setApplicantsCount(Integer applicantsCount) { this.applicantsCount = applicantsCount; }

    public Integer getSelectedCount() { return selectedCount; }
    public void setSelectedCount(Integer selectedCount) { this.selectedCount = selectedCount; }

    public Integer getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(Integer rejectedCount) { this.rejectedCount = rejectedCount; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getHiredWorkerId() { return hiredWorkerId; }
    public void setHiredWorkerId(UUID hiredWorkerId) { this.hiredWorkerId = hiredWorkerId; }

    public String getHiredWorkerName() { return hiredWorkerName; }
    public void setHiredWorkerName(String hiredWorkerName) { this.hiredWorkerName = hiredWorkerName; }

    public String getHiredWorkerPhone() { return hiredWorkerPhone; }
    public void setHiredWorkerPhone(String hiredWorkerPhone) { this.hiredWorkerPhone = hiredWorkerPhone; }

    public String getHiredWorkerPhotoUrl() { return hiredWorkerPhotoUrl; }
    public void setHiredWorkerPhotoUrl(String hiredWorkerPhotoUrl) { this.hiredWorkerPhotoUrl = hiredWorkerPhotoUrl; }

    public String getHireStatus() { return hireStatus; }
    public void setHireStatus(String hireStatus) { this.hireStatus = hireStatus; }
}
