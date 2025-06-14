package org.server.dto;

import org.server.enums.UserRole;

public class UserInfoDTO {
    String username;
    String firstName;
    String lastName;
    String email;
    UserRole role;

    public UserInfoDTO(String username, String firstName, String lastName, String email, UserRole role) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }
}
