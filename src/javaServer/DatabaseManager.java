import java.sql.*;
import java.util.*;

public class DatabaseManager {
    private static final String URL = "jdbc:oracle:thin:@localhost:1521:xe";
    private static final String USER = "student_app1";
    private static final String PASSWORD = "password123";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    //method for login
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
    

    // --------------------------- User methods --------------------------- //
    // returns a list of all users
    public List<Map<String,Object>> getAllUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        String query = "SELECT * FROM users";
        
        try (Connection connection = getConnection();
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(query)) {
            
            while (resultSet.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("user_id", resultSet.getInt("user_id"));
                user.put("username", resultSet.getString("username"));
                user.put("email", resultSet.getString("email"));    
                user.put("password", resultSet.getString("password"));
                user.put("role", resultSet.getString("role"));
                users.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }
    // returns a user by username
    public Map<String,Object> getUserByUsername(String username) {
        Map<String, Object> user = new HashMap<>();
        String query = "SELECT * FROM users WHERE username = ?";
        
        try (Connection connection = getConnection();
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(query)) {
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
    // adds a new user
    public boolean addUser(String username, String email, String password, String role) {
        String query = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
        
        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, email);
            preparedStatement.setString(3, password);
            preparedStatement.setString(4, role);
            
            int rowsInserted = preparedStatement.executeUpdate();
            return rowsInserted > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    // updates a user
    public boolean updateUser(int userId, String username, String email, String password) {
        String query = "UPDATE users SET username = ?, email = ?, password = ? WHERE user_id = ?";
        
        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, email);
            preparedStatement.setString(3, password);
            preparedStatement.setInt(4, userId);
            
            int rowsUpdated = preparedStatement.executeUpdate();
            return rowsUpdated > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    
    // --------------------------- Book methods --------------------------- //
    // returns a list of all books
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
    // returns a list of books by one or more one category
    public List<Map<String,Object>> getBooksByCategories(List<Integer> categoryIds) {
        List<Map<String, Object>> books = new ArrayList<>();
        StringBuilder query = new StringBuilder("SELECT * FROM books WHERE category_id IN (");
        
        for (int i = 0; i < categoryIds.size(); i++) {
            query.append("?");
            if (i < categoryIds.size() - 1) {
                query.append(", ");
            }
        }
        query.append(")");
        
        try (Connection connection = getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(query.toString())) {
            
            for (int i = 0; i < categoryIds.size(); i++) {
                preparedStatement.setInt(i + 1, categoryIds.get(i));
            }
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
    // returns a list of books by author
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
    // returns a book by id
    public Map<String, Object> getBookById(int bookId) {
        Map<String, Object> book = new HashMap<>();
        String query = "SELECT * FROM books WHERE book_id = ?";
        
        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setInt(1, bookId);
            ResultSet resultSet = preparedStatement.executeQuery();
            
            if (resultSet.next()) {
                book.put("book_id", resultSet.getInt("book_id"));
                book.put("title", resultSet.getString("title"));
                book.put("publisher", resultSet.getString("publisher"));
                book.put("year_published", resultSet.getInt("year_published"));
                book.put("category_id", resultSet.getInt("category_id"));
                book.put("author_id", resultSet.getString("author_id"));
                book.put("edition", resultSet.getString("edition"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return book;
    }
    // returns a list of books by title ( includes partial searching )
    public List<Map<String, Object>> searchBooksByTitle(String titleQuery) {
        List<Map<String, Object>> books = new ArrayList<>();
        String query = "SELECT * FROM books WHERE LOWER(title) LIKE ?";
        
        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, "%" + titleQuery.toLowerCase() + "%");
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

    
    // --------------------------- Author methods --------------------------- //
    // returns a list of all authors
    public List<Map<String, Object>> getAllAuthors() {
        List<Map<String, Object>> authors = new ArrayList<>();
        String query = "SELECT * FROM authors";
        
        try (Connection connection = getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {
            
            while (resultSet.next()) {
                Map<String, Object> author = new HashMap<>();
                author.put("author_id", resultSet.getInt("author_id"));
                author.put("first_name", resultSet.getString("first_name"));
                author.put("last_name", resultSet.getString("last_name"));
                author.put("biography", resultSet.getString("biography"));
                author.put("birth_date", resultSet.getDate("birth_date"));
                authors.add(author);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return authors;
    }
    // returns an author by id
    public Map<String, Object> getAuthorById(int authorId) {
        Map<String, Object> author = new HashMap<>();
        String query = "SELECT * FROM authors WHERE author_id = ?";
        
        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setInt(1, authorId);
            ResultSet resultSet = preparedStatement.executeQuery();
            
            if (resultSet.next()) {
                author.put("author_id", resultSet.getInt("author_id"));
                author.put("first_name", resultSet.getString("first_name"));
                author.put("last_name", resultSet.getString("last_name"));
                author.put("biography", resultSet.getString("biography"));
                author.put("birth_date", resultSet.getDate("birth_date"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return author;
    }
    

    // --------------------------- Category methods --------------------------- //
    // returns a list of all categories
    public List<Map<String, Object>> getAllCategories() {
        List<Map<String, Object>> categories = new ArrayList<>();
        String query = "SELECT * FROM book_categories";
        
        try (Connection connection = getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {
            
            while (resultSet.next()) {
                Map<String, Object> category = new HashMap<>();
                category.put("category_id", resultSet.getInt("category_id"));
                category.put("category_name", resultSet.getString("category_name"));
                category.put("description", resultSet.getString("description"));
                categories.add(category);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return categories;
    }
    // returns a category by id
    public Map<String, Object> getCategoryById(int categoryId) {
        Map<String, Object> category = new HashMap<>();
        String query = "SELECT * FROM book_categories WHERE category_id = ?";
        
        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setInt(1, categoryId);
            ResultSet resultSet = preparedStatement.executeQuery();
            
            if (resultSet.next()) {
                category.put("category_id", resultSet.getInt("category_id"));
                category.put("category_name", resultSet.getString("category_name"));
                category.put("description", resultSet.getString("description"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return category;
    }
}