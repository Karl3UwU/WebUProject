package org.server.controllers;

import org.server.dto.BookDTO;
import org.server.dto.BookFilterDTO;
import org.server.enums.genre;
import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.PostMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.RequestParam;
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
            @RequestParam(value = "page_count", required = false) Integer pageCount,
            @RequestParam(value = "genres", required = false) String[] genresStr
    ) {
        try {
            // Validate required fields
            if (title == null || title.trim().isEmpty() || author == null || author.trim().isEmpty()) {
                return ResponseEntity.status(400)
                        .contentType("application/json")
                        .body("{\"error\": \"Both title and author are required.\"}");
            }

            // Convert String[] to genre[]
            genre[] genres = null;
            if (genresStr != null && genresStr.length > 0) {
                genres = new genre[genresStr.length];
                for (int i = 0; i < genresStr.length; i++) {
                    try {
                        genres[i] = genre.valueOf(genresStr[i].toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(400)
                                .contentType("application/json")
                                .body("{\"error\": \"Invalid genre: " + genresStr[i] + "\"}");
                    }
                }
            }

            BookDTO book = new BookDTO();
            book.setTitle(title.trim());
            book.setAuthor(author.trim());
            book.setLanguage(language != null ? language.trim() : null);
            book.setPage_count(pageCount);
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





}
