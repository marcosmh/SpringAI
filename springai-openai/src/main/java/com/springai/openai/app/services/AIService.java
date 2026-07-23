package com.springai.openai.app.services;

public interface AIService {

    String greeting(String name);

    String chat(String prompt);
}
