Demo video for the project: https://youtu.be/CeJteLBtjaA

Also, documentation (C3 & C4 diagrams) are in the file projects.

Books of Web
Books of Web is a community-driven web application for discovering, reviewing, and sharing books. It features user authentication, book browsing and filtering, reviews, personal bookshelves, and an admin dashboard for managing book suggestions.

Table of Contents
-Features
-Tech Stack
-Project Structure
-Database Schema
-Setup & Installation
-Running the Project
-Usage
-API Endpoints
-Contributing
-License

Features
User Registration & Login: Secure authentication with roles (user/admin).
Book Browsing: Filter books by title, author, genre, language, and rating.
Book Details: View detailed info, cover, and reviews for each book.
Personal Bookshelf: Add books to your shelf, update reading status, and export your list.
Book Reviews: Write, view, and manage reviews for books.
Book Suggestions: Suggest new books for inclusion; admins can approve or reject.
Admin Dashboard: Manage book suggestions and user submissions.
Responsive UI: Modern, mobile-friendly design.
Export: Export book lists and reviews as CSV or DocBook XML.
Accessibility: High-contrast text, keyboard navigation, and accessible forms.

Tech Stack
Backend: Java 24, Maven, custom HTTP server, RESTful API
Frontend: HTML5, CSS3, JavaScript (Vanilla)
Database: Oracle SQL (schema and triggers in sql)
ORM/DAO: Custom JDBC-based data access
Authentication: JWT-based sessions
Other: dotenv-java for environment config, Gson for JSON serialization

Project Structure
```
.
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── org/server/
│   │   │       ├── controllers/      # API controllers (REST endpoints)
│   │   │       ├── dto/              # Data Transfer Objects
│   │   │       ├── enums/            # Enums (e.g., genre, UserRole)
│   │   │       ├── model/            # Core domain models (Book, User, Review, etc.)
│   │   │       ├── router/           # HTTP routing and annotations
│   │   │       ├── service/          # Business logic/services
│   │   │       ├── session/          # Session management
│   │   │       └── util/             # Utilities (DB connection, etc.)
│   │   └── resources/
│   │       ├── css/                  # Stylesheets
│   │       ├── js/                   # Frontend JavaScript
│   │       ├── sql/                  # Database schema and sample data
│   │       ├── *.html                # HTML pages (SPA-like navigation)
│   │       └── images/               # Static images/icons
│   └── test/                         # (Optional) Unit/integration tests
├── pom.xml                           # Maven build file
├── .env                              # Environment variables (DB credentials, etc.)
└── README.md                         # Project documentation
```

Database Schema
Users: user_id, username, email, password, role
Books: book_id, title, publisher, year_published, category_id, author_id, edition
Authors: author_id, name, bio
Categories: category_id, category_name
Reviews: review_id, user_id, book_id, content, rating
ReadingList: list_id, user_id, book_id, status
Messages: message_id, sender_id, receiver_id, content, sent_at
Bookmarks: bookmark_id, user_id, book_id, created_at
See schema.sql for full details.

Setup & Installation
Clone the repository
```
git clone https://github.com/yourusername/booksofweb.git
cd booksofweb
```
Configure Environment

Copy .env.example to .env and set your database credentials and secrets.
Database

Set up an Oracle database.
Run the schema and populate scripts in sql to create tables and seed data.
Build the Project
```
mvn clean package
```
Running the Project
Start the server:
```
java -jar target/BOWServer-1.0-SNAPSHOT-jar-with-dependencies.jar
```
The server will run on the port specified in your .env file (default: 8080).

Access the app:
Open http://localhost:8080/index.html in your browser.

Usage
Browse Books:
Use filters on browse.html to search by title, author, genre, language, or rating.

Book Details:
Click a book to view details, add to your shelf, or write a review.

Profile:
Manage your bookshelf and reviews on profile.html.

Suggest a Book:
Use submissions.html to suggest new books.

Admin Dashboard:
Admins can review and approve suggestions on dashboard.html.

API Endpoints
/api/auth/register — Register a new user
/api/auth/login — Login and receive a JWT
/api/books/filter — Filter books (GET params: title, author, genre, language, minRating)
/api/books/writeReview — Submit a review for a book
/api/books/addToBookshelf — Add a book to user's shelf
/api/reviews/filter — Filter reviews by book title or username
/api/books/suggest — Suggest a new book (POST)
/api/books/getAllSuggestions — Get all book suggestions (admin)
/api/books/deleteSuggestion — Delete a suggestion (admin)
...and more (see controllers in ```controllers```)

Contributing
Fork the repository
Create a feature branch ```(git checkout -b feature/my-feature)```
Commit your changes ```(git commit -am 'Add new feature')```
Push to the branch ```(git push origin feature/my-feature)```
Open a Pull Request

License
This project is licensed under the MIT License.

Questions or feedback?
Open an issue or contact booksofweb@openforge.sh.

Enjoy discovering your next great read!

Just copy everything above and paste it into your README.md or readme.txt file on GitHub.

