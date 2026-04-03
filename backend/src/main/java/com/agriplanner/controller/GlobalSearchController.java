package com.agriplanner.controller;

import com.agriplanner.model.*;
import com.agriplanner.repository.*;
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
    
    private final CropDefinitionRepository cropRepository;
    private final AnimalDefinitionRepository animalRepository;
    private final ShopItemRepository shopRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam("q") String query) {
        Map<String, Object> results = new HashMap<>();
        results.put("query", query);
        
        List<Object> combinedResults = new ArrayList<>();
        
        // Search Crops
        combinedResults.addAll(cropRepository.findAll());
        // Search Animals
        combinedResults.addAll(animalRepository.findAll());
        // Search Shop Items (Products)
        combinedResults.addAll(shopRepository.findAll());
        
        results.put("results", combinedResults);
        
        return ResponseEntity.ok(results);
    }
}
