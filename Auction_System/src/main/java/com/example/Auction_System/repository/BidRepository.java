package com.example.Auction_System.repository;

import com.example.Auction_System.models.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    /**
     * Pulls the history log for an item with the highest price displayed at the top.
     * SQL: "SELECT * FROM bids WHERE auction_id = ? ORDER BY bid_amount DESC"
     */
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);
    List<Bid> findByBidderId(Long bidderId);
}