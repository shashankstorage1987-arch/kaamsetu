package com.kaamsetu.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "worker_profiles")
public class WorkerProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "total_experience_years", nullable = false, precision = 4, scale = 1)
    private BigDecimal totalExperienceYears = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "languages", nullable = false, columnDefinition = "text[]")
    private List<String> languages = new ArrayList<>();

    @Column(name = "preferred_salary")
    private Integer preferredSalary;

    @Column(name = "preferred_distance_km", nullable = false, precision = 4, scale = 1)
    private BigDecimal preferredDistanceKm = new BigDecimal("5.0");

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = false;

    @Column(name = "available_until")
    private OffsetDateTime availableUntil;

    @Column(name = "address_line", length = 255)
    private String addressLine;

    @Column(name = "area", length = 100)
    private String area;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "location", columnDefinition = "geography(Point, 4326)")
    private Point location;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @OneToMany(mappedBy = "workerProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<WorkerExperience> experiences = new ArrayList<>();

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

    public WorkerProfile() {}

    public WorkerProfile(User user, String fullName) {
        this.user = user;
        this.fullName = fullName;
    }

    public void addExperience(WorkerExperience exp) {
        experiences.add(exp);
        exp.setWorkerProfile(this);
    }

    public void removeExperience(WorkerExperience exp) {
        experiences.remove(exp);
        exp.setWorkerProfile(null);
    }

    // Getters and Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public OffsetDateTime getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(OffsetDateTime availableUntil) { this.availableUntil = availableUntil; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public List<WorkerExperience> getExperiences() { return experiences; }
    public void setExperiences(List<WorkerExperience> experiences) { this.experiences = experiences; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
