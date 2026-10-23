package com.kaamsetu.domain.entity;

import com.kaamsetu.domain.enums.JobCloseReason;
import com.kaamsetu.domain.enums.JobStatus;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.ShiftType;
import com.kaamsetu.domain.enums.TradeType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employer_id", nullable = false)
    private EmployerProfile employerProfile;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "trade", nullable = false)
    private TradeType trade;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "profession", nullable = false)
    private ProfessionType profession;

    @Column(name = "experience_required_years", nullable = false, precision = 4, scale = 1)
    private BigDecimal experienceRequiredYears = BigDecimal.ZERO;

    @Column(name = "salary", nullable = false)
    private Integer salary;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "shift", nullable = false)
    private ShiftType shift = ShiftType.DAY;

    @Column(name = "timing", length = 100)
    private String timing;

    @Column(name = "radius_km", nullable = false, precision = 4, scale = 1)
    private BigDecimal radiusKm = new BigDecimal("1.0");

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    private JobStatus status = JobStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "close_reason")
    private JobCloseReason closeReason;

    @Column(name = "location", columnDefinition = "geography(Point, 4326)")
    private Point location;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public Job() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public EmployerProfile getEmployerProfile() { return employerProfile; }
    public void setEmployerProfile(EmployerProfile employerProfile) { this.employerProfile = employerProfile; }

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

    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
