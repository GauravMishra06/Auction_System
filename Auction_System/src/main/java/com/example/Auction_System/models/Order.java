package com.example.Auction_System.models;

import com.example.Auction_System.models.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "final_price", nullable = false)
    private BigDecimal finalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private OrderStatus paymentStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn (name = "auction_id", nullable = false)
    private Auction auction;

    /**
     * nullable = true because an auction could close with zero bids,
     * meaning no winner is assigned to the generated order row.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id", nullable = true)
    private User winner;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}