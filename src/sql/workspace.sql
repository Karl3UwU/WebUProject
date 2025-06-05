CONNECT student_app1/password123
set SERVEROUTPUT ON;
SET LONG 10000;

-- select bio from AUTHORS;

DECLARE
    v_name VARCHAR2(100);

BEGIN

    SELECT 'H.G. Wells' INTO v_name FROM DUAL;

    -- IF
    IF v_name IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('Author found: ' || v_name);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Author not found.');
    END IF;

    -- CASE
    CASE
        WHEN v_name = 'H.G. Wells' THEN
            DBMS_OUTPUT.PUT_LINE('This is a famous author known for science fiction.');
        WHEN v_name = 'Stephen Hawking' THEN
            DBMS_OUTPUT.PUT_LINE('This author is renowned for his work in theoretical physics.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Author not recognized.');
    END CASE;

    -- WHILE
    DECLARE
        v_counter NUMBER := 1;

    BEGIN
        WHILE v_counter <= 5 LOOP
            DBMS_OUTPUT.PUT_LINE(v_name);
            v_counter := v_counter + 1;
        END LOOP;
    END;

    -- LOOP
    LOOP
        EXIT WHEN v_name IS NULL;
        DBMS_OUTPUT.PUT_LINE(v_name);
        v_name := NULL;
    END LOOP;

    -- FOR
    DECLARE
    CURSOR author_cur IS
        SELECT name FROM AUTHORS;
    BEGIN
        FOR author_rec IN author_cur LOOP
            DBMS_OUTPUT.PUT_LINE(author_rec.name);
        END LOOP;
    END;

    -- GOTO
    GOTO eticheta;
    DBMS_OUTPUT.PUT_LINE('v_name: ' || v_name);
    <<eticheta>>        
    DBMS_OUTPUT.PUT_LINE('v_name');

    -- FETCH
    DECLARE
        CURSOR book_cur IS
            SELECT title,publisher FROM BOOKS;
        v_title VARCHAR2(255);
        v_publisher VARCHAR2(255);
    BEGIN
        OPEN book_cur;
        LOOP
            FETCH book_cur INTO v_title, v_publisher;
            EXIT WHEN book_cur%NOTFOUND;
            DBMS_OUTPUT.PUT_LINE('Book: ' || v_title || ', Author ID: ' || v_publisher);
        END LOOP;
        CLOSE book_cur;
    END;

    --associative array
    DECLARE
        TYPE AuthorArray IS TABLE OF VARCHAR2(100) INDEX BY PLS_INTEGER;
        v_authors AuthorArray;
    BEGIN
        v_authors(1) := 'H.G. Wells';
        v_authors(2) := 'Stephen Hawking';
        v_authors(3) := 'Isaac Asimov';

        FOR i IN v_authors.FIRST .. v_authors.LAST LOOP
            DBMS_OUTPUT.PUT_LINE('Author ' || i || ': ' || v_authors(i));
        END LOOP;
    END;

    --nested table
    DECLARE
        TYPE BookTable IS TABLE OF VARCHAR2(255);
        v_books BookTable := BookTable('The Time Machine', 'A Brief History of Time', 'Foundation');
        v_book_title VARCHAR2(255);
    BEGIN
        FOR i IN 1 .. v_books.COUNT LOOP
            v_book_title := v_books(i);
            DBMS_OUTPUT.PUT_LINE('Book ' || i || ': ' || v_book_title);
        END LOOP;
    END;

    --v array
    DECLARE
        TYPE BookArray IS VARRAY(5) OF VARCHAR2(255);
        v_books BookArray := BookArray('The Time Machine', 'A Brief History of Time', 'Foundation');
    BEGIN
        FOR i IN 1 .. v_books.COUNT LOOP
            DBMS_OUTPUT.PUT_LINE('Book ' || i || ': ' || v_books(i));
        END LOOP;
    END;

    -- Eventually for encription
    DECLARE 
        v_encrypted_password VARCHAR2(2550);
        v_password_raw RAW(2550);
        v_decrypted_password VARCHAR2(255) := 'encrypted_password';
    BEGIN
        DBMS_OUTPUT.PUT_LINE('Decrypted Password: ' || v_decrypted_password);
        v_password_raw := DBMS_CRYPTO.HASH(UTL_I18N.STRING_TO_RAW(v_decrypted_password, 'AL32UTF8'), DBMS_CRYPTO.HASH_SH256);
        v_encrypted_password := RAWTOHEX(v_password_raw);
        DBMS_OUTPUT.PUT_LINE('Encrypted Password: ' || v_encrypted_password);

        
    END;


END;