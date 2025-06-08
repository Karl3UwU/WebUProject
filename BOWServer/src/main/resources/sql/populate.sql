CONNECT student_app1/password123
set SERVEROUTPUT ON;
DECLARE
    v_user_id_1 Users.user_id%TYPE;
    v_user_id_2 Users.user_id%TYPE;
    v_user_id_3 Users.user_id%TYPE;
    v_user_id_4 Users.user_id%TYPE;

    v_cat_fiction Categories.category_id%TYPE;
    v_cat_science Categories.category_id%TYPE;
    v_cat_history Categories.category_id%TYPE;
    v_cat_tech Categories.category_id%TYPE;
    
    v_author_id_1 Authors.author_id%TYPE;
    v_author_id_2 Authors.author_id%TYPE;
    v_author_id_3 Authors.author_id%TYPE;
    v_author_id_4 Authors.author_id%TYPE;

    v_book_id_1 Books.book_id%TYPE;
    v_book_id_2 Books.book_id%TYPE;
    v_book_id_3 Books.book_id%TYPE;
    v_book_id_4 Books.book_id%TYPE;
BEGIN
    -- Insert Users
    INSERT INTO Users (username, email, password, role)
    VALUES ('john_doe', 'john.doe@example.com', 'secure123', 'Default')
    RETURNING user_id INTO v_user_id_1;

    INSERT INTO Users (username, email, password, role)
    VALUES ('jane_admin', 'jane.admin@example.com', 'adminpass', 'Admin')
    RETURNING user_id INTO v_user_id_2;

    INSERT INTO Users (username, email, password, role)
    VALUES ('alice_reader', 'alice.reader@example.com', 'alicepass', 'Default')
    RETURNING user_id INTO v_user_id_3;

    INSERT INTO Users (username, email, password, role)
    VALUES ('bob_writer', 'bob.writer@example.com', 'bobpass', 'Default')
    RETURNING user_id INTO v_user_id_4;

    -- Insert Categories
    INSERT INTO Categories (category_name)
    VALUES ('Fiction') RETURNING category_id INTO v_cat_fiction;

    INSERT INTO Categories (category_name)
    VALUES ('Science') RETURNING category_id INTO v_cat_science;

    INSERT INTO Categories (category_name)
    VALUES ('History') RETURNING category_id INTO v_cat_history;

    INSERT INTO Categories (category_name)
    VALUES ('Technology') RETURNING category_id INTO v_cat_tech;
    
    -- Insert Authors
    INSERT INTO Authors (name, bio)
    VALUES ('H.G. Wells', 'Herbert George Wells was an English writer who wrote in many genres, including the novel.') 
    RETURNING author_id INTO v_author_id_1;
    
    INSERT INTO Authors (name, bio)
    VALUES ('Stephen Hawking', 'Stephen William Hawking was an English theoretical physicist, cosmologist, and author.') 
    RETURNING author_id INTO v_author_id_2;
    
    INSERT INTO Authors (name, bio)
    VALUES ('Yuval Noah Harari', 'Yuval Noah Harari is an Israeli historian and professor at the Hebrew University of Jerusalem.') 
    RETURNING author_id INTO v_author_id_3;
    
    INSERT INTO Authors (name, bio)
    VALUES ('Robert C. Martin', 'Robert Cecil Martin is an American software engineer and author.') 
    RETURNING author_id INTO v_author_id_4;

    -- Insert Books
    INSERT INTO Books (title, publisher, year_published, category_id, author_id, edition)
    VALUES ('The Time Machine', 'Penguin Classics', 1895, v_cat_fiction, v_author_id_1, '1st')
    RETURNING book_id INTO v_book_id_1;

    INSERT INTO Books (title, publisher, year_published, category_id, author_id, edition)
    VALUES ('A Brief History of Time', 'Bantam Books', 1988, v_cat_science, v_author_id_2, 'Updated')
    RETURNING book_id INTO v_book_id_2;

    INSERT INTO Books (title, publisher, year_published, category_id, author_id, edition)
    VALUES ('Sapiens', 'Harvill Secker', 2011, v_cat_history, v_author_id_3, '2nd')
    RETURNING book_id INTO v_book_id_3;

    INSERT INTO Books (title, publisher, year_published, category_id, author_id, edition)
    VALUES ('Clean Code', 'Prentice Hall', 2008, v_cat_tech, v_author_id_4, '1st')
    RETURNING book_id INTO v_book_id_4;

    -- Insert Reviews
    INSERT INTO Reviews (user_id, book_id, content, rating)
    VALUES (v_user_id_1, v_book_id_1, 'A visionary look into the future. Brilliant read.', 5);

    INSERT INTO Reviews (user_id, book_id, content, rating)
    VALUES (v_user_id_2, v_book_id_2, 'Very complex but fascinating. Needed multiple reads.', 4);

    INSERT INTO Reviews (user_id, book_id, content, rating)
    VALUES (v_user_id_3, v_book_id_3, 'A compelling narrative of human history.', 5);

    INSERT INTO Reviews (user_id, book_id, content, rating)
    VALUES (v_user_id_4, v_book_id_4, 'Essential reading for developers. Highly recommended.', 5);

    COMMIT;
END;
/