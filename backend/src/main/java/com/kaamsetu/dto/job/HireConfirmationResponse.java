package com.kaamsetu.dto.job;

import com.kaamsetu.domain.enums.HireStatus;
import com.kaamsetu.domain.enums.JobCloseReason;
import com.kaamsetu.domain.enums.JobStatus;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.ShiftType;
import com.kaamsetu.domain.enums.TradeType;

import java.time.OffsetDateTime;
import java.util.UUID;

public class HireConfirmationResponse {

    private UUID hireConfirmationId;
    private UUID jobId;
    private UUID workerId;
    private TradeType trade;
    private ProfessionType profession;
    private Integer salary;
    private ShiftType shift;
    private String employerBusinessName;
    private boolean employerConfirmed;
    private Boolean workerConfirmed;
    private HireStatus status;
    private JobStatus jobStatus;
    private JobCloseReason closeReason;
    private OffsetDateTime confirmedAt;
    private OffsetDateTime createdAt;

    // Worker Details for Employer View
    private String workerFullName;
    private String workerPhoneNumber;
    private String workerPhotoUrl;
    private TradeType workerTrade;
    private java.math.BigDecimal workerExperienceYears;
    private String workerAddressArea;
    private String workerAddressCity;

    public HireConfirmationResponse() {}

    public UUID getHireConfirmationId() { return hireConfirmationId; }
    public void setHireConfirmationId(UUID hireConfirmationId) { this.hireConfirmationId = hireConfirmationId; }

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }

    public UUID getWorkerId() { return workerId; }
    public void setWorkerId(UUID workerId) { this.workerId = workerId; }

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public Integer getSalary() { return salary; }
    public void setSalary(Integer salary) { this.salary = salary; }

    @com.fasterxml.jackson.annotation.JsonProperty("agreedSalary")
    public Integer getAgreedSalary() { return salary; }
    public void setAgreedSalary(Integer agreedSalary) { this.salary = agreedSalary; }

    public ShiftType getShift() { return shift; }
    public void setShift(ShiftType shift) { this.shift = shift; }

    public String getEmployerBusinessName() { return employerBusinessName; }
    public void setEmployerBusinessName(String employerBusinessName) { this.employerBusinessName = employerBusinessName; }

    public boolean isEmployerConfirmed() { return employerConfirmed; }
    public void setEmployerConfirmed(boolean employerConfirmed) { this.employerConfirmed = employerConfirmed; }

    public Boolean getWorkerConfirmed() { return workerConfirmed; }
    public void setWorkerConfirmed(Boolean workerConfirmed) { this.workerConfirmed = workerConfirmed; }

    public HireStatus getStatus() { return status; }
    public void setStatus(HireStatus status) { this.status = status; }

    public JobStatus getJobStatus() { return jobStatus; }
    public void setJobStatus(JobStatus jobStatus) { this.jobStatus = jobStatus; }

    public JobCloseReason getCloseReason() { return closeReason; }
    public void setCloseReason(JobCloseReason closeReason) { this.closeReason = closeReason; }

    public OffsetDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(OffsetDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public String getWorkerFullName() { return workerFullName; }
    public void setWorkerFullName(String workerFullName) { this.workerFullName = workerFullName; }

    public String getWorkerPhoneNumber() { return workerPhoneNumber; }
    public void setWorkerPhoneNumber(String workerPhoneNumber) { this.workerPhoneNumber = workerPhoneNumber; }

    public String getWorkerPhotoUrl() { return workerPhotoUrl; }
    public void setWorkerPhotoUrl(String workerPhotoUrl) { this.workerPhotoUrl = workerPhotoUrl; }

    public TradeType getWorkerTrade() { return workerTrade; }
    public void setWorkerTrade(TradeType workerTrade) { this.workerTrade = workerTrade; }

    public java.math.BigDecimal getWorkerExperienceYears() { return workerExperienceYears; }
    public void setWorkerExperienceYears(java.math.BigDecimal workerExperienceYears) { this.workerExperienceYears = workerExperienceYears; }

    public String getWorkerAddressArea() { return workerAddressArea; }
    public void setWorkerAddressArea(String workerAddressArea) { this.workerAddressArea = workerAddressArea; }

    public String getWorkerAddressCity() { return workerAddressCity; }
    public void setWorkerAddressCity(String workerAddressCity) { this.workerAddressCity = workerAddressCity; }
}
