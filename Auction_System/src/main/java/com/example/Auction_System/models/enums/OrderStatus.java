package com.example.Auction_System.models.enums;

public enum OrderStatus {
    PENDING,    // Winner chosen, order logged, awaiting payment checkout execution
    PAID,       // Customer card charged successfully
    FAILED      // Auction closed with no valid bids placed
}
