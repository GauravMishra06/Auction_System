package com.example.Auction_System.controller;

import com.example.Auction_System.dto.AuctionRequestDTO;
import com.example.Auction_System.dto.AuctionResponseDTO;
import com.example.Auction_System.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "*")
public class AuctionController {

    @Autowired
    private AuctionService auctionService;

    @PostMapping("/create")
    public ResponseEntity<AuctionResponseDTO> createAuction(@RequestBody AuctionRequestDTO request) {
        return ResponseEntity.ok(auctionService.createAuction(request));
    }

    @GetMapping("/active")
    public ResponseEntity<List<AuctionResponseDTO>> getActiveAuctions() {
        return ResponseEntity.ok(auctionService.getActiveAuctions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponseDTO> getAuctionDetails(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }
}