package org.server.service;

import org.server.dto.NewDTO;
import org.server.util.DBConnection;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class NewsService {
    public List<NewDTO> getAllNews() throws SQLException {
        List<NewDTO> news = new ArrayList<>();

        String sql = "SELECT title, content, posted, username FROM news JOIN users ON news.user_id=users.id ORDER BY posted DESC";

        try (var conn = DBConnection.getConnection();
             var stmt = conn.prepareStatement(sql);
             var rs = stmt.executeQuery()) {

            while (rs.next()) {
                NewDTO newItem = new NewDTO();
                newItem.setTitle(rs.getString("title"));
                newItem.setContent(rs.getString("content"));
                newItem.setPosted(rs.getTimestamp("posted").toLocalDateTime());
                newItem.setUsername(rs.getString("username"));

                news.add(newItem);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return news;
    }
}
