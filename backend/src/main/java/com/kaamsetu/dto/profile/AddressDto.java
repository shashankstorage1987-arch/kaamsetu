package com.kaamsetu.dto.profile;

public class AddressDto {

    private String addressLine;
    private String area;
    private String city;
    private String pincode;
    private Double latitude;
    private Double longitude;

    public AddressDto() {}

    public AddressDto(String addressLine, String area, String city, String pincode, Double latitude, Double longitude) {
        this.addressLine = addressLine;
        this.area = area;
        this.city = city;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
    }

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
}
