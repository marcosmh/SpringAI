package com.springai.openai.app.controllers;

import com.springai.openai.app.services.AIService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/greeting")
    public String greeting() {
        return aiService.greeting();
    }

    
}

