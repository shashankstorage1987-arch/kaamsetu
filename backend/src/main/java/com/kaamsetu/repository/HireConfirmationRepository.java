package com.kaamsetu.repository;

import com.kaamsetu.domain.entity.HireConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HireConfirmationRepository extends JpaRepository<HireConfirmation, UUID> {
    Optional<HireConfirmation> findByJobIdAndWorkerProfileUserId(UUID jobId, UUID workerId);
    List<HireConfirmation> findByWorkerProfileUserIdOrderByCreatedAtDesc(UUID workerId);
    List<HireConfirmation> findByJobEmployerProfileUserIdOrderByCreatedAtDesc(UUID employerId);
    Optional<HireConfirmation> findByJobId(UUID jobId);
    boolean existsByJobId(UUID jobId);
}
