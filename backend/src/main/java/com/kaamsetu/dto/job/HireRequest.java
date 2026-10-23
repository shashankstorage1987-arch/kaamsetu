package com.kaamsetu.dto.job;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class HireRequest {

    @NotNull(message = "Worker ID is mandatory")
    private UUID workerId;

    public HireRequest() {}

    public HireRequest(UUID workerId) {
        this.workerId = workerId;
    }

    public UUID getWorkerId() { return workerId; }
    public void setWorkerId(UUID workerId) { this.workerId = workerId; }
}
