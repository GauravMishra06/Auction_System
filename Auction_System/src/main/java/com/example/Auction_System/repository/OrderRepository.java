package com.example.Auction_System.repository;

import com.example.Auction_System.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Finds the settled invoice summary linked directly to a target auction tracker.
     * Maps to: orderRepository.findByAuctionId(auctionId)
     */
    Optional<Order> findByAuctionId(Long auctionId);

    /**
     * Traverses the 'winner' relationship property to filter by the associated User's username string.
     * Maps to: orderRepository.findByWinnerUsername(username)
     */
    List<Order> findByWinnerUsername(String username);
}