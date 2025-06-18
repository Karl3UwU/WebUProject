package org.server.session;

import org.server.model.User;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private static final Map<String, String> sessions = new ConcurrentHashMap<>();

    public static String createSession(String userEmail) {
        JWTPayload jwtPayload = new JWTPayload(userEmail);
        String token = JWTUtil.createToken(jwtPayload);
        sessions.put(token, userEmail);
        return token;
    }

    public static String getUserEmailFromToken(String token) {
        if (!JWTUtil.verifyToken(token)) return null;
        return sessions.get(token);
    }

    public static void invalidateToken(String token) {
        sessions.remove(token);
    }

    public static boolean isTokenActive(String token) {
        return sessions.containsKey(token);
    }
}