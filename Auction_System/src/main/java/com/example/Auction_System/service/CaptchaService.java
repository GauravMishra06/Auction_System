package com.example.Auction_System.service;

import com.example.Auction_System.dto.auth.CaptchaChallengeResponse;
import com.example.Auction_System.exception.BusinessRuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaService {

    private static final Logger log = LoggerFactory.getLogger(CaptchaService.class);
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CAPTCHA_LENGTH = 6;

    private final Map<String, CaptchaEntry> activeChallenges = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.captcha.ttl-seconds}")
    private long ttlSeconds;

    public CaptchaChallengeResponse createChallenge() {
        String challengeId = UUID.randomUUID().toString();
        String text = randomText();
        long expiresAt = Instant.now().plusSeconds(ttlSeconds).toEpochMilli();
        activeChallenges.put(challengeId, new CaptchaEntry(text, expiresAt));

        // Build an obfuscated hint — show the text with spacing for the user to type
        // In production, this should be rendered as a distorted image
        String hint = obfuscateText(text);
        return new CaptchaChallengeResponse(challengeId, hint, ttlSeconds);
    }

    public void verifyOrThrow(String challengeId, String answer) {
        CaptchaEntry entry = activeChallenges.remove(challengeId);
        if (entry == null || Instant.now().toEpochMilli() > entry.expiresAt()) {
            throw new BusinessRuleException("Captcha expired. Please refresh and try again.");
        }

        if (!entry.answer().equalsIgnoreCase(answer.trim())) {
            throw new BusinessRuleException("Captcha validation failed.");
        }
    }

    /**
     * Scheduled cleanup of expired captcha entries to prevent memory leak.
     * Runs every 5 minutes.
     */
    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredEntries() {
        long now = Instant.now().toEpochMilli();
        int sizeBefore = activeChallenges.size();
        activeChallenges.entrySet().removeIf(entry -> now > entry.getValue().expiresAt());
        int removed = sizeBefore - activeChallenges.size();
        if (removed > 0) {
            log.debug("Cleaned up {} expired captcha entries", removed);
        }
    }

    private String randomText() {
        StringBuilder sb = new StringBuilder(CAPTCHA_LENGTH);
        for (int i = 0; i < CAPTCHA_LENGTH; i++) {
            sb.append(CHARS.charAt(secureRandom.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Create a simple obfuscated text hint for the user.
     * Adds spacing and decorative characters so it's not trivially machine-readable from JSON.
     * In a production system, this should be replaced with an image-based captcha.
     */
    private String obfuscateText(String text) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            sb.append(text.charAt(i));
            if (i < text.length() - 1) {
                sb.append(" ");
            }
        }
        return sb.toString();
    }

    private record CaptchaEntry(String answer, long expiresAt) {
    }
}
