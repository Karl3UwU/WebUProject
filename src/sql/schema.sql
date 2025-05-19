-- Drop existing tables and sequences if they exist
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Reviews CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Books CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Categories CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Users CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Authors CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE ReadingList CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Messages CASCADE CONSTRAINTS';

    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_users';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_books';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_categories';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_reviews';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_authors';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_readinglist';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_messages';
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END;
/

-- Sequences
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_books START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_categories START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_reviews START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_authors START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_readinglist START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_messages START WITH 1 INCREMENT BY 1;

-- Object Types
CREATE OR REPLACE TYPE Book AS OBJECT (
    book_id        NUMBER,
    title          VARCHAR2(255),
    publisher      VARCHAR2(100),
    year_published NUMBER,
    edition        VARCHAR2(50)
);
/

CREATE OR REPLACE TYPE User_interface AS OBJECT (
    user_id  NUMBER,
    username VARCHAR2(50),
    password VARCHAR2(50),
    email    VARCHAR2(100),
    role     VARCHAR2(10),
    MEMBER FUNCTION get_role RETURN VARCHAR2
) NOT FINAL;
/

CREATE OR REPLACE TYPE User_default UNDER User_interface (
    OVERRIDING MEMBER FUNCTION get_role RETURN VARCHAR2
);
/

CREATE OR REPLACE TYPE User_admin UNDER User_interface (
    OVERRIDING MEMBER FUNCTION get_role RETURN VARCHAR2
);
/

CREATE OR REPLACE TYPE BODY User_default AS
    OVERRIDING MEMBER FUNCTION get_role RETURN VARCHAR2 IS
    BEGIN
        RETURN 'Default';
    END;
END;
/

CREATE OR REPLACE TYPE BODY User_admin AS
    OVERRIDING MEMBER FUNCTION get_role RETURN VARCHAR2 IS
    BEGIN
        RETURN 'Admin';
    END;
END;
/

-- Tables
CREATE TABLE Users (
    user_id  NUMBER PRIMARY KEY,
    username VARCHAR2(50),
    email    VARCHAR2(100),
    password VARCHAR2(100),
    role     VARCHAR2(10)
);

CREATE TABLE Categories (
    category_id   NUMBER PRIMARY KEY,
    category_name VARCHAR2(50)
);

CREATE TABLE Authors (
    author_id NUMBER PRIMARY KEY,
    name      VARCHAR2(100),
    bio       CLOB
);

CREATE TABLE Books (
    book_id        NUMBER PRIMARY KEY,
    title          VARCHAR2(255),
    publisher      VARCHAR2(100),
    year_published NUMBER,
    category_id    NUMBER,
    author_id      NUMBER,
    edition        VARCHAR2(50),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    FOREIGN KEY (author_id) REFERENCES Authors(author_id)
);

