package com.example.Auction_System;

import com.example.Auction_System.dto.OrderResponseDTO;
import com.example.Auction_System.models.*;
import com.example.Auction_System.models.enums.*;
import com.example.Auction_System.repository.*;
import com.example.Auction_System.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ContextConfiguration(initializers = DotenvContextInitializer.class)
@Transactional
public class PaymentIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BidRepository bidRepository;

    @Test
    public void testPaymentProcessingAndSellerVisibility() {
        // 1. Create and save seller
        User seller = new User();
        seller.setUsername("test_seller_user");
        seller.setEmail("seller@example.com");
        seller.setPassword("password123");
        seller.setRole(Role.ROLE_AUCTIONEER);
        seller = userRepository.save(seller);

        // 2. Create and save bidder
        User bidder = new User();
        bidder.setUsername("test_bidder_user");
        bidder.setEmail("bidder@example.com");
        bidder.setPassword("password123");
        bidder.setRole(Role.ROLE_BIDDER);
        bidder = userRepository.save(bidder);

        // 3. Create and save item
        Item item = new Item();
        item.setName("Collectible Painting");
        item.setDescription("Rare oil painting");
        item.setCategory("Art");

        // 4. Create and save completed auction
        Auction auction = new Auction();
        auction.setItem(item);
        auction.setSeller(seller);
        auction.setStartPrice(new BigDecimal("100.00"));
        auction.setCurrentHighestBid(new BigDecimal("150.00"));
        auction.setStartTime(LocalDateTime.now().minusHours(2));
        auction.setEndTime(LocalDateTime.now().minusHours(1));
        auction.setStatus(AuctionStatus.COMPLETED);
        auction = auctionRepository.save(auction);

        // 5. Create and save winning bid
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setBidAmount(new BigDecimal("150.00"));
        bid = bidRepository.save(bid);

        // 6. Create and save pending order
        Order order = new Order();
        order.setAuction(auction);
        order.setWinner(bidder);
        order.setFinalPrice(new BigDecimal("150.00"));
        order.setPaymentStatus(OrderStatus.PENDING);
        order = orderRepository.save(order);
        final Long orderId = order.getId();

        // Set Security Context Authentication as the winning bidder
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("test_bidder_user", null, Collections.emptyList())
        );

        // 7. Pay order using OrderService
        OrderResponseDTO paidOrderResponse = orderService.payOrder(orderId);

        // Verify status is updated to PAID
        assertEquals("PAID", paidOrderResponse.getPaymentStatus());
        assertEquals("test_bidder_user", paidOrderResponse.getWinnerUsername());
        assertEquals("test_seller_user", paidOrderResponse.getSellerUsername());

        // 8. Retrieve orders as the seller and verify the PAID order is visible
        List<OrderResponseDTO> sellerOrders = orderService.getOrdersBySellerUsername("test_seller_user");
        assertNotNull(sellerOrders);
        assertFalse(sellerOrders.isEmpty());
        
        OrderResponseDTO sellerOrder = sellerOrders.stream()
                .filter(o -> o.getOrderId().equals(orderId))
                .findFirst()
                .orElse(null);
                
        assertNotNull(sellerOrder);
        assertEquals("PAID", sellerOrder.getPaymentStatus());
    }
}
