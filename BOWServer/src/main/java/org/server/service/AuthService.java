package org.server.service;

import org.server.dto.LoginDTO;
import org.server.dto.UserInfoDTO;
import org.server.dto.UserRegisterDTO;
import org.server.enums.HttpStatus;
import org.server.enums.UserRole;
import org.server.model.User;
import org.server.session.JWTUtil;
import org.server.util.DBConnection;
import org.server.util.PasswordUtil;
import org.server.util.ResponseEntity;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Objects;

public class AuthService {

    public static Boolean registerUser(UserRegisterDTO registerDTO) {
        try(Connection conn = DBConnection.getConnection()) {
            String sql = "INSERT INTO users (role, username, first_name, last_name, email, password) VALUES (?::user_role, ?, ?, ?, ?, ?)";
            PreparedStatement statement = conn.prepareStatement(sql);

            statement.setString(1, UserRole.BASIC.getValue());
            statement.setString(2, registerDTO.getUsername());
            statement.setString(3, registerDTO.getFirstName());
            statement.setString(4, registerDTO.getLastName());
            statement.setString(5, registerDTO.getEmail());
            statement.setString(6, PasswordUtil.encryptPassword(UserRegisterDTOToPassword(registerDTO)));

            int rowsAffected = statement.executeUpdate(); // Use executeUpdate() for INSERT
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private static String UserRegisterDTOToPassword (UserRegisterDTO registerDTO) {
        return registerDTO.getEmail() + registerDTO.getPassword();
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
