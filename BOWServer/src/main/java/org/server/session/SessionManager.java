package org.server.session;

import org.server.model.User;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private static final Map<String, String> sessions = new ConcurrentHashMap<>();
    private static final Map<String, String> sessions_timeout = new ConcurrentHashMap<>();

    public static String createSession(String userEmail) {
        JWTPayload jwtPayload = new JWTPayload(userEmail);
        String token = JWTUtil.createToken(jwtPayload);
        sessions.put(token, userEmail);
        sessions_timeout.put(token, String.valueOf(jwtPayload.exp));
        return token;
    }

    public static String getUserEmailFromToken(String token) {
        if (!JWTUtil.verifyToken(token)) return null;
        if(!isTokenActive(token)) return null;
        return sessions.get(token);
    }

    public static void invalidateToken(String token) {
        sessions.remove(token);
        sessions_timeout.remove(token);
    }

    public static boolean isTokenActive(String token) {
        if (!JWTUtil.verifyToken(token)) return false;
        if (sessions_timeout.get(token) == null) return false;

        long timeout = Long.parseLong(sessions_timeout.get(token));
        if (timeout < System.currentTimeMillis()) return false;

        return sessions.containsKey(token);
    }
}