package com.kaamsetu.dto.profile;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;

public class WorkerAvailabilityResponse {

    @JsonProperty("isAvailable")
    @JsonAlias({"is_available", "isAvailable"})
    private Boolean isAvailable;

    @JsonProperty("availableUntil")
    @JsonAlias({"available_until", "availableUntil"})
    private OffsetDateTime availableUntil;

    @JsonProperty("remainingSeconds")
    @JsonAlias({"remaining_seconds", "remainingSeconds"})
    private Long remainingSeconds;

    @JsonProperty("effectiveAvailable")
    @JsonAlias({"effective_available", "effectiveAvailable"})
    private Boolean effectiveAvailable;

    public WorkerAvailabilityResponse() {}

    public WorkerAvailabilityResponse(Boolean isAvailable, OffsetDateTime availableUntil, Long remainingSeconds, Boolean effectiveAvailable) {
        this.isAvailable = isAvailable;
        this.availableUntil = availableUntil;
        this.remainingSeconds = remainingSeconds;
        this.effectiveAvailable = effectiveAvailable;
    }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public OffsetDateTime getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(OffsetDateTime availableUntil) { this.availableUntil = availableUntil; }

    public Long getRemainingSeconds() { return remainingSeconds; }
    public void setRemainingSeconds(Long remainingSeconds) { this.remainingSeconds = remainingSeconds; }

    public Boolean getEffectiveAvailable() { return effectiveAvailable; }
    public void setEffectiveAvailable(Boolean effectiveAvailable) { this.effectiveAvailable = effectiveAvailable; }
}
