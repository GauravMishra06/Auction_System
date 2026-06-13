package com.example.Auction_System.service;

import com.example.Auction_System.dto.AuctionRequestDTO;
import com.example.Auction_System.dto.AuctionResponseDTO;
import com.example.Auction_System.exception.AuthorizationException;
import com.example.Auction_System.exception.BusinessRuleException;
import com.example.Auction_System.exception.ResourceNotFoundException;
import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.Item;
import com.example.Auction_System.models.User;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    private static final Logger log = LoggerFactory.getLogger(AuctionService.class);

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    public AuctionService(AuctionRepository auctionRepository, UserRepository userRepository) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
    }

    /**
     * @Transactional protects transaction integrity. If saving the auction record errors out midway,
     * the item entry rolls back automatically so you don't end up with broken/orphaned rows in SQL.
     */
    @Transactional
    public AuctionResponseDTO createAuction(AuctionRequestDTO request) {
        // Extract seller identity from JWT token — never trust client-provided IDs
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + currentUsername));

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
        log.info("Auction #{} created by user '{}'", savedAuction.getId(), currentUsername);
        return convertToResponseDTO(savedAuction);
    }

    @Transactional(readOnly = true)
    public List<AuctionResponseDTO> getActiveAuctions() {
        // Find by status and transform entity arrays into response payload vectors
        return auctionRepository.findByStatus(AuctionStatus.ACTIVE).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuctionResponseDTO> getCompletedAuctions() {
        return auctionRepository.findByStatus(AuctionStatus.COMPLETED).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuctionResponseDTO> searchActiveAuctions(String auctionId, String auctionTitle, String startDate, String endDate, String sortBy) {
        String trimmedAuctionId = auctionId == null ? "" : auctionId.trim();
        String trimmedAuctionTitle = auctionTitle == null ? "" : auctionTitle.trim().toLowerCase(Locale.ROOT);
        String trimmedSortBy = sortBy == null ? "publishDate" : sortBy.trim();

        java.time.LocalDate startLocalDate = null;
        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                startLocalDate = java.time.LocalDate.parse(startDate.trim());
            } catch (Exception e) {
                log.warn("Invalid start date format: {}", startDate);
            }
        }

        java.time.LocalDate endLocalDate = null;
        if (endDate != null && !endDate.trim().isEmpty()) {
            try {
                endLocalDate = java.time.LocalDate.parse(endDate.trim());
            } catch (Exception e) {
                log.warn("Invalid end date format: {}", endDate);
            }
        }

        final java.time.LocalDate finalStart = startLocalDate;
        final java.time.LocalDate finalEnd = endLocalDate;

        return getActiveAuctions().stream()
                .filter(dto -> trimmedAuctionId.isEmpty() || dto.getAuctionId().toString().contains(trimmedAuctionId))
                .filter(dto -> trimmedAuctionTitle.isEmpty() || (dto.getItemName() != null && dto.getItemName().toLowerCase(Locale.ROOT).contains(trimmedAuctionTitle)))
                .filter(dto -> finalStart == null || dto.getStartTime() == null || !dto.getStartTime().toLocalDate().isBefore(finalStart))
                .filter(dto -> finalEnd == null || dto.getEndTime() == null || !dto.getEndTime().toLocalDate().isAfter(finalEnd))
                .sorted(createAuctionComparator(trimmedSortBy))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuctionResponseDTO getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + id));
        return convertToResponseDTO(auction);
    }

    @Transactional
    public AuctionResponseDTO cancelAuction(Long id) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + id));

        // Only the seller or an admin can cancel
        boolean isOwner = auction.getSeller().getUsername().equals(currentUsername);
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new AuthorizationException("You do not have permission to cancel this auction.");
        }

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new BusinessRuleException("Only active auctions can be cancelled.");
        }

        auction.setStatus(AuctionStatus.CANCELLED);
        Auction saved = auctionRepository.save(auction);
        log.info("Auction #{} cancelled by user '{}'", id, currentUsername);
        return convertToResponseDTO(saved);
    }

    /**
     * Returns all auctions created by a specific seller (by username).
     */
    @Transactional(readOnly = true)
    public List<AuctionResponseDTO> getAuctionsBySeller(String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + username));
        return auctionRepository.findBySellerId(seller.getId()).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
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
        dto.setBidCount(auction.getBids() != null ? auction.getBids().size() : 0);
        return dto;
    }

    private Comparator<AuctionResponseDTO> createAuctionComparator(String sortBy) {
        if ("auctionId".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(AuctionResponseDTO::getAuctionId);
        }
        return Comparator.comparing(AuctionResponseDTO::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed();
    }
}