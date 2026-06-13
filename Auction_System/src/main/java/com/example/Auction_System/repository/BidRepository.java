package com.example.Auction_System.repository;

import com.example.Auction_System.models.Bid;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    @EntityGraph(attributePaths = {"bidder", "auction"})
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);

    @EntityGraph(attributePaths = {"bidder", "auction"})
    List<Bid> findByBidderId(Long bidderId);
}