package com.example.Auction_System.repository;

import com.example.Auction_System.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/*
 * @Repository registers this interface as a data access layer bean.
 * Extending JpaRepository provides out-of-the-box SQL operations (.save(), .findById()).
 */

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Query Methods: Spring dynamically creates native SQL commands out of your method names.
     * This translates to: "SELECT * FROM users WHERE username = ?"
     * Optional prevents NullPointerException crashes if a username doesn't exist.
     */
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // Translates to: "SELECT COUNT(*) > 0 FROM users WHERE email = ?"
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}