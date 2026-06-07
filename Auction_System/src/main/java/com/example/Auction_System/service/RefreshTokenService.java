package com.example.Auction_System.service;

import com.example.Auction_System.exception.BusinessRuleException;
import com.example.Auction_System.exception.ResourceNotFoundException;
import com.example.Auction_System.models.RefreshToken;
import com.example.Auction_System.models.User;
import com.example.Auction_System.repository.RefreshTokenRepository;
import com.example.Auction_System.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public String createForUser(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(jwtService.generateRefreshToken(user.getUsername(), user.getId(), user.getRole().name()));
        refreshToken.setExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(jwtService.getRefreshExpirationMs())));
        refreshToken.setRevoked(false);
        return refreshTokenRepository.save(refreshToken).getToken();
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(existing -> {
            existing.setRevoked(true);
            refreshTokenRepository.save(existing);
        });
    }

    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.findAllByUserAndRevokedFalse(user)
                .forEach(existing -> {
                    existing.setRevoked(true);
                    refreshTokenRepository.save(existing);
                });
    }

    @Transactional
    public RefreshToken validateAndGet(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid refresh token."));

        if (refreshToken.isRevoked()) {
            throw new BusinessRuleException("Refresh token has been revoked.");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BusinessRuleException("Refresh token has expired.");
        }

        if (!jwtService.isRawTokenValid(token, refreshToken.getUser().getUsername())) {
            throw new BusinessRuleException("Refresh token is invalid.");
        }

        return refreshToken;
    }

    /**
     * Purges expired/revoked tokens from the database to prevent unbounded table growth.
     */
    @Transactional
    public int purgeExpiredTokens() {
        var expired = refreshTokenRepository.findAll().stream()
                .filter(t -> t.getExpiresAt().isBefore(LocalDateTime.now()) || t.isRevoked())
                .toList();
        refreshTokenRepository.deleteAll(expired);
        return expired.size();
    }
}
