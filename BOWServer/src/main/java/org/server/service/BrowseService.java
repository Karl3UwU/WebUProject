package org.server.service;

import org.server.dto.BookDTO;
import org.server.dto.BookFilterDTO;
import org.server.enums.genre;
import org.server.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
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

                book.setId(rs.getInt("id"));
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
                .filter(book -> filter.getGenre() == null || book.getGenres() != null &&
                        java.util.Arrays.stream(book.getGenres()).anyMatch(g -> g.name().equalsIgnoreCase(filter.getGenre())))
                .filter(book -> filter.getLanguage() == null || book.getLanguage().equalsIgnoreCase(filter.getLanguage()))
                .filter(book -> filter.getMinRating() == null || book.getRating() >= filter.getMinRating())
                .toList();
    }

    public static boolean submitSuggestion(BookDTO bookDTO) {
        String sql = "INSERT INTO suggestions (title, author, language, page_count, genres) VALUES (?, ?, ?, ?, ?::book_genre[])";

        try (Connection conn = DBConnection.getConnection()) {
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, bookDTO.getTitle());
            statement.setString(2, bookDTO.getAuthor());

            // Handle optional values
            if (bookDTO.getLanguage() != null) {
                statement.setString(3, bookDTO.getLanguage());
            } else {
                statement.setNull(3, java.sql.Types.VARCHAR);
            }

            if (bookDTO.getPage_count() != null) {
                statement.setInt(4, bookDTO.getPage_count());
            } else {
                statement.setNull(4, java.sql.Types.INTEGER);
            }

            String[] genreStringArray = Arrays.stream(bookDTO.getGenres())
                    .map(Enum::name)
                    .toArray(String[]::new);
            if (bookDTO.getGenres() != null && bookDTO.getGenres().length > 0) {
                statement.setArray(5, conn.createArrayOf("book_genre", genreStringArray));
            } else {
                statement.setNull(5, java.sql.Types.ARRAY);
            }

            int rowsAffected = statement.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }


    public List<BookDTO> getTrendingBooks() {
        List<BookDTO> trendingBooks = new ArrayList<>();
        String sql = """
        SELECT b.*, COALESCE(AVG(r.rating), 0) AS avg_rating
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        GROUP BY b.id
        ORDER BY avg_rating DESC
        LIMIT 4;
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

                trendingBooks.add(book);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return trendingBooks;
    }

    public boolean addToBookshelf(int bookId, String email) throws SQLException {
        //first check if the book already exists in the user's bookshelf
        String checkSql = """
        SELECT COUNT(*) FROM bookshelf
        WHERE user_id = (SELECT id FROM users WHERE email = ?)
        AND book_id = ?
        """;
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            checkStmt.setString(1, email);
            checkStmt.setInt(2, bookId);

            ResultSet rs = checkStmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                // Book already exists in the user's bookshelf
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
        String sql = """
        INSERT INTO bookshelf (user_id, book_id, status)
        VALUES (
            (SELECT id FROM users WHERE email = ?),
            ?,
            'Wishlist'::book_status
        )
    """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setInt(2, bookId);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean writeReview(int bookId, String email, double rating, String review) {
        // First, check if the user has already reviewed this book
        String checkSql = """
        SELECT COUNT(*) FROM reviews
        WHERE user_id = (SELECT id FROM users WHERE email = ?)
        AND book_id = ?
        """;
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            checkStmt.setString(1, email);
            checkStmt.setInt(2, bookId);

            ResultSet rs = checkStmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                // User has already reviewed this book
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
        String sql = """
        INSERT INTO reviews (user_id, book_id, content, rating)
        VALUES ((SELECT id FROM users WHERE email = ?), ?, ?, ?)
    """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setInt(2, bookId);
            stmt.setString(3, review);
            stmt.setDouble(4, rating);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<BookDTO> getAllSuggestions() {
        List<BookDTO> suggestions = new ArrayList<>();

        String sql = """
        SELECT 
            s.title,
            s.author,
            MAX(s.language) AS language,
            MAX(s.page_count) AS page_count,
            MAX(s.genres) AS genres
        FROM suggestions s
        GROUP BY s.title, s.author
        ORDER BY s.title
    """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                BookDTO book = new BookDTO();

                book.setTitle(rs.getString("title"));
                book.setAuthor(rs.getString("author"));
                book.setLanguage(rs.getString("language")); // can be null
                book.setPage_count(rs.getInt("page_count"));
                Array genreArray = rs.getArray("genres");
                if (genreArray != null) {
                    String[] genresStr = (String[]) genreArray.getArray();
                    genre[] genres = new genre[genresStr.length];
                    for (int i = 0; i < genresStr.length; i++) {
                        try {
                            genres[i] = genre.valueOf(genresStr[i]);
                        } catch (IllegalArgumentException e) {
                            genres[i] = null; // skip invalid values
                        }
                    }
                    book.setGenres(genres);
                } else {
                    book.setGenres(new genre[0]);
                }

                suggestions.add(book);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return suggestions;
    }

    public boolean deleteSuggestion(String trim, String trim1) {
        String sql = "DELETE FROM suggestions WHERE title = ? AND author = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, trim);
            stmt.setString(2, trim1);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean submitSuggestionAsBook(BookDTO book) {
        String sql = """
        INSERT INTO books (title, author, language, page_count, genres)
        VALUES (?, ?, ?, ?, ?::book_genre[])
    """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());

            // Handle optional values
            if (book.getLanguage() != null) {
                stmt.setString(3, book.getLanguage());
            } else {
                stmt.setNull(3, java.sql.Types.VARCHAR);
            }

            if (book.getPage_count() != null) {
                stmt.setInt(4, book.getPage_count());
            } else {
                stmt.setNull(4, java.sql.Types.INTEGER);
            }
            String[] genreStringArray = Arrays.stream(book.getGenres())
                    .map(Enum::name)
                    .toArray(String[]::new);
            if (book.getGenres() != null && book.getGenres().length > 0) {
                stmt.setArray(5, conn.createArrayOf("book_genre", genreStringArray));
            } else {
                stmt.setNull(5, java.sql.Types.ARRAY);
            }

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean isInBookshelf(int bookId, String email) {
        String sql = """
        SELECT COUNT(*) FROM bookshelf
        WHERE user_id = (SELECT id FROM users WHERE email = ?)
        AND book_id = ?
        """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setInt(2, bookId);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0; // Return true if count is greater than 0
            }
        } catch (SQLException e) {
            e.printStackTrace();}
        return false; // Return false if an error occurs or no records found
    }
}