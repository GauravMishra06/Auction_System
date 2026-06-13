package com.example.Auction_System.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * Returns a clean, flattened dataset back to your React components.
 */
@Data
public class AuctionResponseDTO {
    private Long auctionId;
    private String itemName;
    private String itemDescription;
    private String category;
    private String imageUrl;
    private BigDecimal startPrice;
    private BigDecimal currentHighestBid;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String sellerUsername; // Avoids sending back the whole nested User object structure
    private int bidCount;
}