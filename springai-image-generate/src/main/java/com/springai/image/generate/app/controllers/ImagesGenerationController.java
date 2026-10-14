package com.springai.image.generate.app.controllers;

import com.springai.image.generate.app.services.ImagesGenerationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ImagesGenerationController {

    private final ImagesGenerationService imagesGenerationService;

    public ImagesGenerationController(ImagesGenerationService imagesGenerationService) {
        this.imagesGenerationService = imagesGenerationService;
    }

    @GetMapping("/api/images/generate")
    public ResponseEntity<byte[]> generateImage(@RequestParam String prompt) {
        byte[] imageBytes = imagesGenerationService.geneationImage(prompt);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=generated.png")
                .contentType(MediaType.IMAGE_PNG)
                .body(imageBytes);
    }

}
