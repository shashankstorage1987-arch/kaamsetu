package com.kaamsetu.dto.job;

import jakarta.validation.constraints.NotNull;

public class HireResponseRequest {

    @NotNull(message = "Accepted status is mandatory")
    private Boolean accepted;

    public HireResponseRequest() {}

    public HireResponseRequest(Boolean accepted) {
        this.accepted = accepted;
    }

    public Boolean getAccepted() { return accepted; }
    public void setAccepted(Boolean accepted) { this.accepted = accepted; }
}
