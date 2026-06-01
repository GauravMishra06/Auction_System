package com.example.Auction_System.service;

import com.example.Auction_System.dto.AuctionRequestDTO;
import com.example.Auction_System.dto.AuctionResponseDTO;
import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.Item;
import com.example.Auction_System.models.User;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * @Transactional protects transaction integrity. If saving the auction record errors out midway,
     * the item entry rolls back automatically so you don't end up with broken/orphaned rows in SQL.
     */
    @Transactional
    public AuctionResponseDTO createAuction(AuctionRequestDTO request) {
        User seller = userRepository.findById(request.getSellerId())
                .orElseThrow(() -> new RuntimeException("Seller profile entity lookup match failed"));

        // Instantiate database model entity and assign text field context data points
        Item item = new Item();
        item.setName(request.getItemName());
        item.setDescription(request.getItemDescription());
        item.setCategory(request.getCategory());
        item.setImageUrl(request.getImageUrl());

        Auction auction = new Auction();
        auction.setItem(item);
        auction.setSeller(seller);
        auction.setStartPrice(request.getStartPrice());
        auction.setCurrentHighestBid(request.getStartPrice()); // Starting out, highest bid equals base minimum price
        auction.setStartTime(LocalDateTime.now());
        // Calculate expiration endpoint by extending current timestamp with request context properties
        auction.setEndTime(LocalDateTime.now().plusMinutes(request.getDurationInMinutes()));
        auction.setStatus(AuctionStatus.ACTIVE);

        Auction savedAuction = auctionRepository.save(auction);
        return convertToResponseDTO(savedAuction);
    }

    public List<AuctionResponseDTO> getActiveAuctions() {
        // Find by status and transform entity arrays into response payload vectors
        return auctionRepository.findByStatus(AuctionStatus.ACTIVE).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public AuctionResponseDTO getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction data node query missing match error"));
        return convertToResponseDTO(auction);
    }

    /**
     * Extraction converter mapping complex relational records into flat, readable API models.
     */
    private AuctionResponseDTO convertToResponseDTO(Auction auction) {
        AuctionResponseDTO dto = new AuctionResponseDTO();
        dto.setAuctionId(auction.getId());
        dto.setItemName(auction.getItem().getName());
        dto.setItemDescription(auction.getItem().getDescription());
        dto.setCategory(auction.getItem().getCategory());
        dto.setImageUrl(auction.getItem().getImageUrl());
        dto.setStartPrice(auction.getStartPrice());
        dto.setCurrentHighestBid(auction.getCurrentHighestBid());
        dto.setStartTime(auction.getStartTime());
        dto.setEndTime(auction.getEndTime());
        dto.setStatus(auction.getStatus().name());
        dto.setSellerUsername(auction.getSeller().getUsername());
        return dto;
    }
}