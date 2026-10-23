package com.kaamsetu.dto.profile;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kaamsetu.domain.enums.TradeType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;

public class EmployerProfileUpdateRequest {

    @JsonProperty("businessName")
    @JsonAlias({"business_name", "businessName"})
    private String businessName;

    @JsonProperty("ownerName")
    @JsonAlias({"owner_name", "ownerName"})
    private String ownerName;

    @JsonProperty("businessTrade")
    @JsonAlias({"business_trade", "businessTrade"})
    private TradeType businessTrade;

    @JsonProperty("yearsInBusiness")
    @JsonAlias({"years_in_business", "yearsInBusiness"})
    @Min(value = 0, message = "Years in business cannot be negative")
    @Max(value = 150, message = "Years in business cannot exceed 150")
    private Integer yearsInBusiness;

    @JsonProperty("typicalRolesHired")
    @JsonAlias({"typical_roles_hired", "typicalRolesHired"})
    private List<String> typicalRolesHired;

    @JsonProperty("addressLine")
    @JsonAlias({"address_line", "addressLine"})
    private String addressLine;

    private String area;
    private String city;
    private String pincode;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("photoUrl")
    @JsonAlias({"photo_url", "photoUrl"})
    private String photoUrl;

    public EmployerProfileUpdateRequest() {}

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

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
