package com.kaamsetu.repository;

import com.kaamsetu.domain.entity.Job;
import com.kaamsetu.domain.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByEmployerProfileUserIdOrderByCreatedAtDesc(UUID employerId);
    List<Job> findByEmployerProfileUserIdAndStatusOrderByCreatedAtDesc(UUID employerId, JobStatus status);
    long countByEmployerProfileUserIdAndStatus(UUID employerId, JobStatus status);
    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);

    @Query(value = """
        SELECT j.*
        FROM jobs j
        WHERE j.status = 'ACTIVE'
          AND (j.location IS NULL OR ST_DWithin(j.location, CAST(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326) AS geography), :radiusMeters))
        ORDER BY j.created_at DESC
        """, nativeQuery = true)
    List<Job> findNearbyActiveJobs(
        @Param("lat") double lat,
        @Param("lon") double lon,
        @Param("radiusMeters") double radiusMeters
    );
}
