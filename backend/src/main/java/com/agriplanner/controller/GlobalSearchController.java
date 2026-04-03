package com.agriplanner.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.*;

/**
 * Global Search Controller for Voice Queries
 */
@RestController
@RequestMapping("/api/global-search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GlobalSearchController {
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam("q") String query) {
        Map<String, Object> results = new HashMap<>();
        results.put("query", query);
        results.put("results", new ArrayList<>());
        
        return ResponseEntity.ok(results);
    }
}
