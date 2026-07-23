package com.springai.openai.app.controllers;

import com.springai.openai.app.services.AIService;

import org.springframework.web.bind.annotation.*;

@RestController
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/greeting")
    public String greeting(@RequestParam(defaultValue = "MarkCode") String name) {
        return aiService.greeting(name);
    }

    @PostMapping("/chat")
    public String chat(@RequestBody String prompt) {
        return aiService.chat(prompt);
    }

    
}

