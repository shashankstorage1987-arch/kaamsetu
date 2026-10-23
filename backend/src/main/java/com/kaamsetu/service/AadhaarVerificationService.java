package com.kaamsetu.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AadhaarVerificationService {

    public static class AadhaarVerificationResult {
        private final boolean verified;
        private final String referenceId;

        public AadhaarVerificationResult(boolean verified, String referenceId) {
            this.verified = verified;
            this.referenceId = referenceId;
        }

        public boolean isVerified() { return verified; }
        public String getReferenceId() { return referenceId; }
    }

    /**
     * Performs mock Aadhaar verification in compliance with BR-Aadhaar.
     * The raw Aadhaar number is passed ONLY in memory for verification and is NEVER logged, stored, or retained.
     */
    public AadhaarVerificationResult verifyAadhaar(String rawAadhaarNumber) {
        // Validation check in memory (12 numeric digits)
        if (rawAadhaarNumber == null || !rawAadhaarNumber.matches("^[0-9]{12}$")) {
            return new AadhaarVerificationResult(false, null);
        }

        // Mock verification response with external reference ID token
        String generatedRefId = "MOCK-AADHAAR-REF-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();
        
        // Raw Aadhaar variable goes out of scope here and is immediately discarded.
        return new AadhaarVerificationResult(true, generatedRefId);
    }
}
