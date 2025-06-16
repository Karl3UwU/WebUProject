package org.server.controllers;

import org.server.dto.ReviewDTO;
import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.RequestParam;
import org.server.service.ReviewsService;
import org.server.util.ResponseEntity;

import java.util.List;

@RequestMapping("/api/reviews")
public class ReviewsController {

    @GetMapping("/all")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        try {
            List<ReviewDTO> reviews = ReviewsService.getAllReviews();
            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(reviews);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ReviewDTO>> filterReviews(
            @RequestParam(value = "bookTitle", required = false) String bookTitle,
            @RequestParam(value = "username", required = false) String username) {
        try {
            List<ReviewDTO> reviews = ReviewsService.getFilteredReviews(bookTitle, username);
            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}
