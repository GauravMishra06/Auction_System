package com.example.Auction_System.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Clean transaction confirmation returned to the UI to update the
 * live bid history dashboard.
 */
@Data
public class BidResponseDTO {
        private Long bidId;
        private Long auctionId;
        private String bidderUsername;
        private BigDecimal bidAmount;
        private LocalDateTime bidTime;
}
