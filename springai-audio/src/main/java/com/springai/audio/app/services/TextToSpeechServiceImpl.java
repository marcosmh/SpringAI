package com.springai.audio.app.services;

import org.springframework.ai.audio.tts.TextToSpeechModel;
import org.springframework.ai.audio.tts.TextToSpeechPrompt;
import org.springframework.stereotype.Service;

@Service
public class TextToSpeechServiceImpl implements TextToSpeechService{

    private final TextToSpeechModel model;

    public TextToSpeechServiceImpl(TextToSpeechModel model) {
        this.model = model;
    }

    @Override
    public byte[] createNarration(String text) {
        return model.call(new TextToSpeechPrompt(text)).getResult().getOutput();
    }


}
