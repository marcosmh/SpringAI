package com.springai.audio.app.controllers;

import com.springai.audio.app.services.TextToSpeechService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TextToSpeechController {

    private final TextToSpeechService textToSpeechService;

    public TextToSpeechController(TextToSpeechService textToSpeechService) {
        this.textToSpeechService = textToSpeechService;
    }

    @GetMapping("/api/tts")
    public ResponseEntity<byte[]> createNarration(@RequestParam String text) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=audio.mp3")
                .body(textToSpeechService.createNarration(text));

    }

}
