package com.kaamsetu.dto.profile;

import com.kaamsetu.domain.enums.TradeType;
import java.util.List;
import java.util.UUID;

public class EmployerProfileResponse {

    private UUID userId;
    private String businessName;
    private String ownerName;
    private TradeType businessTrade;
    private Integer yearsInBusiness;
    private List<String> typicalRolesHired;
    private String photoUrl;
    private AddressDto address;

    public EmployerProfileResponse() {}

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public TradeType getBusinessTrade() { return businessTrade; }
    public void setBusinessTrade(TradeType businessTrade) { this.businessTrade = businessTrade; }

    public Integer getYearsInBusiness() { return yearsInBusiness; }
    public void setYearsInBusiness(Integer yearsInBusiness) { this.yearsInBusiness = yearsInBusiness; }

    public List<String> getTypicalRolesHired() { return typicalRolesHired; }
    public void setTypicalRolesHired(List<String> typicalRolesHired) { this.typicalRolesHired = typicalRolesHired; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public AddressDto getAddress() { return address; }
    public void setAddress(AddressDto address) { this.address = address; }
}
