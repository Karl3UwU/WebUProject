CONNECT student_app1/password123
set SERVEROUTPUT ON;


DECLARE
    u1 User_interface := User_default(1, 'jane', 'pass', 'jane@example.com', 'user');
    u2 User_interface := User_admin(2, 'admin', 'admin123', 'admin@example.com', 'admin');
BEGIN
    DBMS_OUTPUT.PUT_LINE(u1.get_role); -- Should print: Default
    DBMS_OUTPUT.PUT_LINE(u2.get_role); -- Should print: Admin

    INSERT INTO Users (user_id, username, password, email, role)
    VALUES (u1.user_id, u1.username, u1.password, u1.email, u1.role);
    INSERT INTO Users (user_id, username, password, email, role)
    VALUES (u2.user_id, u2.username, u2.password, u2.email, u2.role);
END;



