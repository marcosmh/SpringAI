package com.springai.rag.app.services;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface DocumentIndexService {

    void indexDocument(MultipartFile file) throws IOException;

}
