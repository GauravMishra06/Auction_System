package com.example.Auction_System.service;

import com.example.Auction_System.dto.OrderResponseDTO;
import com.example.Auction_System.exception.BusinessRuleException;
import com.example.Auction_System.exception.ResourceNotFoundException;
import com.example.Auction_System.exception.AuthorizationException;
import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.Bid;
import com.example.Auction_System.models.Order;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.models.enums.OrderStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.repository.BidRepository;
import com.example.Auction_System.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;

    public OrderService(OrderRepository orderRepository, AuctionRepository auctionRepository,
                        BidRepository bidRepository) {
        this.orderRepository = orderRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
    }

    /**
     * Core fulfillment logic to process the closeout of an active auction window.
     */
    @Transactional
    public OrderResponseDTO createOrderForCompletedAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + auctionId));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new BusinessRuleException("Cannot close an auction that is not active.");
        }

        // Change status to prevent users from trying to place final bids during calculation
        auction.setStatus(AuctionStatus.COMPLETED);
        auctionRepository.save(auction);

        // Pull listing history arrays to isolate the winning entry
        List<Bid> bids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId);

        Order order = new Order();
        order.setAuction(auction);

        if (bids.isEmpty()) {
            // No bids were placed on the item before expiration
            order.setWinner(null);
            order.setFinalPrice(auction.getStartPrice());
            order.setPaymentStatus(OrderStatus.FAILED);
            log.info("Auction #{} closed with no bids", auctionId);
        } else {
            // Highest bid is at index 0 (ordered by bid_amount DESC)
            Bid winningBid = bids.get(0);
            order.setWinner(winningBid.getBidder());
            order.setFinalPrice(winningBid.getBidAmount());
            order.setPaymentStatus(OrderStatus.PENDING);
            log.info("Auction #{} won by '{}' for ${}", auctionId, winningBid.getBidder().getUsername(), winningBid.getBidAmount());
        }

        Order savedOrder = orderRepository.save(order);
        return convertToOrderDTO(savedOrder);
    }

    /**
     * Lookup an invoice record by its primary key ID.
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        return convertToOrderDTO(order);
    }

    /**
     * Find a settled invoice linked directly to a target auction.
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByAuctionId(Long auctionId) {
        Order order = orderRepository.findByAuctionId(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("No order found for Auction ID: " + auctionId));
        return convertToOrderDTO(order);
    }

    /**
     * Compiles all orders won by a specific user.
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByWinnerUsername(String username) {
        List<Order> orders = orderRepository.findByWinnerUsername(username);
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersBySellerUsername(String username) {
        List<Order> orders = orderRepository.findByAuctionSellerUsername(username);
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDTO payOrder(Long id) {
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        if (order.getWinner() == null || !order.getWinner().getUsername().equals(currentUsername)) {
            throw new AuthorizationException("You are not authorized to pay for this order.");
        }

        if (order.getPaymentStatus() != OrderStatus.PENDING) {
            throw new BusinessRuleException("Only pending orders can be paid. Current status: " + order.getPaymentStatus());
        }

        order.setPaymentStatus(OrderStatus.PAID);
        Order saved = orderRepository.save(order);
        log.info("Order #{} paid successfully by winner '{}'", id, currentUsername);
        return convertToOrderDTO(saved);
    }

    /**
     * Shared private conversion utility mapping Order entity to outbound DTO.
     */
    private OrderResponseDTO convertToOrderDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getId());
        dto.setAuctionId(order.getAuction().getId());
        dto.setItemName(order.getAuction().getItem().getName());
        dto.setFinalPrice(order.getFinalPrice());
        dto.setWinnerUsername(order.getWinner() != null ? order.getWinner().getUsername() : "NO BIDS");
        dto.setSellerUsername(order.getAuction().getSeller() != null ? order.getAuction().getSeller().getUsername() : null);
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
}