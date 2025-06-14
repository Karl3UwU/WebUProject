package org.server.dto;

public class LoginDTO {
    private String authToken;

    public LoginDTO(String authToken) {
        this.authToken = authToken;
    }

    public String getAuthToken() {
        return authToken;
    }
}
