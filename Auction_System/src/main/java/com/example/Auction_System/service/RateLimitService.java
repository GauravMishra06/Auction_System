package com.example.Auction_System.service;

import com.example.Auction_System.exception.BusinessRuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter for auth endpoints.
 * Tracks requests per IP and blocks after exceeding the limit.
 */
@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);
    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000; // 1 minute

    private final Map<String, RateLimitEntry> requestCounts = new ConcurrentHashMap<>();

    /**
     * Checks if the given IP has exceeded the rate limit.
     * Throws BusinessRuleException if exceeded.
     */
    public void checkRateLimit(String clientIp) {
        Instant now = Instant.now();
        RateLimitEntry entry = requestCounts.compute(clientIp, (ip, existing) -> {
            if (existing == null || now.toEpochMilli() - existing.windowStart() > WINDOW_MS) {
                return new RateLimitEntry(1, now.toEpochMilli());
            }
            return new RateLimitEntry(existing.count() + 1, existing.windowStart());
        });

        if (entry.count() > MAX_REQUESTS) {
            throw new BusinessRuleException("Too many requests. Please wait a moment and try again.");
        }
    }

    /**
     * Scheduled cleanup of old rate limit entries to prevent memory growth.
     * Called manually or can be scheduled.
     */
    public void cleanup() {
        long now = Instant.now().toEpochMilli();
        int before = requestCounts.size();
        requestCounts.entrySet().removeIf(e -> now - e.getValue().windowStart() > WINDOW_MS);
        int removed = before - requestCounts.size();
        if (removed > 0) {
            log.debug("Cleaned up {} expired rate limit entries", removed);
        }
    }

    private record RateLimitEntry(int count, long windowStart) {}
}
