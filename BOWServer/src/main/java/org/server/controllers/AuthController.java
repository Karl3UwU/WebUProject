package org.server.controllers;

import com.google.gson.Gson;
import org.server.dto.LoginDTO;
import org.server.dto.UserInfoDTO;
import org.server.dto.UserRegisterDTO;
import org.server.enums.HttpStatus;
import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.PostMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.QueryParam;
import org.server.router.annotations.request.RequestBody;
import org.server.router.annotations.request.RequestHeader;
import org.server.router.annotations.request.RequestParam;
import org.server.service.AuthService;
import org.server.session.SessionManager;
import org.server.util.DBConnection;
import org.server.session.JWTUtil;
import org.server.util.PasswordUtil;
import org.server.util.ResponseEntity;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Objects;

@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<LoginDTO> sendLoginRequest(
            @RequestParam("email") String email,
            @RequestParam("password") String password) {

        // Input validation
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest(null);
        }

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement("SELECT password FROM users WHERE email = ?")) {

            statement.setString(1, email.trim());
            ResultSet resultSet = statement.executeQuery();

            String dbPassword = resultSet.next() ? resultSet.getString("password") : null;

            if (dbPassword == null || !Objects.equals(dbPassword, PasswordUtil.encryptPassword(email + password))) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .contentType("application/json")
                        .body(null);
            }

            String token = JWTUtil.createToken(email);
            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(new LoginDTO(token));

        } catch (SQLException e) {
            System.err.println("Database error during login: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType("application/json")
                    .body(null);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserRegisterDTO userRegisterDTO) {
        String result = AuthService.registerUser(userRegisterDTO);

        return ResponseEntity.status(result != null ? HttpStatus.CREATED : HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType("application/json")
                .body(result);
    }

    @PostMapping("/confirm-user")
    public ResponseEntity<String> confirmUser(
            @QueryParam("sessionId") String sessionId,
            @QueryParam("verificationCode") String verificationCode
    ) {
        String result = AuthService.verifyEmail(sessionId, verificationCode);

        return ResponseEntity.status(result != null ? HttpStatus.CREATED : HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType("application/json")
                .body(result);
    }

    @GetMapping("/getUser")
    public ResponseEntity<UserInfoDTO> getUser(@RequestHeader("Authorization") String authToken) {
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }
        String userEmail = SessionManager.getUserEmailFromToken(authToken);
        if( userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        UserInfoDTO userInfo = AuthService.getUserDataByEmail(userEmail);

        return ResponseEntity.ok()
                .contentType("application/json")
                .body(userInfo);
    }
}
