package com.kaamsetu.service;

import com.kaamsetu.domain.entity.WorkerProfile;
import com.kaamsetu.repository.WorkerProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AvailabilityExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(AvailabilityExpiryScheduler.class);

    private final WorkerProfileRepository workerProfileRepository;
    private final RedisAvailabilityService redisAvailabilityService;

    public AvailabilityExpiryScheduler(
            WorkerProfileRepository workerProfileRepository,
            RedisAvailabilityService redisAvailabilityService) {
        this.workerProfileRepository = workerProfileRepository;
        this.redisAvailabilityService = redisAvailabilityService;
    }

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void processExpiredAvailabilities() {
        OffsetDateTime now = OffsetDateTime.now();
        List<WorkerProfile> expiredWorkers = workerProfileRepository.findExpiredAvailableWorkers(now);

        if (!expiredWorkers.isEmpty()) {
            log.info("Processing {} expired worker availabilities", expiredWorkers.size());
            for (WorkerProfile worker : expiredWorkers) {
                worker.setAvailable(false);
                // Preserve availableUntil timestamp (do NOT set to null)
                workerProfileRepository.save(worker);
                redisAvailabilityService.evictAvailability(worker.getUserId());
            }
        }
    }
}
