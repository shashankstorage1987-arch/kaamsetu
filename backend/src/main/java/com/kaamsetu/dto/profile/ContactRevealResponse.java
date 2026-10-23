package com.kaamsetu.dto.profile;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ContactRevealResponse {

    private UUID workerId;
    private String fullName;
    private String phoneNumber;
    private OffsetDateTime revealedAt;

    public ContactRevealResponse() {}

    public ContactRevealResponse(UUID workerId, String fullName, String phoneNumber, OffsetDateTime revealedAt) {
        this.workerId = workerId;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.revealedAt = revealedAt;
    }

    public UUID getWorkerId() { return workerId; }
    public void setWorkerId(UUID workerId) { this.workerId = workerId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public OffsetDateTime getRevealedAt() { return revealedAt; }
    public void setRevealedAt(OffsetDateTime revealedAt) { this.revealedAt = revealedAt; }
}
