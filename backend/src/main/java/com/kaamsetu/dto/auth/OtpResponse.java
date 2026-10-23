package com.kaamsetu.dto.auth;

import java.util.UUID;

public class OtpResponse {

    private String message;
    private UUID referenceId;

    public OtpResponse() {}

    public OtpResponse(String message, UUID referenceId) {
        this.message = message;
        this.referenceId = referenceId;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UUID getReferenceId() { return referenceId; }
    public void setReferenceId(UUID referenceId) { this.referenceId = referenceId; }
}
