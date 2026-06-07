package com.example.Auction_System.component;

import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.enums.AuctionStatus;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.service.OrderService;
import com.example.Auction_System.service.PasswordResetService;
import com.example.Auction_System.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionScheduler.class);

    private final AuctionRepository auctionRepository;
    private final OrderService orderService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;

    public AuctionScheduler(AuctionRepository auctionRepository, OrderService orderService,
                            RefreshTokenService refreshTokenService, PasswordResetService passwordResetService) {
        this.auctionRepository = auctionRepository;
        this.orderService = orderService;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
    }

    /**
     * Checks and closes expired auctions every 60 seconds.
     */
    @Scheduled(fixedRate = 60000)
    public void checkAndCloseExpiredAuctions() {
        List<Auction> expiredAuctions = auctionRepository.findByStatusAndEndTimeBefore(
                AuctionStatus.ACTIVE,
                LocalDateTime.now()
        );

        for (Auction auction : expiredAuctions) {
            try {
                orderService.createOrderForCompletedAuction(auction.getId());
            } catch (Exception e) {
                log.error("Error closing auction #{}: {}", auction.getId(), e.getMessage());
            }
        }

        if (!expiredAuctions.isEmpty()) {
            log.info("Closed {} expired auction(s)", expiredAuctions.size());
        }
    }

    /**
     * Purges expired/used refresh tokens and password reset tokens every hour
     * to prevent unbounded database table growth.
     */
    @Scheduled(fixedRate = 3600000)
    public void purgeExpiredTokens() {
        try {
            int refreshPurged = refreshTokenService.purgeExpiredTokens();
            int resetPurged = passwordResetService.purgeExpiredTokens();
            if (refreshPurged > 0 || resetPurged > 0) {
                log.info("Token cleanup: purged {} refresh tokens, {} password reset tokens", refreshPurged, resetPurged);
            }
        } catch (Exception e) {
            log.error("Error during token cleanup: {}", e.getMessage());
        }
    }
}