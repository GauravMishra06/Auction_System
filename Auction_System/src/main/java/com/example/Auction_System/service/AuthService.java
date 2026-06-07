package com.example.Auction_System.service;

import com.example.Auction_System.dto.auth.AuthResponse;
import com.example.Auction_System.dto.auth.ForgotPasswordRequest;
import com.example.Auction_System.dto.auth.MessageResponse;
import com.example.Auction_System.dto.auth.RefreshTokenRequest;
import com.example.Auction_System.dto.auth.ResetPasswordRequest;
import com.example.Auction_System.dto.auth.SignInRequest;
import com.example.Auction_System.dto.auth.SignUpRequest;
import com.example.Auction_System.exception.BusinessRuleException;
import com.example.Auction_System.exception.ResourceNotFoundException;
import com.example.Auction_System.models.PasswordResetToken;
import com.example.Auction_System.models.RefreshToken;
import com.example.Auction_System.models.User;
import com.example.Auction_System.models.enums.Role;
import com.example.Auction_System.repository.UserRepository;
import com.example.Auction_System.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CaptchaService captchaService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;

    public AuthService(UserRepository userRepository, AuthenticationManager authenticationManager,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       CaptchaService captchaService, RefreshTokenService refreshTokenService,
                       PasswordResetService passwordResetService) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.captchaService = captchaService;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
    }

    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        captchaService.verifyOrThrow(request.getCaptchaId(), request.getCaptchaAnswer());

        // Block self-assignment of ADMIN role during public sign-up
        if (request.getRole() == Role.ROLE_ADMIN) {
            throw new BusinessRuleException("Admin accounts cannot be created through public registration.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessRuleException("Username is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Email is already in use.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User saved = userRepository.save(user);
        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                saved.getUsername(),
                saved.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(saved.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails, saved.getId(), saved.getRole().name());
        String refreshToken = refreshTokenService.createForUser(saved);
        log.info("New user '{}' registered with role {}", saved.getUsername(), saved.getRole());
        return new AuthResponse(token, refreshToken, saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole().name());
    }

    @Transactional
    public AuthResponse signIn(SignInRequest request) {
        captchaService.verifyOrThrow(request.getCaptchaId(), request.getCaptchaAnswer());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()))
        );

        refreshTokenService.revokeAllForUser(user);
        String token = jwtService.generateToken(userDetails, user.getId(), user.getRole().name());
        String refreshToken = refreshTokenService.createForUser(user);
        log.info("User '{}' signed in", user.getUsername());
        return new AuthResponse(token, refreshToken, user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.validateAndGet(request.getRefreshToken());
        User user = refreshToken.getUser();

        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()))
        );

        refreshTokenService.revokeToken(request.getRefreshToken());
        String newAccessToken = jwtService.generateToken(userDetails, user.getId(), user.getRole().name());
        String newRefreshToken = refreshTokenService.createForUser(user);
        return new AuthResponse(newAccessToken, newRefreshToken, user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public MessageResponse logout(RefreshTokenRequest request) {
        refreshTokenService.revokeToken(request.getRefreshToken());
        return new MessageResponse("Logged out successfully.");
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isPresent()) {
            String token = passwordResetService.createToken(optionalUser.get());
            String resetLink = passwordResetService.buildResetLink(token);
            // In production, send this via email (JavaMailSender / SendGrid)
            log.info("Password reset link generated for user '{}': {}", optionalUser.get().getUsername(), resetLink);
        }

        return new MessageResponse("If the email is registered, a password reset link has been sent.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetService.validateAndGet(request.getToken());
        User user = resetToken.getUser();

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetService.markUsed(resetToken);
        refreshTokenService.revokeAllForUser(user);

        log.info("Password reset completed for user '{}'", user.getUsername());
        return new MessageResponse("Password reset successful. Please sign in again.");
    }
}
