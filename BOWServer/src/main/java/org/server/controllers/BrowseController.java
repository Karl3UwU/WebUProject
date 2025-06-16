package org.server.controllers;

import org.server.dto.BookDTO;
import org.server.dto.BookFilterDTO;
import org.server.router.annotations.mapping.GetMapping;
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
        BookFilterDTO filter = new BookFilterDTO(title, author, language, minRating);
        try {
            List<BookDTO> books = BrowseService.getFilteredBooks(filter);
            return ResponseEntity.ok().contentType("application/json").body(books);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }


}
