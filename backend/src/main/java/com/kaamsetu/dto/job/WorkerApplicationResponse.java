package com.kaamsetu.dto.job;

import com.kaamsetu.domain.enums.ApplicationStatus;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.ShiftType;
import com.kaamsetu.domain.enums.TradeType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class WorkerApplicationResponse {

    private UUID id;
    private UUID jobId;
    private TradeType trade;
    private ProfessionType profession;
    private Integer salary;
    private ShiftType shift;
    private String timing;
    private String employerBusinessName;
    private BigDecimal matchScore;
    private ApplicationStatus status;
    private OffsetDateTime createdAt;

    public WorkerApplicationResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public Integer getSalary() { return salary; }
    public void setSalary(Integer salary) { this.salary = salary; }

    public ShiftType getShift() { return shift; }
    public void setShift(ShiftType shift) { this.shift = shift; }

    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }

    public String getEmployerBusinessName() { return employerBusinessName; }
    public void setEmployerBusinessName(String employerBusinessName) { this.employerBusinessName = employerBusinessName; }

    public BigDecimal getMatchScore() { return matchScore; }
    public void setMatchScore(BigDecimal matchScore) { this.matchScore = matchScore; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
