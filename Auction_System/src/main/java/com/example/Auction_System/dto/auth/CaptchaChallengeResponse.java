package com.example.Auction_System.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CaptchaChallengeResponse {
    private String challengeId;
    private String challengeHint;
    private long expiresInSeconds;
}
