package com.kaamsetu.dto.job;

import java.util.List;

public class EmployerDashboardResponse {

    private Integer activeJobsCount;
    private Integer closedJobsCount;
    private Integer totalAppliedCount;
    private Integer totalSelectedCount;
    private Integer totalRejectedCount;
    private List<JobResponse> jobs;

    public EmployerDashboardResponse() {}

    public EmployerDashboardResponse(Integer activeJobsCount, Integer closedJobsCount, List<JobResponse> jobs) {
        this.activeJobsCount = activeJobsCount;
        this.closedJobsCount = closedJobsCount;
        this.jobs = jobs;
    }

    public EmployerDashboardResponse(Integer activeJobsCount, Integer closedJobsCount, Integer totalAppliedCount, Integer totalSelectedCount, Integer totalRejectedCount, List<JobResponse> jobs) {
        this.activeJobsCount = activeJobsCount;
        this.closedJobsCount = closedJobsCount;
        this.totalAppliedCount = totalAppliedCount;
        this.totalSelectedCount = totalSelectedCount;
        this.totalRejectedCount = totalRejectedCount;
        this.jobs = jobs;
    }

    public Integer getActiveJobsCount() { return activeJobsCount; }
    public void setActiveJobsCount(Integer activeJobsCount) { this.activeJobsCount = activeJobsCount; }

    public Integer getClosedJobsCount() { return closedJobsCount; }
    public void setClosedJobsCount(Integer closedJobsCount) { this.closedJobsCount = closedJobsCount; }

    public Integer getTotalAppliedCount() { return totalAppliedCount; }
    public void setTotalAppliedCount(Integer totalAppliedCount) { this.totalAppliedCount = totalAppliedCount; }

    public Integer getTotalSelectedCount() { return totalSelectedCount; }
    public void setTotalSelectedCount(Integer totalSelectedCount) { this.totalSelectedCount = totalSelectedCount; }

    public Integer getTotalRejectedCount() { return totalRejectedCount; }
    public void setTotalRejectedCount(Integer totalRejectedCount) { this.totalRejectedCount = totalRejectedCount; }

    public List<JobResponse> getJobs() { return jobs; }
    public void setJobs(List<JobResponse> jobs) { this.jobs = jobs; }
}
