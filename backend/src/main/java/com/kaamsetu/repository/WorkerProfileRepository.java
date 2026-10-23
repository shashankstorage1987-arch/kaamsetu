package com.kaamsetu.repository;

import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.domain.enums.HireStatus;
import com.kaamsetu.domain.enums.TradeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, UUID> {

    @Query("SELECT COUNT(h) FROM HireConfirmation h WHERE h.workerProfile.userId = :workerId AND h.status = :status AND h.confirmedAt >= :threeMonthsAgo")
    long countRecentlyCompletedHires(@Param("workerId") UUID workerId, @Param("status") HireStatus status, @Param("threeMonthsAgo") OffsetDateTime threeMonthsAgo);

    @Query("SELECT DISTINCT e.trade FROM WorkerExperience e WHERE e.workerProfile.userId = :workerId")
    List<TradeType> findDistinctTradesWorked(@Param("workerId") UUID workerId);

    @Query(value = """
        SELECT w.*
        FROM worker_profiles w
        WHERE w.location IS NOT NULL
          AND ST_DWithin(w.location, CAST(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326) AS geography), :radiusMeters)
        """, nativeQuery = true)
    List<WorkerProfile> findNearbyCandidates(
        @Param("lat") double lat,
        @Param("lon") double lon,
        @Param("radiusMeters") double radiusMeters
    );

    @Query("SELECT w FROM WorkerProfile w WHERE w.isAvailable = true AND w.availableUntil IS NOT NULL AND w.availableUntil <= :now")
    List<WorkerProfile> findExpiredAvailableWorkers(@Param("now") OffsetDateTime now);
}
