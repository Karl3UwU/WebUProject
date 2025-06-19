package org.server.controllers;

import org.server.dto.NewDTO;
import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.service.NewsService;
import org.server.util.ResponseEntity;

import java.util.List;

@RequestMapping("/api/news")
public class NewsController {
    private final NewsService newsService = new NewsService();

    @GetMapping("/all")
    public ResponseEntity<List<NewDTO>> getAllNews() {
        try {
            List<NewDTO> newsList = newsService.getAllNews();
            return ResponseEntity.ok()
                    .contentType("application/json")
                    .body(newsList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}
