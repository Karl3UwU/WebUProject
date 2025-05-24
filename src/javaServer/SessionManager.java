import java.util.*;
import com.google.gson.Gson;

public class SessionManager {
    private static final Map<String, Map<String, Object>> sessions = new HashMap<>();
    private static final Random random = new Random(); // random session id for now
    private static final Gson gson = new Gson();

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

    // ✅ Test method to return JSON string of mock session data
    public static String testJsonOutput() {
        Map<String, Object> mockUser = new HashMap<>();
        mockUser.put("username", "testuser");
        mockUser.put("role", "student");
        mockUser.put("loggedIn", true);

        String sessionId = createSession(mockUser);
        Map<String, Object> session = getSession(sessionId);

        return gson.toJson(session);
    }
}
