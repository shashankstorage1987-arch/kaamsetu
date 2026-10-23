package com.kaamsetu.dto.search;

import java.math.BigDecimal;
import java.util.List;

public class WorkerSearchResponse {

    private int totalFound;
    private BigDecimal radiusKm;
    private List<WorkerSearchResultDto> workers;

    public WorkerSearchResponse() {}

    public WorkerSearchResponse(int totalFound, BigDecimal radiusKm, List<WorkerSearchResultDto> workers) {
        this.totalFound = totalFound;
        this.radiusKm = radiusKm;
        this.workers = workers;
    }

    public int getTotalFound() { return totalFound; }
    public void setTotalFound(int totalFound) { this.totalFound = totalFound; }

    public BigDecimal getRadiusKm() { return radiusKm; }
    public void setRadiusKm(BigDecimal radiusKm) { this.radiusKm = radiusKm; }

    public List<WorkerSearchResultDto> getWorkers() { return workers; }
    public void setWorkers(List<WorkerSearchResultDto> workers) { this.workers = workers; }
}
