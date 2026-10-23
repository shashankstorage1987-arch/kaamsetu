package com.kaamsetu.service;

import com.kaamsetu.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;
    private final int maxAttempts;
    private final long durationMinutes;

    public RateLimiterService(
            StringRedisTemplate redisTemplate,
            @Value("${kaamsetu.rate-limit.login.max-attempts:5}") int maxAttempts,
            @Value("${kaamsetu.rate-limit.login.duration-minutes:15}") long durationMinutes) {
        this.redisTemplate = redisTemplate;
        this.maxAttempts = maxAttempts;
        this.durationMinutes = durationMinutes;
    }

    public void checkLoginRateLimit(String phoneNumber) {
        String key = "login_attempts:" + phoneNumber;
        String attemptsStr = redisTemplate.opsForValue().get(key);
        if (attemptsStr != null) {
            int attempts = Integer.parseInt(attemptsStr);
            if (attempts >= maxAttempts) {
                throw new RateLimitExceededException("Too many failed login attempts. Account temporarily locked for " + durationMinutes + " minutes.");
            }
        }
    }

    public void recordFailedLoginAttempt(String phoneNumber) {
        String key = "login_attempts:" + phoneNumber;
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(durationMinutes));
        }
    }

    public void resetFailedLoginAttempts(String phoneNumber) {
        String key = "login_attempts:" + phoneNumber;
        redisTemplate.delete(key);
    }
}
