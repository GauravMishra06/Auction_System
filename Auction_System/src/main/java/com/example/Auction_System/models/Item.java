package com.example.Auction_System.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT") // Allows for detailed item descriptions exceeding standard VARCHAR 255 character limits
    private String description;

    private String category;

    @Column(name = "image_url")
    private String imageUrl;

    /**
     * @OneToOne bidirectional mapping inverse side representation linked to target owner node.
     */
    @OneToOne(mappedBy = "item")
    private Auction auction;
}