package org.server.util;

import io.github.cdimascio.dotenv.Dotenv;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;

public class PasswordUtil {

    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS = 10000;
    private static final int KEY_LENGTH = 256;

    private static final Dotenv dotenv = Dotenv.configure()
            .filename(".env")
            .ignoreIfMissing()
            .load();

    private static final String SALT = getSaltFromEnv();

    private static String getSaltFromEnv() {
        String salt = dotenv.get("PASSWORD_SALT");
        if (salt == null || salt.trim().isEmpty()) {
            throw new RuntimeException("PASSWORD_SALT not found in .env file or is empty");
        }
        return salt;
    }

    public static String encryptPassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }

        try {
            KeySpec spec = new PBEKeySpec(
                    password.toCharArray(),
                    SALT.getBytes(),
                    ITERATIONS,
                    KEY_LENGTH
            );

            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITHM);
            byte[] hash = factory.generateSecret(spec).getEncoded();

            return Base64.getEncoder().encodeToString(hash);

        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Password encryption failed", e);
        }
    }

    public static boolean verifyPassword(String plainPassword, String encryptedPassword) {
        if (plainPassword == null || encryptedPassword == null) {
            return false;
        }

        try {
            String hashedInput = encryptPassword(plainPassword);
            return hashedInput.equals(encryptedPassword);
        } catch (Exception e) {
            return false;
        }
    }

    public static String generateRandomSalt() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        byte[] salt = new byte[32]; // 256-bit salt
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public static boolean checkPassword(String userEmail, String oldPassword, String currentPassword) {
        if (oldPassword == null || currentPassword == null) {
            return false;
        }

        try {
            String encryptedOldPassword = encryptPassword(userEmail + oldPassword);
            return encryptedOldPassword.equals(currentPassword);
        } catch (Exception e) {
            return false;
        }
    }
}
