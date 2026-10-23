package com.kaamsetu.dto.auth;

public class LogoutRequest {

    private String fcmToken;

    public LogoutRequest() {}

    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }
}
