package com.example.Auction_System.service;

import com.example.Auction_System.exception.BusinessRuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class CaptchaService {

    private static final Logger log = LoggerFactory.getLogger(CaptchaService.class);

    @Value("${google.recaptcha.secret}")
    private String recaptchaSecret;

    @Value("${google.recaptcha.verify-url}")
    private String verifyUrl;

    public void verifyRecaptcha(String recaptchaToken) {
        if (recaptchaToken == null || recaptchaToken.trim().isEmpty()) {
            throw new BusinessRuleException("reCAPTCHA token is missing.");
        }

        RestTemplate restTemplate = new RestTemplate();
        MultiValueMap<String, String> requestMap = new LinkedMultiValueMap<>();
        requestMap.add("secret", recaptchaSecret);
        requestMap.add("response", recaptchaToken);

        try {
            Map<String, Object> apiResponse = restTemplate.postForObject(verifyUrl, requestMap, Map.class);
            
            if (apiResponse == null || !Boolean.TRUE.equals(apiResponse.get("success"))) {
                log.warn("reCAPTCHA validation failed. Response: {}", apiResponse);
                throw new BusinessRuleException("reCAPTCHA validation failed. Are you a robot?");
            }
        } catch (Exception e) {
            log.error("Error communicating with Google reCAPTCHA service", e);
            throw new BusinessRuleException("Failed to verify reCAPTCHA.");
        }
    }
}
