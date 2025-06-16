package org.server.model;

public class Review {
    private String username;
    private String title;
    private String content;
    private Integer rating;

    // Constructors
    public Review() {}

    public Review(String username, String title, String content, Integer rating) {
        this.username = username;
        this.title = title;
        this.content = content;
        this.rating = rating;
    }

    // Getters and Setters
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
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public Integer getRating() {
        return rating;
    }
    public void setRating(Integer rating) {
        this.rating = rating;
    }
}
