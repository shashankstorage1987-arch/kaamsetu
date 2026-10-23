package com.kaamsetu.dto.job;

import com.kaamsetu.domain.enums.JobCloseReason;
import jakarta.validation.constraints.NotNull;

public class JobCloseRequest {

    @NotNull(message = "Close reason is mandatory")
    private JobCloseReason closeReason;

    public JobCloseRequest() {}

    public JobCloseRequest(JobCloseReason closeReason) {
        this.closeReason = closeReason;
    }

    public JobCloseReason getCloseReason() { return closeReason; }
    public void setCloseReason(JobCloseReason closeReason) { this.closeReason = closeReason; }
}