CREATE TABLE Reviews (
    review_id NUMBER PRIMARY KEY,
    user_id   NUMBER,
    book_id   NUMBER,
    content   CLOB,
    rating    NUMBER(1),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

CREATE TABLE ReadingList (
    list_id NUMBER PRIMARY KEY,
    user_id NUMBER,
    book_id NUMBER,
    status  VARCHAR2(20) CHECK (status IN ('reading', 'completed', 'wishlist')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

CREATE TABLE Messages (
    message_id NUMBER PRIMARY KEY,
    sender_id  NUMBER NOT NULL,
    receiver_id NUMBER NOT NULL,
    content    VARCHAR2(1000),
    sent_at    DATE DEFAULT SYSDATE,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
);

-- Triggers
CREATE OR REPLACE TRIGGER trg_users
BEFORE INSERT ON Users
FOR EACH ROW
BEGIN
    :NEW.user_id := seq_users.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_categories
BEFORE INSERT ON Categories
FOR EACH ROW
BEGIN
    :NEW.category_id := seq_categories.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_books
BEFORE INSERT ON Books
FOR EACH ROW
BEGIN
    :NEW.book_id := seq_books.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_reviews
BEFORE INSERT ON Reviews
FOR EACH ROW
BEGIN
    :NEW.review_id := seq_reviews.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_authors
BEFORE INSERT ON Authors
FOR EACH ROW
BEGIN
    :NEW.author_id := seq_authors.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_readinglist
BEFORE INSERT ON ReadingList
FOR EACH ROW
BEGIN
    :NEW.list_id := seq_readinglist.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_messages
BEFORE INSERT ON Messages
FOR EACH ROW
BEGIN
    :NEW.message_id := seq_messages.NEXTVAL;
END;
/

-- Utility Package
CREATE OR REPLACE PACKAGE book_review_utils AS
    e_invalid_book_id EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_invalid_book_id, -20200);
    e_invalid_user_id EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_invalid_user_id, -20201);

    FUNCTION user_exists(p_user_id IN NUMBER) RETURN BOOLEAN;
    FUNCTION book_exists(p_book_id IN NUMBER) RETURN BOOLEAN;
    PROCEDURE delete_book_safe(p_book_id IN NUMBER);
END book_review_utils;
/

CREATE OR REPLACE PACKAGE BODY book_review_utils AS
    FUNCTION user_exists(p_user_id IN NUMBER) RETURN BOOLEAN IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM Users WHERE user_id = p_user_id;
        RETURN v_count > 0;
    EXCEPTION
        WHEN OTHERS THEN RETURN FALSE;
    END;

    FUNCTION book_exists(p_book_id IN NUMBER) RETURN BOOLEAN IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM Books WHERE book_id = p_book_id;
        RETURN v_count > 0;
    EXCEPTION
        WHEN OTHERS THEN RETURN FALSE;
    END;

    PROCEDURE delete_book_safe(p_book_id IN NUMBER) IS
    BEGIN
        IF NOT book_exists(p_book_id) THEN
            RAISE_APPLICATION_ERROR(-20200, 'Invalid book ID: ' || p_book_id);
        END IF;

        DELETE FROM ReadingList WHERE book_id = p_book_id;
        DELETE FROM Reviews WHERE book_id = p_book_id;
        DELETE FROM Books WHERE book_id = p_book_id;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
END book_review_utils;
/

-- View
CREATE OR REPLACE VIEW BookReviewSummary AS
SELECT 
    b.title,
    c.category_name,
    a.name AS author_name,
    COUNT(r.review_id) AS total_reviews,
    AVG(r.rating) AS average_rating
FROM 
    Books b
JOIN 
    Categories c ON b.category_id = c.category_id
JOIN 
    Authors a ON b.author_id = a.author_id
LEFT JOIN 
    Reviews r ON b.book_id = r.book_id
GROUP BY 
    b.title, c.category_name, a.name;

-- Procedure
CREATE OR REPLACE PROCEDURE list_books_by_category(p_category_name IN VARCHAR2) IS
    CURSOR book_cursor IS
        SELECT b.title, a.name AS author_name, b.year_published
        FROM Books b
        JOIN Categories c ON b.category_id = c.category_id
        JOIN Authors a ON b.author_id = a.author_id
        WHERE c.category_name = p_category_name
        ORDER BY b.year_published;

    v_title VARCHAR2(255);
    v_author VARCHAR2(100);
    v_year NUMBER;
    v_count NUMBER := 0;
BEGIN
    OPEN book_cursor;
    DBMS_OUTPUT.PUT_LINE('Books in category: ' || p_category_name);
    LOOP
        FETCH book_cursor INTO v_title, v_author, v_year;
        EXIT WHEN book_cursor%NOTFOUND;
        v_count := v_count + 1;
        DBMS_OUTPUT.PUT_LINE(v_count || '. ' || v_title || ' by ' || v_author || ' (' || v_year || ')');
    END LOOP;
    CLOSE book_cursor;

    IF v_count = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No books found in this category.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Total books listed: ' || v_count);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        IF book_cursor%ISOPEN THEN CLOSE book_cursor; END IF;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        RAISE;
END list_books_by_category;
/
