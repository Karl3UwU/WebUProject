-- Drop existing tables and sequences if they exist
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Reviews CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Books CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Categories CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Users CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_users';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_books';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_categories';
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_reviews';
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if objects do not exist
END;
/

-- Create sequences for primary keys
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_books START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_categories START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_reviews START WITH 1 INCREMENT BY 1;

-- Create object types for users and books
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

-- Create tables
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

CREATE TABLE Books (
    book_id        NUMBER PRIMARY KEY,
    title          VARCHAR2(255),
    publisher      VARCHAR2(100),
    year_published NUMBER,
    category_id    NUMBER,
    edition        VARCHAR2(50),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
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

-- Create triggers to auto-increment primary keys
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