package org.server.model;

import org.server.enums.genre;

public class Book {
    private String title;
    private String author;
    private String language;
    private Integer page_count;
    private genre[] genres;

    public Book() {
    }

    public Book(String title, String author, String language, Integer page_count, genre[] genres) {
        this.title = title;
        this.author = author;
        this.language = language;
        this.page_count = page_count;
        this.genres = genres;
    }
    public String getTitle() {
        return title;
    }
    public String getAuthor() {
        return author;
    }
    public String getLanguage() {
        return language;
    }
    public Integer getPage_count() {
        return page_count;
    }
    public genre[] getGenres() {
        return genres;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public void setAuthor(String author) {
        this.author = author;
    }
    public void setLanguage(String language) {
        this.language = language;
    }
    public void setPage_count(Integer page_count) {
        this.page_count = page_count;
    }
    public void setGenres(genre[] genres) {
        this.genres = genres;
    }

}
