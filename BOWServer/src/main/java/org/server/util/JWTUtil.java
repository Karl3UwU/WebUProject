package org.server.util;

import com.google.gson.Gson;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

public class JWTUtil {
    private static final String SECRET = "super-secret-key";
    private static final Gson gson = new Gson();

    public static String createToken(JWTPayload payload) {
        String header = base64UrlEncode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String body = base64UrlEncode(gson.toJson(payload));
        String signature = hmacSha256(header + "." + body);
        return header + "." + body + "." + signature;
    }

    public static boolean verifyToken(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;

        String header = parts[0];
        String body = parts[1];
        String signature = parts[2];

        String expectedSig = hmacSha256(header + "." + body);
        if (!signature.equals(expectedSig)) return false;

        // Check expiration
        String json = new String(Base64.getUrlDecoder().decode(body), StandardCharsets.UTF_8);
        JWTPayload payload = gson.fromJson(json, JWTPayload.class);
        return payload.exp > System.currentTimeMillis();
    }


    public static <T> T parsePayload(String token, Class<T> clazz) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) return null;

        String body = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        return gson.fromJson(body, clazz);
    }

    private static String base64UrlEncode(String input) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(input.getBytes(StandardCharsets.UTF_8));
    }

    private static String hmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
