package com.example.Auction_System.service;

import com.example.Auction_System.exception.BusinessRuleException;
import com.example.Auction_System.exception.ResourceNotFoundException;
import com.example.Auction_System.models.PasswordResetToken;
import com.example.Auction_System.models.User;
import com.example.Auction_System.repository.PasswordResetTokenRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {


    @Value("${app.password-reset.expiration-minutes:30}")
    private long expirationMinutes;

    @Value("${app.password-reset.frontend-url:http://localhost:3000/reset-password}")
    private String frontendResetUrl;

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public PasswordResetService(PasswordResetTokenRepository passwordResetTokenRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public String createToken(User user) {
        passwordResetTokenRepository.findAllByUserAndUsedFalse(user)
                .forEach(existing -> {
                    existing.setUsed(true);
                    passwordResetTokenRepository.save(existing);
                });

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setUsed(false);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));

        return passwordResetTokenRepository.save(token).getToken();
    }

    public String buildResetLink(String token) {
        return frontendResetUrl + "?token=" + token;
    }

    @Transactional
    public PasswordResetToken validateAndGet(String rawToken) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid password reset token."));

        if (token.isUsed()) {
            throw new BusinessRuleException("Password reset token has already been used.");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            token.setUsed(true);
            passwordResetTokenRepository.save(token);
            throw new BusinessRuleException("Password reset token has expired.");
        }

        return token;
    }

    @Transactional
    public void markUsed(PasswordResetToken token) {
        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    /**
     * Purges expired tokens from the database to prevent unbounded table growth.
     */
    @Transactional
    public int purgeExpiredTokens() {
        var expired = passwordResetTokenRepository.findAll().stream()
                .filter(t -> t.getExpiresAt().isBefore(LocalDateTime.now()) || t.isUsed())
                .toList();
        passwordResetTokenRepository.deleteAll(expired);
        return expired.size();
    }
}
