package com.example.Auction_System.controller;

import com.example.Auction_System.dto.AuctionRequestDTO;
import com.example.Auction_System.dto.AuctionResponseDTO;
import com.example.Auction_System.service.AuctionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('AUCTIONEER', 'ADMIN')")
    public ResponseEntity<AuctionResponseDTO> createAuction(@Valid @RequestBody AuctionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auctionService.createAuction(request));
    }

    @GetMapping("/active")
    public ResponseEntity<List<AuctionResponseDTO>> getActiveAuctions() {
        return ResponseEntity.ok(auctionService.getActiveAuctions());
    }

    @GetMapping("/completed")
    public ResponseEntity<List<AuctionResponseDTO>> getCompletedAuctions() {
        return ResponseEntity.ok(auctionService.getCompletedAuctions());
    }

    @GetMapping("/search")
    public ResponseEntity<List<AuctionResponseDTO>> searchActiveAuctions(
            @RequestParam(required = false) String auctionId,
            @RequestParam(required = false) String auctionTitle,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(auctionService.searchActiveAuctions(auctionId, auctionTitle, startDate, endDate, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponseDTO> getAuctionDetails(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('AUCTIONEER', 'ADMIN')")
    public ResponseEntity<AuctionResponseDTO> cancelAuction(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.cancelAuction(id));
    }

    @GetMapping("/seller/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AuctionResponseDTO>> getAuctionsBySeller(@PathVariable String username) {
        return ResponseEntity.ok(auctionService.getAuctionsBySeller(username));
    }
}