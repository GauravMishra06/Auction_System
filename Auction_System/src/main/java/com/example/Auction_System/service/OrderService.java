package com.example.Auction_System.service;

import com.example.Auction_System.dto.OrderResponseDTO;
import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.Bid;
import com.example.Auction_System.models.Order;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.models.enums.OrderStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.repository.BidRepository;
import com.example.Auction_System.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    /**
     * core fulfillment logic to process the closeout of an active auction window.
     */
    @Transactional
    public OrderResponseDTO createOrderForCompletedAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Fulfillment error: Target auction record extraction error"));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Validation Error: Cannot execute closure processes on an inactive auction instance");
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
        } else {
            // Isolate index element position 0 (Highest bid extracted from repository ordering parameter configurations)
            Bid winningBid = bids.get(0);
            order.setWinner(winningBid.getBidder());
            order.setFinalPrice(winningBid.getBidAmount());
            order.setPaymentStatus(OrderStatus.PENDING); // Order logged successfully, waiting for checkout completion
        }

        Order savedOrder = orderRepository.save(order);
        return convertToOrderDTO(savedOrder);
    }

    /**
     * Lookup an invoice record by its primary key ID.
     * Maps directly to GET /api/orders/{id}
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order fetch failure: Order reference entry not found for ID: " + id));
        return convertToOrderDTO(order);
    }

    /**
     * Find a settled invoice statement linked directly to a target auction tracker.
     * Maps directly to GET /api/orders/auction/{auctionId}
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByAuctionId(Long auctionId) {
        Order order = orderRepository.findByAuctionId(auctionId)
                .orElseThrow(() -> new RuntimeException("Order fetch failure: No historical settlement found for Auction ID: " + auctionId));
        return convertToOrderDTO(order);
    }

    /**
     * Compiles all billing receipts generated under a specific user account's handle.
     * Maps directly to GET /api/orders/winner/{username}
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByWinnerUsername(String username) {
        List<Order> orders = orderRepository.findByWinnerUsername(username);
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }

    /**
     * Shared private conversion utility mapping Order entity rows cleanly to outbound DTO objects.
     */
    private OrderResponseDTO convertToOrderDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getId());
        dto.setAuctionId(order.getAuction().getId());
        dto.setItemName(order.getAuction().getItem().getName());
        dto.setFinalPrice(order.getFinalPrice());
        dto.setWinnerUsername(order.getWinner() != null ? order.getWinner().getUsername() : "NO PARTICIPANT BIDS");
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
}