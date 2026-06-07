package com.example.Auction_System;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // <-- REQUIRED CRITICAL INPUT: This activates background @Scheduled execution tasks!
public class AuctionSystemApplication {
	public static void main(String[] args) {
		// Load local .env variables into System properties if not already set in OS
		try {
			Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
			dotenv.entries().forEach(entry -> {
				if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
					System.setProperty(entry.getKey(), entry.getValue());
				}
			});
		} catch (Exception e) {
			// Silent fallback if .env is missing or malformed
		}
		
		SpringApplication.run(AuctionSystemApplication.class, args);
	}
}