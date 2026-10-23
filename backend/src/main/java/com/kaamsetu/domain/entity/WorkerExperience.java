package com.kaamsetu.domain.entity;

import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "worker_experience")
public class WorkerExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile workerProfile;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "trade", nullable = false)
    private TradeType trade;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "profession", nullable = false)
    private ProfessionType profession;

    @Column(name = "previous_employer_name", length = 150)
    private String previousEmployerName;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "core_skills", nullable = false, columnDefinition = "text[]")
    private List<String> coreSkills = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    public WorkerExperience() {}

    public WorkerExperience(TradeType trade, ProfessionType profession, String previousEmployerName, Integer durationMonths) {
        this.trade = trade;
        this.profession = profession;
        this.previousEmployerName = (previousEmployerName != null && !previousEmployerName.isBlank()) ? previousEmployerName.trim() : "Fresher";
        this.durationMonths = durationMonths != null ? Math.max(0, durationMonths) : 0;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public WorkerProfile getWorkerProfile() { return workerProfile; }
    public void setWorkerProfile(WorkerProfile workerProfile) { this.workerProfile = workerProfile; }

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public String getPreviousEmployerName() { return previousEmployerName; }
    public void setPreviousEmployerName(String previousEmployerName) {
        this.previousEmployerName = (previousEmployerName != null && !previousEmployerName.isBlank()) ? previousEmployerName.trim() : "Fresher";
    }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) {
        this.durationMonths = durationMonths != null ? Math.max(0, durationMonths) : 0;
    }

    public List<String> getCoreSkills() { return coreSkills; }
    public void setCoreSkills(List<String> coreSkills) { this.coreSkills = coreSkills; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
