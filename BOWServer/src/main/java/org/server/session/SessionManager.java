package org.server.session;

import org.server.model.User;
import org.server.util.JWTUtil;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private static final Map<String, User> sessions = new ConcurrentHashMap<>();

    public static String createSession(User user) {
        String token = JWTUtil.createToken(user);
        sessions.put(token, user);
        return token;
    }

    public static User getUserFromToken(String token) {
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