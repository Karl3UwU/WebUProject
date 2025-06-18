package org.server.session;

public class JWTPayload {
    public String sub;
    public long exp;

    public JWTPayload(String sub) {
        this.sub = sub;
        this.exp = System.currentTimeMillis() + 6 * 60 * 60 * 1000;
    }
}
