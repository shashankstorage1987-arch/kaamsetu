package com.kaamsetu.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class RedisAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(RedisAvailabilityService.class);
    private static final String KEY_PREFIX = "worker_avail:";

    private final StringRedisTemplate redisTemplate;

    public RedisAvailabilityService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void cacheAvailability(UUID workerId, OffsetDateTime availableUntil) {
        if (workerId == null || availableUntil == null) return;
        try {
            long remainingSeconds = Duration.between(OffsetDateTime.now(), availableUntil).getSeconds();
            if (remainingSeconds > 0) {
                String key = KEY_PREFIX + workerId;
                redisTemplate.opsForValue().set(key, availableUntil.toString(), Duration.ofSeconds(remainingSeconds));
            } else {
                evictAvailability(workerId);
            }
        } catch (Exception e) {
            log.warn("Failed to cache worker availability in Redis for worker {}: {}", workerId, e.getMessage());
        }
    }

    public void evictAvailability(UUID workerId) {
        if (workerId == null) return;
        try {
            String key = KEY_PREFIX + workerId;
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Failed to evict worker availability from Redis for worker {}: {}", workerId, e.getMessage());
        }
    }

    public Boolean isWorkerAvailableInCache(UUID workerId) {
        if (workerId == null) return null;
        try {
            String key = KEY_PREFIX + workerId;
            String val = redisTemplate.opsForValue().get(key);
            if (val != null) {
                OffsetDateTime until = OffsetDateTime.parse(val);
                return until.isAfter(OffsetDateTime.now());
            }
        } catch (Exception e) {
            log.warn("Failed to query worker availability cache for worker {}: {}", workerId, e.getMessage());
        }
        return null; // Return null on cache miss or Redis error to fallback to PostgreSQL
    }
}
