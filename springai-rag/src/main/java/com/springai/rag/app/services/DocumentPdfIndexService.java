package com.springai.rag.app.services;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class DocumentPdfIndexService implements DocumentIndexService {

    private final VectorStore vectorStore;

    public DocumentPdfIndexService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @Override
    public void indexDocument(MultipartFile file) throws IOException {
        Resource resource = new InputStreamResource(file.getInputStream());
        PagePdfDocumentReader reader = new PagePdfDocumentReader(resource);
        List<Document> documents = reader.get();
        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(350)
                .withMinChunkLengthToEmbed(5)
                .withMaxNumChunks(10000)
                .withKeepSeparator(true)
                .build();

        List<Document> chunks = splitter.apply(documents);
        String filename = file.getOriginalFilename() != null && !file.getOriginalFilename().isEmpty()
                ? file.getOriginalFilename() : "uploaded-file.pdf";

        chunks.forEach(doc ->
                doc.getMetadata().put("source", filename));
        vectorStore.add(chunks);

    }


}
