package org.server.service;

import org.server.dto.ReviewDTO;
import org.server.enums.genre;
import org.server.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReviewsService {
    public static List<ReviewDTO> getAllReviews() throws SQLException {
        List<ReviewDTO> reviews = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT " +
                     "users.username, books.title, reviews.content, reviews.rating FROM " +
                     "reviews JOIN users on reviews.user_id = users.id " +
                     "JOIN books on reviews.book_id = books.id");
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                ReviewDTO review = new ReviewDTO();

                review.setUsername(rs.getString("username"));
                review.setTitle(rs.getString("title"));
                review.setContent(rs.getString("content"));
                review.setRating(rs.getInt("rating"));

                reviews.add(review);
            }
        }

        return reviews;
    }

    public static List<ReviewDTO> getFilteredReviews(String bookTitle, String username) throws SQLException {
        List<ReviewDTO> reviews = getAllReviews();

        return reviews.stream()
                .filter(review -> bookTitle == null || review.getTitle().toLowerCase().contains(bookTitle.toLowerCase()))
                .filter(review -> username == null || review.getUsername().toLowerCase().contains(username.toLowerCase()))
                .toList();

    }
}
