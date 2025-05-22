import java.util.*;

public class SessionManager {
    private static final Map<String, Map<String, Object>> sessions = new HashMap<>();
    private static final Random random = new Random(); // random session id for now

    public static String createSession(Map<String, Object> userData) {
        String sessionId = generateSessionId();
        sessions.put(sessionId, userData);
        return sessionId;
    }

    public static Map<String, Object> getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public static void destroySession(String sessionId) {
        sessions.remove(sessionId);
    }

    public static boolean isValidSession(String sessionId) {
        return sessions.containsKey(sessionId);
    }

    private static String generateSessionId() {
        StringBuilder sessionId = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            sessionId.append((char) (random.nextInt(26) + 'a'));
        }
        return sessionId.toString();
    }


    
}
