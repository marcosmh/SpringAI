package com.springai.rag.app.controllers;

import com.springai.rag.app.services.DocumentIndexService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
public class IndexController {


    private final DocumentIndexService documentIndexService;

    public IndexController(DocumentIndexService documentIndexService) {
        this.documentIndexService = documentIndexService;
    }

    @PostMapping("/index-upload/pdf")
    public Map<String, String> uploadPdf(@RequestParam("file") MultipartFile file) {
        if(file == null || file.isEmpty()) {
            return Map.of("message", "File is empty");
        }

        if(file.getContentType() == null || !file.getContentType().startsWith("application/pdf")) {
            return Map.of("message","File is not a PDF File");
        }

        try {
            documentIndexService.indexDocument(file);
            return Map.of("message","Document indexed correctly");
        } catch (Exception e) {
            return Map.of("message","Error al indexar el documento: ".concat(e.getMessage()));
        }


    }



}
