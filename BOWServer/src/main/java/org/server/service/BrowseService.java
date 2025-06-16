package org.server.service;

import org.server.dto.BookDTO;
import org.server.dto.BookFilterDTO;
import org.server.enums.genre;
import org.server.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BrowseService {

    public List<BookDTO> getAllBooks() throws SQLException {
        List<BookDTO> books = new ArrayList<>();

        String sql = """
        SELECT b.*, COALESCE(AVG(r.rating), 0) as avg_rating
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        GROUP BY b.id
    """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                BookDTO book = new BookDTO();

                book.setTitle(rs.getString("title"));
                book.setAuthor(rs.getString("author"));
                book.setLanguage(rs.getString("language"));
                book.setPage_count(rs.getInt("page_count"));
                book.setRating(rs.getDouble("avg_rating"));

                Array genreArray = rs.getArray("genres");
                if (genreArray != null) {
                    String[] genresStr = (String[]) genreArray.getArray();
                    genre[] genres = new genre[genresStr.length];
                    for (int i = 0; i < genresStr.length; i++) {
                        genres[i] = genre.valueOf(genresStr[i]);
                    }
                    book.setGenres(genres);
                } else {
                    book.setGenres(new genre[0]);
                }

                books.add(book);
            }
        }

        return books;
    }

    public List<BookDTO> getFilteredBooks(BookFilterDTO filter) throws SQLException {
        List<BookDTO> books = getAllBooks(); // Reuse existing logic
        return books.stream()
                .filter(book -> filter.getTitle() == null || book.getTitle().toLowerCase().contains(filter.getTitle().toLowerCase()))
                .filter(book -> filter.getAuthor() == null || book.getAuthor().toLowerCase().contains(filter.getAuthor().toLowerCase()))
                .filter(book -> filter.getLanguage() == null || book.getLanguage().equalsIgnoreCase(filter.getLanguage()))
                .filter(book -> filter.getMinRating() == null || book.getRating() >= filter.getMinRating())
                .toList();
    }


}
