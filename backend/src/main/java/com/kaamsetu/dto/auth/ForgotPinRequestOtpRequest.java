package com.kaamsetu.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ForgotPinRequestOtpRequest {

    @NotBlank(message = "Please enter your 10-digit registered mobile number")
    @Pattern(regexp = "^[0-9]{10}$", message = "Please enter a valid 10-digit mobile number")
    @JsonProperty("phoneNumber")
    @JsonAlias({"phone_number", "phoneNumber"})
    private String phoneNumber;

    public ForgotPinRequestOtpRequest() {}

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
