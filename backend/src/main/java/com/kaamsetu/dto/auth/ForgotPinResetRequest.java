package com.kaamsetu.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ForgotPinResetRequest {

    @NotBlank(message = "Please enter your 10-digit registered mobile number")
    @Pattern(regexp = "^[0-9]{10}$", message = "Please enter a valid 10-digit mobile number")
    @JsonProperty("phoneNumber")
    @JsonAlias({"phone_number", "phoneNumber"})
    private String phoneNumber;

    @NotBlank(message = "Please enter the 6-digit verification OTP")
    @Pattern(regexp = "^[0-9]{6}$", message = "Verification OTP must be 6 digits")
    private String otp;

    @NotBlank(message = "Please enter a new 6-digit PIN")
    @Pattern(regexp = "^[0-9]{6}$", message = "New PIN must be 6 digits")
    @JsonProperty("newPin")
    @JsonAlias({"new_pin", "newPin"})
    private String newPin;

    public ForgotPinResetRequest() {}

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getNewPin() { return newPin; }
    public void setNewPin(String newPin) { this.newPin = newPin; }
}
