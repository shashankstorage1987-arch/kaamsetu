package com.kaamsetu.repository;

import com.kaamsetu.domain.entity.WorkerExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkerExperienceRepository extends JpaRepository<WorkerExperience, UUID> {
    List<WorkerExperience> findByWorkerProfileUserId(UUID workerId);
}
