package org.server.controllers;

import org.server.dto.BookDTO;
import org.server.enums.genre;
import org.server.model.Book;
import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.util.DBConnection;
import org.server.util.ResponseEntity;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.sql.Array;

@RequestMapping("/api/books")
public class BookController {

    @GetMapping("/all")
    public ResponseEntity<List<BookDTO>> getAllBooks() {
        List<BookDTO> books = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM books");
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                BookDTO book = new BookDTO();

                book.setTitle(rs.getString("title"));
                book.setAuthor(rs.getString("author"));
                book.setLanguage(rs.getString("language"));
                book.setPage_count(rs.getInt("page_count"));

                // Safely parse genres
                Array genreArray = rs.getArray("genres");
                if (genreArray != null) {
                    String[] genresStr = (String[]) genreArray.getArray();
                    genre[] genres = new genre[genresStr.length];
                    for (int i = 0; i < genresStr.length; i++) {
                        genres[i] = genre.valueOf(genresStr[i]);
                    }
                    book.setGenres(genres);
                } else {
                    book.setGenres(new genre[0]); // or null
                }

                books.add(book);
            }

            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(books);

        } catch (SQLException e) {
            System.err.println("SQL error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

}
