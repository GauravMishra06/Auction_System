package com.example.Auction_System.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;


@Data
public class BidRequestDTO {
    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "Bid amount is required")
    @Positive(message = "Bid amount must be greater than zero")
    private BigDecimal bidAmount;
}
