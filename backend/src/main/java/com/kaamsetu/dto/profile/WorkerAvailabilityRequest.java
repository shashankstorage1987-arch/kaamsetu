package com.kaamsetu.dto.profile;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class WorkerAvailabilityRequest {

    @JsonProperty("isAvailable")
    @JsonAlias({"is_available", "isAvailable"})
    private Boolean isAvailable;

    public WorkerAvailabilityRequest() {}

    public WorkerAvailabilityRequest(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
