package com.example.Auction_System.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Data;

/**
 * Captures user input payload data coming from the React form when
 * an auctioneer lists an item.
 */
@Data
public class AuctionRequestDTO {
    @NotBlank(message = "Item name is required")
    @Size(max = 200, message = "Item name must not exceed 200 characters")
    private String itemName;

    @NotBlank(message = "Item description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String itemDescription;

    @NotBlank(message = "Category is required")
    private String category;

    private String imageUrl;

    @NotNull(message = "Start price is required")
    @Positive(message = "Start price must be greater than zero")
    private BigDecimal startPrice;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int durationInMinutes; // The service layer converts this to an explicit end timestamp
}