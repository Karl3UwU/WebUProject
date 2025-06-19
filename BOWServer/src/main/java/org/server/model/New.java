package org.server.model;

import java.security.Timestamp;
import java.time.LocalDateTime;

public class New {
    private String title;
    private String content;
    private LocalDateTime posted;
    private String username;

    public New() {
    }

    public New(String title, String content, LocalDateTime posted, String username) {
        this.title = title;
        this.content = content;
        this.posted = posted;
        this.username = username;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public LocalDateTime getPosted() {
        return posted;
    }
    public void setPosted(LocalDateTime posted) {
        this.posted = posted;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
}
