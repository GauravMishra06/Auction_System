package com.example.Auction_System.controller;

import com.example.Auction_System.dto.BidRequestDTO;
import com.example.Auction_System.dto.BidResponseDTO;
import com.example.Auction_System.service.BidService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @PostMapping("/place")
    @PreAuthorize("hasAnyRole('BIDDER', 'ADMIN')")
    public ResponseEntity<BidResponseDTO> placeBid(@Valid @RequestBody BidRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bidService.placeBid(request));
    }

    @GetMapping("/history/{auctionId}")
    public ResponseEntity<List<BidResponseDTO>> getHistory(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getBidHistory(auctionId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('BIDDER', 'ADMIN')")
    public ResponseEntity<List<BidResponseDTO>> getMyBids() {
        return ResponseEntity.ok(bidService.getMyBids());
    }
}