package com.example.Auction_System.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Data packet sent by the React client when a user types an amount
 * into the live bidding input box and clicks "Place Bid".
 */

@Data
public class BidRequestDTO {
    private Long auctionId;
    private Long bidderId;
    private BigDecimal bidAmount;
}
