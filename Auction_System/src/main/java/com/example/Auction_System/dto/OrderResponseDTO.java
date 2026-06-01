package com.example.Auction_System.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class OrderResponseDTO {
    private Long orderId;
    private Long auctionId;
    private String itemName;
    private BigDecimal finalPrice;
    private String winnerUsername;
    private String paymentStatus;
    private LocalDateTime createdAt;
}