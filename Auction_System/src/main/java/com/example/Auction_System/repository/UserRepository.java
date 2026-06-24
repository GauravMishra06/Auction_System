package com.example.Auction_System.repository;

import com.example.Auction_System.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;



@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}