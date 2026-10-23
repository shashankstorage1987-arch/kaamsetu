package com.kaamsetu.service;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

@Service
public class GeocodingService {

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public Point createPoint(double latitude, double longitude) {
        // In JTS/PostGIS geography(Point, 4326), coordinate order is (longitude, latitude)
        return geometryFactory.createPoint(new Coordinate(longitude, latitude));
    }

    public Point geocodeAddress(String addressLine, String area, String city, String pincode) {
        // Stub/Fallback geocoder for Noida/Delhi-NCR region (MVP)
        double defaultLat = 28.6280;
        double defaultLon = 77.3649;

        if (area != null && area.toLowerCase().contains("sector 60")) {
            defaultLat = 28.5950;
            defaultLon = 77.3750;
        } else if (area != null && area.toLowerCase().contains("indirapuram")) {
            defaultLat = 28.6366;
            defaultLon = 77.3712;
        }

        return createPoint(defaultLat, defaultLon);
    }
}
