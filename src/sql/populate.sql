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

    -- Insert Books
    INSERT INTO Books (title, publisher, year_published, category_id, edition)
    VALUES ('The Time Machine', 'Penguin Classics', 1895, v_cat_fiction, '1st')
    RETURNING book_id INTO v_book_id_1;

    INSERT INTO Books (title, publisher, year_published, category_id, edition)
    VALUES ('A Brief History of Time', 'Bantam Books', 1988, v_cat_science, 'Updated')
    RETURNING book_id INTO v_book_id_2;

    INSERT INTO Books (title, publisher, year_published, category_id, edition)
    VALUES ('Sapiens', 'Harvill Secker', 2011, v_cat_history, '2nd')
    RETURNING book_id INTO v_book_id_3;

    INSERT INTO Books (title, publisher, year_published, category_id, edition)
    VALUES ('Clean Code', 'Prentice Hall', 2008, v_cat_tech, '1st')
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
