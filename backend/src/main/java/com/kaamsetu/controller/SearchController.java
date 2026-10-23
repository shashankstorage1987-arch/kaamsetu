package com.kaamsetu.controller;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.dto.job.JobResponse;
import com.kaamsetu.dto.search.WorkerSearchRequest;
import com.kaamsetu.dto.search.WorkerSearchResponse;
import com.kaamsetu.security.UserPrincipal;
import com.kaamsetu.service.JobService;
import com.kaamsetu.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;
    private final JobService jobService;

    public SearchController(SearchService searchService, JobService jobService) {
        this.searchService = searchService;
        this.jobService = jobService;
    }

    @GetMapping("/workers")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<WorkerSearchResponse> searchWorkers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) TradeType trade,
            @RequestParam(required = false) ProfessionType profession,
            @RequestParam(required = false) Boolean availableNow,
            @RequestParam(required = false, name = "available_now") Boolean availableNowSnake,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Boolean similarShop,
            @RequestParam(required = false, name = "similar_shop") Boolean similarShopSnake,
            @RequestParam(required = false) Integer salaryMax,
            @RequestParam(required = false, name = "salary_max") Integer salaryMaxSnake,
            @RequestParam(required = false) BigDecimal experienceMin,
            @RequestParam(required = false, name = "experience_min") BigDecimal experienceMinSnake,
            @RequestParam(required = false) BigDecimal radiusKm,
            @RequestParam(required = false, name = "radius_km") BigDecimal radiusKmSnake) {

        WorkerSearchRequest request = new WorkerSearchRequest();
        request.setTrade(trade);
        request.setProfession(profession);
        request.setAvailableNow(availableNow != null ? availableNow : availableNowSnake);
        request.setVerified(verified);
        request.setSimilarShop(similarShop != null ? similarShop : similarShopSnake);
        request.setSalaryMax(salaryMax != null ? salaryMax : salaryMaxSnake);
        request.setExperienceMin(experienceMin != null ? experienceMin : experienceMinSnake);

        BigDecimal effectiveRadius = radiusKm != null ? radiusKm : (radiusKmSnake != null ? radiusKmSnake : new BigDecimal("1.0"));
        request.setRadiusKm(effectiveRadius);

        User employerUser = new User();
        employerUser.setId(principal.getId());
        employerUser.setRole(principal.getRole());

        WorkerSearchResponse response = searchService.searchWorkers(lat, lon, request, employerUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasAnyRole('WORKER', 'EMPLOYER')")
    public ResponseEntity<List<JobResponse>> searchJobs(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) String trade,
            @RequestParam(required = false) String profession,
            @RequestParam(required = false) BigDecimal radiusKm,
            @RequestParam(required = false, name = "radius_km") BigDecimal radiusKmSnake) {

        User user = new User();
        if (principal != null) {
            user.setId(principal.getId());
            user.setRole(principal.getRole());
        }

        TradeType tradeEnum = null;
        if (trade != null && !trade.isBlank()) {
            try { tradeEnum = TradeType.valueOf(trade.trim().toUpperCase()); } catch (Exception ignored) {}
        }

        ProfessionType professionEnum = null;
        if (profession != null && !profession.isBlank()) {
            try { professionEnum = ProfessionType.valueOf(profession.trim().toUpperCase()); } catch (Exception ignored) {}
        }

        BigDecimal effectiveRadius = radiusKm != null ? radiusKm : (radiusKmSnake != null ? radiusKmSnake : new BigDecimal("10.0"));

        List<JobResponse> jobs = jobService.searchJobsForWorker(user, lat, lon, tradeEnum, professionEnum, effectiveRadius);
        return ResponseEntity.ok(jobs);
    }
}
