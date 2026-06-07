package com.example.Auction_System.controller;

import com.example.Auction_System.dto.auth.AuthResponse;
import com.example.Auction_System.dto.auth.CaptchaChallengeResponse;
import com.example.Auction_System.dto.auth.ForgotPasswordRequest;
import com.example.Auction_System.dto.auth.MessageResponse;
import com.example.Auction_System.dto.auth.RefreshTokenRequest;
import com.example.Auction_System.dto.auth.ResetPasswordRequest;
import com.example.Auction_System.dto.auth.SignInRequest;
import com.example.Auction_System.dto.auth.SignUpRequest;
import com.example.Auction_System.service.AuthService;
import com.example.Auction_System.service.CaptchaService;
import com.example.Auction_System.service.RateLimitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CaptchaService captchaService;
    private final RateLimitService rateLimitService;

    public AuthController(AuthService authService, CaptchaService captchaService, RateLimitService rateLimitService) {
        this.authService = authService;
        this.captchaService = captchaService;
        this.rateLimitService = rateLimitService;
    }

    @GetMapping("/captcha")
    public ResponseEntity<CaptchaChallengeResponse> captcha() {
        return ResponseEntity.ok(captchaService.createChallenge());
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@Valid @RequestBody SignUpRequest request, HttpServletRequest httpRequest) {
        rateLimitService.checkRateLimit(getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signUp(request));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signIn(@Valid @RequestBody SignInRequest request, HttpServletRequest httpRequest) {
        rateLimitService.checkRateLimit(getClientIp(httpRequest));
        return ResponseEntity.ok(authService.signIn(request));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.logout(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}
