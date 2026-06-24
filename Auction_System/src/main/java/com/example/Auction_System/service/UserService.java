package com.example.Auction_System.service;

import com.example.Auction_System.dto.UserDTO;
import com.example.Auction_System.exception.BusinessRuleException;
import com.example.Auction_System.exception.ResourceNotFoundException;
import com.example.Auction_System.models.Auction;
import com.example.Auction_System.models.Order;
import com.example.Auction_System.models.User;
import com.example.Auction_System.repository.AuctionRepository;
import com.example.Auction_System.repository.OrderRepository;
import com.example.Auction_System.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;
    private final AuctionRepository auctionRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       OrderRepository orderRepository, AuctionRepository auctionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.orderRepository = orderRepository;
        this.auctionRepository = auctionRepository;
    }

    public UserDTO registerUser(User user) {
        
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new BusinessRuleException("Username is already taken.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BusinessRuleException("Email is already in use.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return convertToDTO(user);
    }

    public java.util.List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        // Safely delete any orders connected to this user's auctions first
        List<Auction> sellerAuctions = auctionRepository.findBySellerId(id);
        for (Auction auction : sellerAuctions) {
            orderRepository.findByAuctionId(auction.getId()).ifPresent(orderRepository::delete);
        }

        // Safely delete any orders this user has won
        List<Order> wonOrders = orderRepository.findByWinnerUsername(user.getUsername());
        orderRepository.deleteAll(wonOrders);

        // Now JPA can safely cascade to auctions, bids, and items without hitting Order FK issues
        userRepository.delete(user);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }
}