package com.kaamsetu.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class EmployerSignUpRequest {

    @NotBlank(message = "Business name is required")
    @JsonProperty("businessName")
    @JsonAlias({"business_name", "businessName"})
    private String businessName;

    @NotBlank(message = "Owner name is required")
    @JsonProperty("ownerName")
    @JsonAlias({"owner_name", "ownerName"})
    private String ownerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    @JsonProperty("phoneNumber")
    @JsonAlias({"phone_number", "phoneNumber"})
    private String phoneNumber;

    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "PIN must be exactly 6 digits")
    @JsonProperty("pin")
    private String pin;

    public EmployerSignUpRequest() {}

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
}
