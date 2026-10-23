package com.kaamsetu.dto.job;

import com.kaamsetu.domain.enums.ApplicationStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class JobInterestResponse {

    private UUID id;
    private UUID jobId;
    private UUID workerId;
    private BigDecimal matchScore;
    private ApplicationStatus status;
    private OffsetDateTime createdAt;

    public JobInterestResponse() {}

    public JobInterestResponse(UUID id, UUID jobId, UUID workerId, BigDecimal matchScore, ApplicationStatus status, OffsetDateTime createdAt) {
        this.id = id;
        this.jobId = jobId;
        this.workerId = workerId;
        this.matchScore = matchScore;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }

    public UUID getWorkerId() { return workerId; }
    public void setWorkerId(UUID workerId) { this.workerId = workerId; }

    public BigDecimal getMatchScore() { return matchScore; }
    public void setMatchScore(BigDecimal matchScore) { this.matchScore = matchScore; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
