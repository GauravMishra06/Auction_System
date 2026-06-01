package com.example.Auction_System.models;

import com.example.Auction_System.models.enums.AuctionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "auctions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Always specify BigDecimal for currency tracking computations.
     * Using double or float will introduce rounding inaccuracies due to binary calculations.
     */
    @Column(name = "start_price", nullable = false)
    private BigDecimal startPrice;

    @Column(name = "current_highest_bid")
    private BigDecimal currentHighestBid;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status;

    /**
     * @ManyToOne states multiple auctions map back to one owner seller user.
     * @JoinColumn sets up the foreign key name column label ('seller_id') inside the auctions table.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    /**
     * @OneToOne owner configuration side. CascadeType.ALL implies creating an auction listing automatically
     * processes raw Item entity record saving simultaneously.
     */
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "item_id", referencedColumnName = "id", nullable = false)
    private Item item;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Bid> bids;
}