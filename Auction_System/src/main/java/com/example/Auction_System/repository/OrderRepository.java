package com.example.Auction_System.repository;

import com.example.Auction_System.models.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"auction", "auction.item", "winner"})
    Optional<Order> findById(Long id);

    
    @EntityGraph(attributePaths = {"auction", "auction.item", "winner"})
    Optional<Order> findByAuctionId(Long auctionId);

    
    @EntityGraph(attributePaths = {"auction", "auction.item", "winner"})
    List<Order> findByWinnerUsername(String username);

    @EntityGraph(attributePaths = {"auction", "auction.item", "winner"})
    List<Order> findByAuctionSellerUsername(String username);
}