package com.example.Auction_System.models.enums;

/**
 * Enums restrict a variable to have one of a few predefined constants.
 * This prevents typos in our database (e.g., someone typing "adminn" instead of "ROLE_ADMIN").
 */
public enum Role {
    ROLE_BIDDER,       // Can look at items and submit bids
    ROLE_AUCTIONEER,   // Can create new items and run auctions
    ROLE_ADMIN         // Full system control
}