package com.example.Auction_System.dto;

import lombok.Data;

/*
 * @Data is a convenience annotation that bundles @Getter, @Setter,
 * @ToString, and constructors into one single command.
 */
@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
}