package com.example.Auction_System.repository;

import com.example.Auction_System.models.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByCategory(String category);
    List<Item> findByNameContainingIgnoreCase(String keyword); // Simple case-insensitive search engine support
}