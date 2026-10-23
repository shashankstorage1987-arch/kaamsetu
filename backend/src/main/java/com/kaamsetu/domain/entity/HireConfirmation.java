package com.kaamsetu.domain.entity;

import com.kaamsetu.domain.enums.HireStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "hire_confirmations", uniqueConstraints = {
    @UniqueConstraint(name = "uq_hire_confirmation", columnNames = {"job_id", "worker_id"})
})
public class HireConfirmation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile workerProfile;

    @Column(name = "employer_confirmed", nullable = false)
    private boolean employerConfirmed = true;

    @Column(name = "worker_confirmed")
    private Boolean workerConfirmed;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    private HireStatus status = HireStatus.PENDING;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    public HireConfirmation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public WorkerProfile getWorkerProfile() { return workerProfile; }
    public void setWorkerProfile(WorkerProfile workerProfile) { this.workerProfile = workerProfile; }

    public boolean isEmployerConfirmed() { return employerConfirmed; }
    public void setEmployerConfirmed(boolean employerConfirmed) { this.employerConfirmed = employerConfirmed; }

    public Boolean getWorkerConfirmed() { return workerConfirmed; }
    public void setWorkerConfirmed(Boolean workerConfirmed) { this.workerConfirmed = workerConfirmed; }

    public HireStatus getStatus() { return status; }
    public void setStatus(HireStatus status) { this.status = status; }

    public OffsetDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(OffsetDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
