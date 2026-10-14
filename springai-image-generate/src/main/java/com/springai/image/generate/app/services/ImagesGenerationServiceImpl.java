package com.springai.image.generate.app.services;


import org.springframework.ai.image.ImageModel;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class ImagesGenerationServiceImpl implements ImagesGenerationService {

    private final ImageModel imageModel;

    public ImagesGenerationServiceImpl(ImageModel imageModel) {
        this.imageModel = imageModel;
    }

    @Override
    public byte[] geneationImage(String prompt) {
        ImageResponse response = imageModel.call(new ImagePrompt(prompt));
        String b64 = response.getResults()
                .getFirst()
                .getOutput()
                .getB64Json();
        return Base64.getDecoder().decode(b64);
    }

}
