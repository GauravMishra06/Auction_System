package com.example.Auction_System.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignInRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String captchaId;

    @NotBlank
    private String captchaAnswer;
}
