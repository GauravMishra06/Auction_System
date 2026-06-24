package com.example.Auction_System.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;


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
    private String sellerUsername; 
    private int bidCount;
}