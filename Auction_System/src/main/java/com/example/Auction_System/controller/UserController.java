package com.example.Auction_System.controller;

import com.example.Auction_System.dto.UserDTO;
import com.example.Auction_System.models.User;
import com.example.Auction_System.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Tells Spring to expose this class as REST endpoints returning raw JSON payload structures
@RequestMapping("/api/users") // Base path routing mapping pattern prefix
@CrossOrigin(origins = "*") // CORS configuration: Permits communication connections from React app ports
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register") // Intercepts HTTP POST transactions targeting path "/api/users/register"
    public ResponseEntity<User> register(@RequestBody User user) { // @RequestBody unmarshalls incoming JSON strings into Java models
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @GetMapping("/{id}") // Path variable token matching notation parameter strategy: "/api/users/5"
    public ResponseEntity<UserDTO> getUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}