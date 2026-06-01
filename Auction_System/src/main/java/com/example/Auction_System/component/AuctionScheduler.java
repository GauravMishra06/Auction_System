package com.example.Auction_System.component;

import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component // Registers this utility tool class as a generic Spring-managed component bean
public class AuctionScheduler {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private OrderService orderService;

    /**
     * Automated task cycle background worker execution thread.
     * fixedRate = 60000 tells Spring to run this method every 60,000 milliseconds (1 minute).
     */
    @Scheduled(fixedRate = 60000)
    public void checkAndCloseExpiredAuctions() {
        // Query database for listings whose timers have run out but are still marked ACTIVE
        List<Auction> expiredAuctions = auctionRepository.findByStatusAndEndTimeBefore(
                AuctionStatus.ACTIVE,
                LocalDateTime.now()
        );

        for (Auction auction : expiredAuctions) {
            try {
                // Pass control to the service layer to update status and calculate the winner
                orderService.createOrderForCompletedAuction(auction.getId());
            } catch (Exception e) {
                // Catches errors to ensure a single corrupted record won't halt the rest of the scheduler cycle
                System.err.println("Scheduler Error closing auction entry: " + auction.getId() + " -> " + e.getMessage());
            }
        }
    }
}