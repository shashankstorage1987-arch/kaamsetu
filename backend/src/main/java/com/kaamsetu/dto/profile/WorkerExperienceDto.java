package com.kaamsetu.dto.profile;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;
import java.util.UUID;

public class WorkerExperienceDto {

    private UUID id;

    @JsonProperty("trade")
    private TradeType trade;

    @JsonProperty("profession")
    private ProfessionType profession;

    @JsonProperty("previousEmployerName")
    @JsonAlias({"previous_employer_name", "previousEmployerName"})
    private String previousEmployerName;

    @JsonProperty("durationMonths")
    @JsonAlias({"duration_months", "durationMonths"})
    @Min(value = 0, message = "Duration must be at least 0 months")
    @Max(value = 600, message = "Duration cannot exceed 600 months")
    private Integer durationMonths;

    @JsonProperty("coreSkills")
    @JsonAlias({"core_skills", "coreSkills"})
    private List<String> coreSkills;

    public WorkerExperienceDto() {}

    public WorkerExperienceDto(UUID id, TradeType trade, ProfessionType profession, String previousEmployerName, Integer durationMonths, List<String> coreSkills) {
        this.id = id;
        this.trade = trade;
        this.profession = profession;
        this.previousEmployerName = previousEmployerName;
        this.durationMonths = durationMonths;
        this.coreSkills = coreSkills;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public TradeType getTrade() { return trade; }
    public void setTrade(TradeType trade) { this.trade = trade; }

    public ProfessionType getProfession() { return profession; }
    public void setProfession(ProfessionType profession) { this.profession = profession; }

    public String getPreviousEmployerName() { return previousEmployerName; }
    public void setPreviousEmployerName(String previousEmployerName) { this.previousEmployerName = previousEmployerName; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }

    public List<String> getCoreSkills() { return coreSkills; }
    public void setCoreSkills(List<String> coreSkills) { this.coreSkills = coreSkills; }
}
