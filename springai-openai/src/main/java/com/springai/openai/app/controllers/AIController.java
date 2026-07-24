package com.springai.openai.app.controllers;

import com.springai.openai.app.models.CodeDto;
import com.springai.openai.app.models.Requirement;
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

    @PostMapping("/chat-expert")
    public String chatExpert(@RequestBody String prompt) {
        return aiService.chat(prompt);
    }

    @PostMapping("/generate-code")
    public CodeDto generateCode(@RequestBody Requirement requirement) {
        return aiService.generateCode(requirement);
    }

    @PostMapping("/explain-code")
    public String explainCode(@RequestBody String code) {
        return aiService.explain(code);
    }

    @PostMapping("/chat-format")
    public String chatFormat(@RequestBody String prompt) {
        return aiService.chatFormat(prompt);
    }

    @PostMapping("/analyze-text")
    public String analyzeText(@RequestBody String text) {
        return aiService.analyze(text);
    }



}

