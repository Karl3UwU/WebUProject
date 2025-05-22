import java.sql.*;
import java.util.*;

public class DatabaseManager {
    private static final String URL = "jdbc:oracle:thin:@localhost:1521:xe";
    private static final String USER = "student_app1";
    private static final String PASSWORD = "password123";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    //
    //  verify an user
    //
    public Map<String,Object> getUserByCredentials(String username, String password) {
        Map<String, Object> user = new HashMap<>();
        String query = "SELECT * FROM users WHERE username = ? AND password = ?";
        
        try (Connection connection = getConnection();

            PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, password);
            ResultSet resultSet = preparedStatement.executeQuery();
            
            if (resultSet.next()) {
                user.put("user_id", resultSet.getInt("user_id"));
                user.put("username", resultSet.getString("username"));
                user.put("email", resultSet.getString("email"));    
                user.put("password", resultSet.getString("password"));
                user.put("role", resultSet.getString("role"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return user;
    }

    //
    //  get all books
    //
    public List<Map<String, Object>> getBooks() { 
        List<Map<String, Object>> books = new ArrayList<>();
        String query = "SELECT * FROM books";
        
        try (Connection connection = getConnection();
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(query)) {
            
            while (resultSet.next()) {
                Map<String, Object> book = new HashMap<>();
                book.put("book_id", resultSet.getInt("book_id"));
                book.put("title", resultSet.getString("title"));
                book.put("publisher", resultSet.getString("publisher"));
                book.put("year_published", resultSet.getInt("year_published"));
                book.put("category_id", resultSet.getInt("category_id"));
                book.put("author_id", resultSet.getString("author_id"));
                book.put("edition", resultSet.getString("edition"));
                books.add(book);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return books;
    }

    //
    //  get books by category
    //
    public List<Map<String,Object>> getBooks(int categoryId) {
        List<Map<String, Object>> books = new ArrayList<>();
        String query = "SELECT * FROM books WHERE category_id = ?";
        
        try (Connection connection = getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setInt(1, categoryId);
            ResultSet resultSet = preparedStatement.executeQuery();
            
            while (resultSet.next()) {
                Map<String, Object> book = new HashMap<>();
                book.put("book_id", resultSet.getInt("book_id"));
                book.put("title", resultSet.getString("title"));
                book.put("publisher", resultSet.getString("publisher"));
                book.put("year_published", resultSet.getInt("year_published"));
                book.put("category_id", resultSet.getInt("category_id"));
                book.put("author_id", resultSet.getString("author_id"));
                book.put("edition", resultSet.getString("edition"));
                books.add(book);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return books;
    }

    //
    //  get books by author
    //
    public List<Map<String, Object>> getBooksByAuthor(int authorId) {
        List<Map<String, Object>> books = new ArrayList<>();
        String query = "SELECT * FROM books WHERE author_id = ?";
        
        try (Connection connection = getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setInt(1, authorId);
            ResultSet resultSet = preparedStatement.executeQuery();
            
            while (resultSet.next()) {
                Map<String, Object> book = new HashMap<>();
                book.put("book_id", resultSet.getInt("book_id"));
                book.put("title", resultSet.getString("title"));
                book.put("publisher", resultSet.getString("publisher"));
                book.put("year_published", resultSet.getInt("year_published"));
                book.put("category_id", resultSet.getInt("category_id"));
                book.put("author_id", resultSet.getString("author_id"));
                book.put("edition", resultSet.getString("edition"));
                books.add(book);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return books;
    }

    //
    // more fetches will be implemented
    //
}