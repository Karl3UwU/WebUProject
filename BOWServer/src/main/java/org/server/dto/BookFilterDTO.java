package org.server.dto;

public class BookFilterDTO {
    private String title;
    private String author;
    private String genre;
    private String language;
    private Double minRating;

    public BookFilterDTO() {}

    public BookFilterDTO(String title, String author, String genre, String language, Double minRating) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.language = language;
        this.minRating = minRating;
    }

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Double getMinRating() { return minRating; }
    public void setMinRating(Double minRating) { this.minRating = minRating; }
}
