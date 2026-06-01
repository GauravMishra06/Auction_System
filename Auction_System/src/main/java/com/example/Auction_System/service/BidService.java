package com.example.Auction_System.service;

import com.example.Auction_System.dto.BidRequestDTO;
import com.example.Auction_System.dto.BidResponseDTO;
import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.Bid;
import com.example.Auction_System.models.User;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.repository.BidRepository;
import com.example.Auction_System.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public BidResponseDTO placeBid(BidRequestDTO request) {
        Auction auction = auctionRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new RuntimeException("Target auction event entry lookup missing error"));

        // Validation Rule: Reject entries if timeline is closed or deactivated
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Validation Error: This auction timeline has completed or suspended processing!");
        }

        // Validation Rule: Incoming price check. Compare big decimal entries. Reject bids that are too low.
        if (request.getBidAmount().compareTo(auction.getCurrentHighestBid()) <= 0) {
            throw new RuntimeException("Validation Error: Proposed bid amount must be strictly greater than current highest bid!");
        }

        User bidder = userRepository.findById(request.getBidderId())
                .orElseThrow(() -> new RuntimeException("Profile transaction participant identity search error"));

        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setBidAmount(request.getBidAmount());
        Bid savedBid = bidRepository.save(bid);

        // Synchronize state: Update the highest bid pointer to lock in the new price
        auction.setCurrentHighestBid(request.getBidAmount());
        auctionRepository.save(auction);

        return convertToBidDTO(savedBid);
    }

    public List<BidResponseDTO> getBidHistory(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId).stream()
                .map(this::convertToBidDTO)
                .collect(Collectors.toList());
    }

    private BidResponseDTO convertToBidDTO(Bid bid) {
        BidResponseDTO dto = new BidResponseDTO();
        dto.setBidId(bid.getId());
        dto.setAuctionId(bid.getAuction().getId());
        dto.setBidderUsername(bid.getBidder().getUsername());
        dto.setBidAmount(bid.getBidAmount());
        dto.setBidTime(bid.getBidTime());
        return dto;
    }
}