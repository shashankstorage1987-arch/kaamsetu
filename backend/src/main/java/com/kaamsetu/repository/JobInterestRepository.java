package com.kaamsetu.repository;

import com.kaamsetu.domain.entity.JobInterest;
import com.kaamsetu.domain.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobInterestRepository extends JpaRepository<JobInterest, UUID> {
    Optional<JobInterest> findByJobIdAndWorkerProfileUserId(UUID jobId, UUID workerId);
    List<JobInterest> findByWorkerProfileUserIdOrderByCreatedAtDesc(UUID workerId);
    List<JobInterest> findByWorkerProfileUserIdAndStatus(UUID workerId, ApplicationStatus status);
    List<JobInterest> findByJobIdOrderByMatchScoreDesc(UUID jobId);
    long countByJobId(UUID jobId);
    long countByJobIdAndStatus(UUID jobId, ApplicationStatus status);
    long countByJobEmployerProfileUserId(UUID employerId);
    long countByJobEmployerProfileUserIdAndStatus(UUID employerId, ApplicationStatus status);
    boolean existsByWorkerProfileUserId(UUID workerId);

    @Query("SELECT COUNT(ji) > 0 FROM JobInterest ji WHERE ji.workerProfile.userId = :workerId AND ji.job.employerProfile.userId = :employerId")
    boolean existsByWorkerIdAndEmployerId(@Param("workerId") UUID workerId, @Param("employerId") UUID employerId);
}
