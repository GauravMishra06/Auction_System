package com.example.Auction_System.models.enums;

public enum AuctionStatus {
    PENDING,    // Created but listing window hasn't started yet
    ACTIVE,     // Open for bids!
    COMPLETED,  // Time expired, winner chosen
    CANCELLED   // Stoppage by an admin or seller
}