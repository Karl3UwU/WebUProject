package org.server.dto;

public class ReviewFilterDTO {
    private String username;
    private String title;

    public ReviewFilterDTO() {}

    public ReviewFilterDTO(String username, String title) {
        this.username = username;
        this.title = title;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

}
