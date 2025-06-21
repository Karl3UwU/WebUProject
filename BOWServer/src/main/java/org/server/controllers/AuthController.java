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

            String token = SessionManager.createSession(email);
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

    @GetMapping("/getReviews")
    public ResponseEntity<String> getReviews(@RequestHeader("Authorization") String authToken) {
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        String userEmail = SessionManager.getUserEmailFromToken(authToken);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        String reviews = AuthService.getReviewsByEmail(userEmail);

        return ResponseEntity.ok()
                .contentType("application/json")
                .body(reviews);
    }

    @GetMapping("/getBookshelf")
    public ResponseEntity<String> getBookshelf(@RequestHeader("Authorization") String authToken) {
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        String userEmail = SessionManager.getUserEmailFromToken(authToken);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        String bookshelf = AuthService.getBookshelfByEmail(userEmail);

        return ResponseEntity.ok()
                .contentType("application/json")
                .body(bookshelf);
    }

    @GetMapping("/deleteReview")
    public ResponseEntity<String> deleteReview(
            @RequestHeader("Authorization") String authToken,
            @RequestParam("bookId") String bookId) {

        if (authToken == null || authToken.trim().isEmpty() || bookId == null || bookId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType("application/json")
                    .body(null);
        }

        String userEmail = SessionManager.getUserEmailFromToken(authToken);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        boolean deleted = AuthService.deleteReviewById(bookId, userEmail);

        return deleted ? ResponseEntity.ok()
                .contentType("application/json")
                .body("{\"message\": \"Review deleted successfully\"}")
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType("application/json")
                .body("{\"message\": \"Failed to delete review\"}");
    }

    @GetMapping("/deleteBookFromShelf")
    public ResponseEntity<String> deleteBookshelf(
            @RequestHeader("Authorization") String authToken,
            @RequestParam("bookId") String bookId) {

        if (authToken == null || authToken.trim().isEmpty() || bookId == null || bookId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType("application/json")
                    .body(null);
        }

        String userEmail = SessionManager.getUserEmailFromToken(authToken);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        boolean deleted = AuthService.deleteBookFromBookshelf(bookId, userEmail);

        return deleted ? ResponseEntity.ok()
                .contentType("application/json")
                .body("{\"message\": \"Book deleted from bookshelf successfully\"}")
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType("application/json")
                .body("{\"message\": \"Failed to delete book from bookshelf\"}");
    }

    @GetMapping("/editBookStatus")
    public ResponseEntity<String> editBookStatus(
            @RequestHeader("Authorization") String authToken,
            @RequestParam("bookId") String bookId,
            @RequestParam("Status") String status) {

        if (authToken == null || authToken.trim().isEmpty() || bookId == null || bookId.trim().isEmpty() || status == null || status.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType("application/json")
                    .body(null);
        }

        String userEmail = SessionManager.getUserEmailFromToken(authToken);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        boolean updated = AuthService.updateBookStatus(bookId, userEmail, status);

        return updated ? ResponseEntity.ok()
                .contentType("application/json")
                .body("{\"message\": \"Book Status updated successfully\"}")
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType("application/json")
                .body("{\"message\": \"Failed to update book Status\"}");
    }

    @GetMapping("/changePassword")
    public ResponseEntity<String> editPassword(
            @RequestHeader("Authorization") String authToken,
            @RequestParam("oldPassword") String oldPassword,
            @RequestParam("newPassword") String newPassword) {

        if (authToken == null || authToken.trim().isEmpty() || oldPassword == null || oldPassword.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType("application/json")
                    .body(null);
        }

        String userEmail = SessionManager.getUserEmailFromToken(authToken);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(null);
        }

        boolean updated = AuthService.changeUserPassword(userEmail, oldPassword, newPassword);

        return updated ? ResponseEntity.ok()
                .contentType("application/json")
                .body("{\"message\": \"Password updated successfully\"}")
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType("application/json")
                .body("{\"message\": \"Failed to update password\"}");
    }
    @GetMapping("/verify-token")
    public ResponseEntity<Boolean> verifyToken(@RequestHeader("Authorization") String authToken) {
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType("application/json")
                    .body(false);
        }

        return ResponseEntity.ok()
                .contentType("application/json")
                .body(SessionManager.isTokenActive(authToken));
    }

    @PostMapping("/logout-user")
    public ResponseEntity<Boolean> logoutUser(@RequestHeader("Authorization") String authToken) {
        SessionManager.invalidateToken(authToken);

        return ResponseEntity.ok()
                .contentType("application/json")
                .body(true);
    }


}
