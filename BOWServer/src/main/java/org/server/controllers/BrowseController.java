package org.server.controllers;

import org.server.dto.BookDTO;
import org.server.dto.BookFilterDTO;
import org.server.dto.SuggestionDTO;
import org.server.dto.UserInfoDTO;
import org.server.enums.UserRole;
import org.server.enums.genre;
import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.PostMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.RequestBody;
import org.server.router.annotations.request.RequestHeader;
import org.server.router.annotations.request.RequestParam;
import org.server.service.AuthService;
import org.server.session.SessionManager;
import org.server.util.ResponseEntity;
import org.server.service.BrowseService;

import java.util.List;

@RequestMapping("/api/books")
public class BrowseController {

    private final BrowseService BrowseService = new BrowseService(); // or use dependency injection

    @GetMapping("/all")
    public ResponseEntity<List<BookDTO>> getAllBooks() {
        try {
            List<BookDTO> books = BrowseService.getAllBooks();
            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(books);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<List<BookDTO>> filterBooks(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam(value = "minRating", required = false) String minRatingStr) {

        Double minRating = null;
        if (minRatingStr != null) {
            try {
                minRating = Double.parseDouble(minRatingStr);
            } catch (NumberFormatException e) {
                System.out.println("Invalid minRating format: " + minRatingStr);
            }
        }
        BookFilterDTO filter = new BookFilterDTO(title, author, genre, language, minRating);
        try {
            List<BookDTO> books = BrowseService.getFilteredBooks(filter);
            return ResponseEntity.ok().contentType("application/json").body(books);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/suggest")
    public ResponseEntity<String> suggestBooks(
            @RequestParam(value = "title") String title,
            @RequestParam(value = "author") String author,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam(value = "page_count", required = false) String pageCount,
            @RequestParam(value = "genres", required = false) String genresStr
    ) {
        try {
            genre[] genres;
            if( genresStr != null && !genresStr.trim().isEmpty()) {
                System.out.println("Received genresStr: " + genresStr);
                String[] genresArr = genresStr.split(",");
                genres = new genre[genresArr.length];
                for (int i = 0; i < genresArr.length; i++) {
                    genres[i] = genre.valueOf(genresArr[i].trim().toUpperCase());
                }
            }
            else {
                genres = new genre[0];
            }
            // Validate required fields
            if (title == null || title.trim().isEmpty() || author == null || author.trim().isEmpty()) {
                return ResponseEntity.status(400)
                        .contentType("application/json")
                        .body("{\"error\": \"Both title and author are required.\"}");
            }

            BookDTO book = new BookDTO();
            book.setTitle(title.trim());
            book.setAuthor(author.trim());
            book.setLanguage(language != null ? language.trim() : null);
            book.setPage_count(pageCount != null ? Integer.parseInt(pageCount) : null);
            book.setGenres(genres);

            boolean success = org.server.service.BrowseService.submitSuggestion(book);

            if (success) {
                return ResponseEntity.ok()
                        .contentType("application/json")
                        .body("{\"message\": \"Book suggestion submitted successfully.\"}");
            } else {
                return ResponseEntity.status(500)
                        .contentType("application/json")
                        .body("{\"error\": \"Failed to submit book suggestion.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType("application/json")
                    .body("{\"error\": \"Internal server error.\"}");
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<List<BookDTO>> getTrendingBooks() {
        try {
            List<BookDTO> trendingBooks = BrowseService.getTrendingBooks();
            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(trendingBooks);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/addToBookshelf")
    public ResponseEntity<String> addToBookshelf(
            @RequestParam(value = "bookId") String bookId,
            @RequestParam(value = "email") String email) {
        try {
            int _bookId= Integer.parseInt(bookId);
            boolean success = BrowseService.addToBookshelf(_bookId, email);
            if (success) {
                return ResponseEntity.ok()
                        .contentType("application/json")
                        .body("{\"message\": \"Book added to bookshelf successfully.\"}");
            } else {
                return ResponseEntity.status(500)
                        .contentType("application/json")
                        .body("{\"error\": \"Failed to add book to bookshelf.\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType("application/json")
                    .body("{\"error\": \"Internal server error.\"}");
        }
    }

    @GetMapping("writeReview")
    public ResponseEntity<String> writeReview(
            @RequestParam(value = "bookId") String bookId,
            @RequestParam(value = "email") String email,
            @RequestParam(value = "rating") String ratingStr,
            @RequestParam(value = "review") String review) {
        try {
            int _bookId = Integer.parseInt(bookId);
            double rating = Double.parseDouble(ratingStr);
            boolean success = BrowseService.writeReview(_bookId, email, rating, review);
            if (success) {
                return ResponseEntity.ok()
                        .contentType("application/json")
                        .body("{\"message\": \"Review submitted successfully.\"}");
            } else {
                return ResponseEntity.status(500)
                        .contentType("application/json")
                        .body("{\"error\": \"Failed to submit review.\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType("application/json")
                    .body("{\"error\": \"Internal server error.\"}");
        }
    }

    @GetMapping("/getAllSuggestions")
    public ResponseEntity<List<BookDTO>> getAllSuggestions(
            @RequestHeader("Authorization") String authToken
    ) {
        try {
            //check if the user's role is admin
            String email = SessionManager.getUserEmailFromToken(authToken);
            UserInfoDTO userInfo = AuthService.getUserDataByEmail(email);
            if(userInfo == null) {
                return ResponseEntity.status(401)
                        .contentType("application/json")
                        .body(null);
            }
            if(userInfo.getRole() != UserRole.ADMIN) {
                return ResponseEntity.status(403)
                        .contentType("application/json")
                        .body(null);
            }

            List<BookDTO> suggestions = BrowseService.getAllSuggestions();
            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(suggestions);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/deleteSuggestion")
    public ResponseEntity<String> deleteSuggestion(
            @RequestParam(value = "title") String title,
            @RequestParam(value = "author") String author) {
        try {
            if (title == null || title.trim().isEmpty() || author == null || author.trim().isEmpty()) {
                return ResponseEntity.status(400)
                        .contentType("application/json")
                        .body("{\"error\": \"Both title and author are required.\"}");
            }

            boolean success = BrowseService.deleteSuggestion(title.trim(), author.trim());
            if (success) {
                return ResponseEntity.ok()
                        .contentType("application/json")
                        .body("{\"message\": \"Suggestion deleted successfully.\"}");
            } else {
                return ResponseEntity.status(500)
                        .contentType("application/json")
                        .body("{\"error\": \"Failed to delete suggestion.\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType("application/json")
                    .body("{\"error\": \"Internal server error.\"}");
        }
    }

    @PostMapping("/postSuggestion")
    public ResponseEntity<String> postSuggestion(@RequestBody SuggestionDTO suggestionDTO) {
        String title = suggestionDTO.getTitle();
        String author = suggestionDTO.getAuthor();
        String language = suggestionDTO.getLanguage();
        String pageCount = suggestionDTO.getPageCount();
        String genresStr = suggestionDTO.getGenres();

        try {
            System.out.println("Received genresStr: " + genresStr);
            String[] genresArr = genresStr.split(",");
            genre[] genres = new genre[genresArr.length];
            for (int i = 0; i < genresArr.length; i++) {
                genres[i] = genre.valueOf(genresArr[i].trim().toUpperCase());
            }
            // Validate required fields
            if (title == null || title.trim().isEmpty() || author == null || author.trim().isEmpty()) {
                return ResponseEntity.status(400)
                        .contentType("application/json")
                        .body("{\"error\": \"Both title and author are required.\"}");
            }

            BookDTO book = new BookDTO();
            book.setTitle(title.trim());
            book.setAuthor(author.trim());
            book.setLanguage(language != null ? language.trim() : null);
            book.setPage_count(pageCount != null ? Integer.parseInt(pageCount) : null);
            book.setGenres(genres);

            boolean success = BrowseService.submitSuggestionAsBook(book);

            if (success) {
                return ResponseEntity.ok()
                        .contentType("application/json")
                        .body("{\"message\": \"Book suggestion submitted successfully.\"}");
            } else {
                return ResponseEntity.status(500)
                        .contentType("application/json")
                        .body("{\"error\": \"Failed to submit book suggestion.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType("application/json")
                    .body("{\"error\": \"Internal server error.\"}");
        }
    }

}
