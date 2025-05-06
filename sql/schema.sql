-- We will keep track of the history of the database schema changes here.
-- This file will contain the SQL commands to create the tables, types and so on...

-- CREATE TABLE Users ADD(
--     user_id NUMBER PRIMARY KEY,
--     username VARCHAR2(50),
--     email VARCHAR2(100),
--     password VARCHAR2(100)
-- );

-- CREATE TABLE Books ADD(
--     book_id NUMBER PRIMARY KEY,
--     title VARCHAR2(255),
--     publisher VARCHAR2(100),
--     year_published NUMBER,
--     category_id NUMBER,
--     edition VARCHAR2(50)
-- );

-- CREATE TABLE Categories (
--     category_id NUMBER PRIMARY KEY,
--     category_name VARCHAR2(50)
-- );

-- CREATE TABLE Reviews (
--     review_id NUMBER PRIMARY KEY,
--     user_id NUMBER,
--     book_id NUMBER,
--     content CLOB,
--     rating NUMBER(1),
--     FOREIGN KEY (user_id) REFERENCES Users(user_id),
--     FOREIGN KEY (book_id) REFERENCES Books(book_id)
-- );

-- CREATE OR REPLACE TYPE Book AS OBJECT (
--     book_id       NUMBER,
--     title         VARCHAR2(255),
--     publisher     VARCHAR2(100),
--     year_published NUMBER,
--     edition       VARCHAR2(50)
-- );
-- /

-- DECLARE
--     v_book_1 Book := Book(1, 'The Great Gatsby', 'Scribner', 1925, '1st');
--     book_2 Book := Book(2, 'To Kill a Mockingbird', 'J.B. Lippincott and Co.', 1960, '1st');
--     book_3 Book := Book(3, '1984', 'Secker and Warburg', 1949, '1st');
--     book_4 Book := Book(4, 'Pride and Prejudice', 'T. Egerton', 1813, '1st');
--     book_5 Book := Book(5, 'Moby-Dick', 'Harper and Brothers', 1851, '1st');
--     book_6 Book := Book(6, 'Brave New World', 'Chatto and Windus', 1932, '1st');
--     book_7 Book := Book(7, 'The Catcher in the Rye', 'Little, Brown and Company', 1951, '1st');
--     book_8 Book := Book(8, 'Jane Eyre', 'Smith, Elder and Co.', 1847, '1st');
--     book_9 Book := Book(9, 'Wuthering Heights', 'Thomas Cautley Newby', 1847, '1st');
--     book_10 Book := Book(10, 'Crime and Punishment', 'The Russian Messenger', 1866, '1st');
-- BEGIN
--     -- Insert all books
--    INSERT INTO Books (book_id, title, publisher, year_published, edition) VALUES (
--         v_book_1.book_id,
--         v_book_1.title,
--         v_book_1.publisher,
--         v_book_1.year_published,
--         v_book_1.edition
--     );
--    INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_2.book_id, book_2.title, book_2.publisher, book_2.year_published, book_2.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_3.book_id, book_3.title, book_3.publisher, book_3.year_published, book_3.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_4.book_id, book_4.title, book_4.publisher, book_4.year_published, book_4.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_5.book_id, book_5.title, book_5.publisher, book_5.year_published, book_5.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_6.book_id, book_6.title, book_6.publisher, book_6.year_published, book_6.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_7.book_id, book_7.title, book_7.publisher, book_7.year_published, book_7.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_8.book_id, book_8.title, book_8.publisher, book_8.year_published, book_8.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_9.book_id, book_9.title, book_9.publisher, book_9.year_published, book_9.edition);

--     INSERT INTO Books (book_id, title, publisher, year_published, edition)
--     VALUES (book_10.book_id, book_10.title, book_10.publisher, book_10.year_published, book_10.edition);

--     DBMS_OUTPUT.PUT_LINE('10 books inserted successfully.');
-- END;
-- /
