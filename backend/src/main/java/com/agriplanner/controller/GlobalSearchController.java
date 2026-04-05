package com.agriplanner.controller;

import com.agriplanner.model.*;
import com.agriplanner.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.*;
import java.util.stream.Collectors;

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
        
        // Convert query for fuzzy matching (Regex / LIKE simulation)
        String fuzzyRegex = ".*" + query.toLowerCase().replaceAll("\\s+", ".*") + ".*";
        
        // Search Crops with fuzzy matching
        List<CropDefinition> crops = cropRepository.findAll().stream()
            .filter(c -> c.getName() != null && c.getName().toLowerCase().matches(fuzzyRegex))
            .collect(Collectors.toList());
        combinedResults.addAll(crops);
        
        // Search Animals with fuzzy matching
        List<AnimalDefinition> animals = animalRepository.findAll().stream()
            .filter(a -> a.getName() != null && a.getName().toLowerCase().matches(fuzzyRegex))
            .collect(Collectors.toList());
        combinedResults.addAll(animals);
        
        // Search Shop Items (Products) with fuzzy matching
        List<ShopItem> shopItems = shopRepository.findAll().stream()
            .filter(s -> s.getName() != null && s.getName().toLowerCase().matches(fuzzyRegex))
            .collect(Collectors.toList());
        combinedResults.addAll(shopItems);
        
        results.put("results", combinedResults);
        
        return ResponseEntity.ok(results);
    }
}
