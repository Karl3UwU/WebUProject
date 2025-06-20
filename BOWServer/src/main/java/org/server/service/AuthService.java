package org.server.service;

import com.google.gson.Gson;
import org.server.dto.LoginDTO;
import org.server.dto.PendingUserDTO;
import org.server.dto.UserInfoDTO;
import org.server.dto.UserRegisterDTO;
import org.server.enums.HttpStatus;
import org.server.enums.Status;
import org.server.enums.UserRole;
import org.server.enums.genre;
import org.server.model.User;
import org.server.session.JWTUtil;
import org.server.util.DBConnection;
import org.server.util.PasswordUtil;
import org.server.util.ResponseEntity;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class AuthService {

    private static final Map<String, PendingUserDTO> pendingUsers = new ConcurrentHashMap<>();

    private static final Gson gson = new Gson();

    public static String registerUser(UserRegisterDTO registerDTO) {
        String username = registerDTO.getUsername();
        String firstName = registerDTO.getFirstName();
        String lastName = registerDTO.getLastName();
        String email = registerDTO.getEmail();
        String password = PasswordUtil.encryptPassword(UserRegisterDTOToPassword(registerDTO));

        if (username == null || username.trim().isEmpty()) {
            String response = "err:";
            response += "Username is required";
            return response;
        }

        if (email == null) {
            String response = "err:";
            response += "Valid email is required";
            return response;
        }

        if (isUsernameOrEmailTaken(username, email)) {
            String response = "err:";
            response += "Username or email already exists";
            return response;
        }

//        if (isEmailPendingVerification(email)) {
//            response.put("success", false);
//            response.put("message", "Email verification already pending. Please check your email or try again later.");
//            return ResponseEntity.badRequest().body(response);
//        }

        String verificationCode = generateVerificationCode();
        String sessionId = generateSessionId();

        PendingUserDTO pendingUser = new PendingUserDTO();
        pendingUser.setExpiresAt(System.currentTimeMillis() + (15 * 60 * 1000));
        pendingUser.setVerificationCode(verificationCode);
        pendingUser.setUsername(username);
        pendingUser.setEmail(email);
        pendingUser.setPassword(password);
        pendingUser.setFirstName(firstName);
        pendingUser.setLastName(lastName);

        pendingUsers.put(sessionId, pendingUser);

        boolean emailSent = sendVerificationEmail(email, verificationCode);

        if(!emailSent) {
            pendingUsers.remove(sessionId);
            String response = "err:";
            response += "Failed to send verification email";
            return response;
        }

        return sessionId;
    }

    public static String verifyEmail(String sessionId, String verificationCode) {
        if(sessionId == null || verificationCode == null) {
            String response = "err:";
            response += "Issue with verification code";
            return response;
        }

        PendingUserDTO pendingUser = pendingUsers.get(sessionId);

        if(pendingUser == null) {
            String response = "err:";
            response += "Registration session not found or expired";
            return response;
        }

        if (!verificationCode.equals(pendingUser.getVerificationCode())) {
            String response = "err:";
            response += "Invalid verification code";
            return response;
        }

        if (isUsernameOrEmailTaken(pendingUser.getUsername(), pendingUser.getEmail())) {
            String response = "err:";
            response += "Username or email was taken by another user, please register again";
            return response;
        }

        Boolean confirmUser = confirmRegisterUser(pendingUser);

        if(!confirmUser) {
            String response = "err:";
            response += "Error creating user in platform";
            return response;
        }

        return "confirm";
    }

    public static Boolean confirmRegisterUser(PendingUserDTO registerDTO) {
        try(Connection conn = DBConnection.getConnection()) {
            String sql = "INSERT INTO users (role, username, first_name, last_name, email, password) VALUES (?::user_role, ?, ?, ?, ?, ?)";
            PreparedStatement statement = conn.prepareStatement(sql);

            statement.setString(1, UserRole.BASIC.getValue());
            statement.setString(2, registerDTO.getUsername());
            statement.setString(3, registerDTO.getFirstName());
            statement.setString(4, registerDTO.getLastName());
            statement.setString(5, registerDTO.getEmail());
            statement.setString(6, registerDTO.getPassword());

            int rowsAffected = statement.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private static boolean isUsernameOrEmailTaken(String username, String email) {
        try(Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT COUNT(*) FROM users WHERE username = ? OR email = ?";
            PreparedStatement statement = conn.prepareStatement(sql);

            statement.setString(1, username);
            statement.setString(2, email);
            ResultSet rs = statement.executeQuery();
            rs.next();
            return rs.getInt(1) > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static UserInfoDTO getUserDataByEmail(String email) {
        try(Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT role, username, first_name, last_name, email FROM users WHERE email = ?";
            PreparedStatement statement = conn.prepareStatement(sql);

            statement.setString(1, email);

            ResultSet rs = statement.executeQuery();
            if(!rs.next()) {
                return null;
            }

            UserInfoDTO userInfo = new UserInfoDTO();
            userInfo.setUsername(rs.getString("username"));
            userInfo.setFirstName(rs.getString("first_name"));
            userInfo.setLastName(rs.getString("last_name"));
            userInfo.setEmail(rs.getString("email"));
            userInfo.setRole(UserRole.valueOf(rs.getString("role")));

            return userInfo;

        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }

    private static String generateSessionId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private static boolean sendVerificationEmail(String email, String verificationCode) {
        try {
            Map<String, String> emailData = new HashMap<>();
            emailData.put("receiver", email);
            emailData.put("subject", "Verify Your Account");
            emailData.put("message", "Your verification code is: " + verificationCode + "\n\nThis code will expire in 15 minutes.");

            String jsonPayload = gson.toJson(emailData);

            // Send HTTP POST request to email service
            URL url = new URL("http://localhost:9999/send-email");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            return responseCode >= 200 && responseCode < 300;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static String UserRegisterDTOToPassword (UserRegisterDTO registerDTO) {
        return registerDTO.getEmail() + registerDTO.getPassword();
    }

    public static String getReviewsByEmail(String userEmail) {
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT r.content, r.rating, u.username, b.title, b.id " +
                         "FROM reviews r JOIN users u ON r.user_id = u.id " +
                         "JOIN books b ON r.book_id = b.id " +
                         "WHERE u.email = ?";
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, userEmail);

            ResultSet rs = statement.executeQuery();
            List<Map<String, Object>> reviews = new ArrayList<>();

            while(rs.next()) {
                Map<String, Object> review = new HashMap<>();
                review.put("content", rs.getString("content"));
                review.put("rating", rs.getInt("rating"));
                review.put("username", rs.getString("username"));
                review.put("bookTitle", rs.getString("title"));
                review.put("bookId", rs.getString("id"));
                reviews.add(review);
            }

            return gson.toJson(reviews);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String getBookshelfByEmail(String userEmail) {
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT b.title, b.author, bs.status, bs.book_id " +
                         "FROM bookshelf bs JOIN users u ON bs.user_id = u.id " +
                         "JOIN books b ON bs.book_id = b.id " +
                         "WHERE u.email = ?";
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, userEmail);

            ResultSet rs = statement.executeQuery();
            List<Map<String, Object>> bookshelf = new ArrayList<>();

            while(rs.next()) {
                Map<String, Object> bookInfo = new HashMap<>();
                bookInfo.put("title",rs.getString("title"));
                bookInfo.put("author",rs.getString("author"));
                bookInfo.put("Status",rs.getString("Status"));
                bookInfo.put("bookId", rs.getInt("book_id"));
                bookshelf.add(bookInfo);
            }

            return gson.toJson(bookshelf);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static boolean deleteReviewById(String bookId, String userEmail) {
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "DELETE FROM reviews WHERE book_id = ? AND user_id = (SELECT id FROM users WHERE email = ?)";
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setInt(1, Integer.parseInt(bookId)); // Parse to int
            statement.setString(2, userEmail);

            int rowsAffected = statement.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean deleteBookFromBookshelf(String bookId, String userEmail) {
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "DELETE FROM bookshelf WHERE book_id = ? AND user_id = (SELECT id FROM users WHERE email = ?)";
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setInt(1, Integer.parseInt(bookId)); // Parse to int
            statement.setString(2, userEmail);

            int rowsAffected = statement.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean updateBookStatus(String bookId, String userEmail, String status) {
        try {
            // Validate Status
            if (!Status.isValid(status)) {
                System.out.println("Invalid Status: " + status);
                return false;
            }

            String normalizedStatus = Status.normalize(status); // e.g., "completed" → "Completed"

            try (Connection conn = DBConnection.getConnection()) {
                String sql = "UPDATE bookshelf SET status = ?::book_status WHERE book_id = ? AND user_id = (SELECT id FROM users WHERE email = ?)";
                PreparedStatement statement = conn.prepareStatement(sql);
                statement.setString(1, normalizedStatus);
                statement.setInt(2, Integer.parseInt(bookId));
                statement.setString(3, userEmail);

                int rowsAffected = statement.executeUpdate();
                return rowsAffected > 0;
            }
        } catch (IllegalArgumentException e) {
            System.out.println("Failed to normalize Status: " + e.getMessage());
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private UserInfoDTO userModelToDTO(User user) {
        return new UserInfoDTO(
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
