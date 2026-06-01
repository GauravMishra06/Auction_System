package com.example.Auction_System.dto;

import java.math.BigDecimal;
import lombok.Data;

/**
 * Captures user input payload data coming from the React form when
 * an auctioneer lists an item.
 */
@Data
public class AuctionRequestDTO {
    private String itemName;
    private String itemDescription;
    private String category;
    private String imageUrl;
    private BigDecimal startPrice;
    private int durationInMinutes; // The service layer converts this to an explicit end timestamp
    private Long sellerId;
}