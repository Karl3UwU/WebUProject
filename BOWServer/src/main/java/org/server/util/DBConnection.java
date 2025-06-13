package org.server.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

public class DBConnection {
    private static Connection connection;

    public static Connection getConnection() {
        if (connection == null) {
            try {
                Dotenv dotenv = Dotenv.load(); // loads from .env in project root

                String url = dotenv.get("DB_URL");
                String user = dotenv.get("DB_USERNAME");
                String password = dotenv.get("DB_PASSWORD");

                connection = DriverManager.getConnection(url, user, password);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return connection;
    }
}

