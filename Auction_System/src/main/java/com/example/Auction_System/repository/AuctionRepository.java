package com.example.Auction_System.repository;

import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.enums.AuctionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    
    @EntityGraph(attributePaths = {"item", "seller"})
    List<Auction> findByStatus(AuctionStatus status);

    @EntityGraph(attributePaths = {"item", "seller"})
    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime now);

    @EntityGraph(attributePaths = {"item", "seller"})
    List<Auction> findBySellerId(Long sellerId);

    @EntityGraph(attributePaths = {"item", "seller"})
    Optional<Auction> findById(Long id);
}