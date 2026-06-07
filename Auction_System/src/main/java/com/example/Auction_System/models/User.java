package com.example.Auction_System.models;
/*
 * @Entity tells Hibernate framework that this class represents a database table row structure.
 * @Table explicitly names our SQL table "users". Avoid using 'user' as it's a reserved keyword in SQL.
 * @Getter / @Setter are Lombok tools that automatically generate methods at compile time.
 * @NoArgsConstructor creates an empty public constructor required by JPA to build objects out of SQL records.
 * @AllArgsConstructor generates a constructor filled with all properties for easy mock testing creation.
 */

import com.example.Auction_System.models.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id // Designates this field as the unique primary key in SQL database
    @GeneratedValue(strategy = GenerationType.IDENTITY)// Database handles auto-incrementing IDs (1, 2, 3...)
    private Long id;

    @Column(unique = true, nullable = false)// Configures SQL constraints: Cannot be blank, cannot be a duplicate
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false) // Map field name using snake_case conventions inside SQL database
    private LocalDateTime createdAt;

    /*
     * @OneToMany configures relationship rules. One seller can list many auctions.
     * mappedBy = "seller" states that the field 'seller' inside the target Auction entity holds the foreign key configuration.
     * cascade = CascadeType.ALL ensures deleting a user account cleanly drops all associated listing data cascades automatically.
     * FetchType.LAZY tells Spring NOT to pull downstream auction logs out of the database until we specifically ask for them (.getAuctions()).
     */
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Auction> auctions;

    @OneToMany(mappedBy = "bidder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Bid> bids;

    @PrePersist // Lifecycle callback hook. Fires automatically right before Hibernate saves a brand new row to SQL
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(); // Saves us from passing the server timestamp manually on creation
    }
}
