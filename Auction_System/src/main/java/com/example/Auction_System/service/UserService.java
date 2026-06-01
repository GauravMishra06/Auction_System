package com.example.Auction_System.service;

import com.example.Auction_System.dto.UserDTO;
import com.example.Auction_System.models.User;
import com.example.Auction_System.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @Service registers this class as the home for core business logic operations.
 */
@Service
public class UserService {

    @Autowired // Auto-injects our UserRepository bean dependency
    private UserRepository userRepository;

    public User registerUser(User user) {
        // Enforce business rules before updating the database
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        return userRepository.save(user);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Map entity fields directly over to a clean user view container object
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }
}