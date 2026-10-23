package com.kaamsetu.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class LoginRequest {

    @NotBlank(message = "Phone number is required")
    @JsonProperty("phoneNumber")
    @JsonAlias({"phone_number", "phoneNumber"})
    private String phoneNumber;

    @NotBlank(message = "PIN is required")
    @JsonProperty("pin")
    @Pattern(regexp = "^[0-9]{6}$", message = "PIN must be 6 digits")
    private String pin;

    public LoginRequest() {}

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
}
