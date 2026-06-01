package com.example.Auction_System.repository;

import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.enums.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByStatus(AuctionStatus status);

    /**
     * Used by the background scheduler to fetch auctions whose end time has passed
     * but are still marked as active.
     * SQL: "SELECT * FROM auctions WHERE status = ? AND end_time < ?"
     */
    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime now);
}