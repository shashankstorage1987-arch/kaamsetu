package com.kaamsetu.integration;

import com.kaamsetu.domain.entity.User;
import com.kaamsetu.domain.entity.WorkerExperience;
import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.ProfessionType;
import com.kaamsetu.domain.enums.TradeType;
import com.kaamsetu.domain.enums.UserRole;
import com.kaamsetu.dto.search.WorkerSearchRequest;
import com.kaamsetu.dto.search.WorkerSearchResponse;
import com.kaamsetu.dto.search.WorkerSearchResultDto;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import com.kaamsetu.service.SearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class SearchIntegrationTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    private final GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

    // Connaught Place, New Delhi coordinates
    private final double BASE_LAT = 28.6315;
    private final double BASE_LON = 77.2167;

    private User employerUser;

    @BeforeEach
    public void setUp() {
        employerUser = new User();
        employerUser.setPhoneNumber("9876543210");
        employerUser.setPinHash("hashed");
        employerUser.setRole(UserRole.EMPLOYER);
        employerUser = userRepository.save(employerUser);

        // 1. Worker 1: Raj Kumar (Distance ~ 500 meters from Base)
        createWorker("Raj Kumar", "9111111111", 28.6350, 77.2167, TradeType.ELECTRICAL, ProfessionType.HELPER, 5.0, true, true);

        // 2. Worker 2: Mohan Lal (Distance ~ 2.5 km from Base)
        createWorker("Mohan Lal", "9222222222", 28.6540, 77.2167, TradeType.ELECTRICAL, ProfessionType.HELPER, 2.0, true, false);

        // 3. Worker 3: Suresh V (Distance ~ 4.5 km from Base)
        createWorker("Suresh V", "9333333333", 28.6720, 77.2167, TradeType.HARDWARE, ProfessionType.HELPER, 3.0, false, true);

        // 4. Worker 4: Far Away Worker (Distance ~ 12 km from Base)
        createWorker("Far Away", "9444444444", 28.7400, 77.2167, TradeType.ELECTRICAL, ProfessionType.HELPER, 10.0, true, true);
    }

    private WorkerProfile createWorker(String name, String phone, double lat, double lon, TradeType trade, ProfessionType profession, double expYears, boolean available, boolean aadhaarVerified) {
        User u = new User();
        u.setPhoneNumber(phone);
        u.setPinHash("hash");
        u.setRole(UserRole.WORKER);
        u.setAadhaarVerified(aadhaarVerified);
        u = userRepository.save(u);

        WorkerProfile wp = new WorkerProfile(u, name);
        wp.setTotalExperienceYears(BigDecimal.valueOf(expYears));
        wp.setAvailable(available);
        if (available) {
            wp.setAvailableUntil(OffsetDateTime.now().plusHours(12));
        }
        Point point = gf.createPoint(new Coordinate(lon, lat));
        wp.setLocation(point);

        WorkerExperience exp = new WorkerExperience(trade, profession, "Past Company", (int) (expYears * 12));
        wp.addExperience(exp);

        return workerProfileRepository.save(wp);
    }

    @Test
    public void testRadiusFiltering1km() {
        WorkerSearchRequest req = new WorkerSearchRequest();
        req.setRadiusKm(new BigDecimal("1.0"));
        req.setTrade(TradeType.ELECTRICAL);

        WorkerSearchResponse response = searchService.searchWorkers(BASE_LAT, BASE_LON, req, employerUser);

        // Only Raj Kumar is within 1.0 km
        assertEquals(1, response.getTotalFound());
        assertEquals("Raj Kumar", response.getWorkers().get(0).getFullName());
    }

    @Test
    public void testRadiusFiltering3km() {
        WorkerSearchRequest req = new WorkerSearchRequest();
        req.setRadiusKm(new BigDecimal("3.0"));
        req.setTrade(TradeType.ELECTRICAL);

        WorkerSearchResponse response = searchService.searchWorkers(BASE_LAT, BASE_LON, req, employerUser);

        // Raj Kumar (~0.5km) and Mohan Lal (~2.5km) are within 3.0 km
        assertEquals(2, response.getTotalFound());
    }

    @Test
    public void testFilterAvailableOnly() {
        WorkerSearchRequest req = new WorkerSearchRequest();
        req.setRadiusKm(new BigDecimal("5.0"));
        req.setAvailableNow(true);

        WorkerSearchResponse response = searchService.searchWorkers(BASE_LAT, BASE_LON, req, employerUser);

        // Raj Kumar and Mohan Lal are available now. Suresh V (unavailable) excluded.
        List<String> names = response.getWorkers().stream().map(WorkerSearchResultDto::getFullName).toList();
        assertTrue(names.contains("Raj Kumar"));
        assertTrue(names.contains("Mohan Lal"));
        assertFalse(names.contains("Suresh V"));
    }

    @Test
    public void testFilterVerifiedOnly() {
        WorkerSearchRequest req = new WorkerSearchRequest();
        req.setRadiusKm(new BigDecimal("5.0"));
        req.setVerified(true);

        WorkerSearchResponse response = searchService.searchWorkers(BASE_LAT, BASE_LON, req, employerUser);

        // Raj Kumar and Suresh V are Aadhaar verified. Mohan Lal is not.
        List<String> names = response.getWorkers().stream().map(WorkerSearchResultDto::getFullName).toList();
        assertTrue(names.contains("Raj Kumar"));
        assertTrue(names.contains("Suresh V"));
        assertFalse(names.contains("Mohan Lal"));
    }

    @Test
    public void testFilterExperienceMin() {
        WorkerSearchRequest req = new WorkerSearchRequest();
        req.setRadiusKm(new BigDecimal("5.0"));
        req.setExperienceMin(new BigDecimal("3.0"));

        WorkerSearchResponse response = searchService.searchWorkers(BASE_LAT, BASE_LON, req, employerUser);

        // Raj Kumar (5.0 yrs) and Suresh V (3.0 yrs) pass. Mohan Lal (2.0 yrs) excluded.
        List<String> names = response.getWorkers().stream().map(WorkerSearchResultDto::getFullName).toList();
        assertTrue(names.contains("Raj Kumar"));
        assertTrue(names.contains("Suresh V"));
        assertFalse(names.contains("Mohan Lal"));
    }

    @Test
    public void testFilterSalaryMax() {
        // Set preferred salary for Raj Kumar = 15000, Mohan Lal = 25000
        WorkerProfile raj = workerProfileRepository.findAll().stream().filter(w -> "Raj Kumar".equals(w.getFullName())).findFirst().get();
        raj.setPreferredSalary(15000);
        workerProfileRepository.save(raj);

        WorkerProfile mohan = workerProfileRepository.findAll().stream().filter(w -> "Mohan Lal".equals(w.getFullName())).findFirst().get();
        mohan.setPreferredSalary(25000);
        workerProfileRepository.save(mohan);

        WorkerSearchRequest req = new WorkerSearchRequest();
        req.setRadiusKm(new BigDecimal("5.0"));
        req.setSalaryMax(20000);

        WorkerSearchResponse response = searchService.searchWorkers(BASE_LAT, BASE_LON, req, employerUser);

        List<String> names = response.getWorkers().stream().map(WorkerSearchResultDto::getFullName).toList();
        assertTrue(names.contains("Raj Kumar"));
        assertFalse(names.contains("Mohan Lal"));
    }

    @Test
    public void testDeterministicSorting() {
        WorkerSearchRequest req = new WorkerSearchRequest();
        req.setRadiusKm(new BigDecimal("5.0"));
        req.setTrade(TradeType.ELECTRICAL);

        WorkerSearchResponse response = searchService.searchWorkers(BASE_LAT, BASE_LON, req, employerUser);

        // Match scores should be in descending order
        List<WorkerSearchResultDto> workers = response.getWorkers();
        for (int i = 0; i < workers.size() - 1; i++) {
            BigDecimal currentScore = workers.get(i).getMatchScore();
            BigDecimal nextScore = workers.get(i + 1).getMatchScore();
            assertTrue(currentScore.compareTo(nextScore) >= 0, "Scores should be descending");
        }
    }
}
