package com.example.Auction_System.service;

import com.example.Auction_System.dto.BidRequestDTO;
import com.example.Auction_System.dto.BidResponseDTO;
import com.example.Auction_System.exception.AuthorizationException;
import com.example.Auction_System.exception.BusinessRuleException;
import com.example.Auction_System.exception.ResourceNotFoundException;
import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.Bid;
import com.example.Auction_System.models.User;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.repository.BidRepository;
import com.example.Auction_System.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BidService {

    private static final Logger log = LoggerFactory.getLogger(BidService.class);

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    public BidService(BidRepository bidRepository, AuctionRepository auctionRepository,
                      UserRepository userRepository) {
        this.bidRepository = bidRepository;
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BidResponseDTO placeBid(BidRequestDTO request) {
        Auction auction = auctionRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + request.getAuctionId()));

        
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new BusinessRuleException("This auction is no longer active.");
        }

        
        if (auction.getEndTime().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessRuleException("This auction has expired.");
        }

        
        if (request.getBidAmount().compareTo(auction.getCurrentHighestBid()) <= 0) {
            throw new BusinessRuleException("Bid amount must be greater than the current highest bid of $" + auction.getCurrentHighestBid());
        }

        
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User bidder = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        
        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new AuthorizationException("You cannot bid on your own auction.");
        }

        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setBidAmount(request.getBidAmount());
        Bid savedBid = bidRepository.save(bid);

        
        
        auction.setCurrentHighestBid(request.getBidAmount());
        auctionRepository.save(auction);

        log.info("Bid #{} placed by '{}' on auction #{} for ${}", savedBid.getId(), currentUsername, auction.getId(), request.getBidAmount());
        return convertToBidDTO(savedBid);
    }

    @Transactional(readOnly = true)
    public List<BidResponseDTO> getBidHistory(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId).stream()
                .map(this::convertToBidDTO)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public List<BidResponseDTO> getMyBids() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User bidder = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));
        return bidRepository.findByBidderId(bidder.getId()).stream()
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