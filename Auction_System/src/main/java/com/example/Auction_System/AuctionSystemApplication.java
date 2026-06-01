package com.example.Auction_System;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // <-- REQUIRED CRITICAL INPUT: This activates background @Scheduled execution tasks!
public class AuctionSystemApplication {
	public static void main(String[] args) {
		SpringApplication.run(AuctionSystemApplication.class, args);
	}
}