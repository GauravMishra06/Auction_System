package com.example.Auction_System.controller;

import com.example.Auction_System.dto.BidRequestDTO;
import com.example.Auction_System.dto.BidResponseDTO;
import com.example.Auction_System.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BidService bidService;

    @PostMapping("/place")
    public ResponseEntity<BidResponseDTO> placeBid(@RequestBody BidRequestDTO request) {
        return ResponseEntity.ok(bidService.placeBid(request));
    }

    @GetMapping("/history/{auctionId}")
    public ResponseEntity<List<BidResponseDTO>> getHistory(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getBidHistory(auctionId));
    }
}