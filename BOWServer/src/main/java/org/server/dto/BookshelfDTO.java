package org.server.dto;


import org.server.enums.Status;

public class BookshelfDTO {
    private String user_id;
    private String book_id;
    private Status status;

    public BookshelfDTO(String user_id, String book_id, Status status) {
        this.user_id = user_id;
        this.book_id = book_id;
        this.status = status;
    }

    public String getUserId() {
        return user_id;
    }
    public void setUserId(String user_id) {
        this.user_id = user_id;
    }
    public String getBookId() {
        return book_id;
    }
    public void setBookId(String book_id) {
        this.book_id = book_id;
    }
    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }

}

