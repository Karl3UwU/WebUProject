package com.WebUProject.servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    // Database connection information
    private static final String DB_URL = "jdbc:oracle:thin:@localhost:1521:XE";
    private static final String DB_USER = "student_app1";
    private static final String DB_PASSWORD = "password123";
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        
        response.setContentType("application/json");
        JSONObject jsonResponse = new JSONObject();
        
        if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Username and password are required");
            response.getWriter().write(jsonResponse.toString());
            return;
        }
        
        try {
            // Load the Oracle JDBC driver
            Class.forName("oracle.jdbc.driver.OracleDriver");
            
            // Establish database connection
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                String sql = "SELECT user_id, username, email, role FROM Users WHERE username = ? AND password = ?";
                
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, username);
                    stmt.setString(2, password);  // Note: In production, you should hash passwords
                    
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            // User found - authentication successful
                            HttpSession session = request.getSession(true);
                            session.setAttribute("userId", rs.getInt("user_id"));
                            session.setAttribute("username", rs.getString("username"));
                            session.setAttribute("role", rs.getString("role"));
                            
                            jsonResponse.put("success", true);
                            jsonResponse.put("user", new JSONObject()
                                    .put("userId", rs.getInt("user_id"))
                                    .put("username", rs.getString("username"))
                                    .put("email", rs.getString("email"))
                                    .put("role", rs.getString("role")));
                        } else {
                            // User not found
                            jsonResponse.put("success", false);
                            jsonResponse.put("message", "Invalid username or password");
                        }
                    }
                }
            }
        } catch (ClassNotFoundException e) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Database driver not found");
            e.printStackTrace();
        } catch (SQLException e) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Database error: " + e.getMessage());
            e.printStackTrace();
        }
        
        response.getWriter().write(jsonResponse.toString());
    }
}
