package com.springai.mcp.client.app.services;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class WeatherAiServiceImpl implements WeatherAiService {

    private final ChatClient chatClient;

    public WeatherAiServiceImpl(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public String ask(String question) {
        return chatClient
                .prompt()
                .system("""
                        Eres un asistente de clima.
                        Si necesitas datos del clima o recomendaciones de ropa usa las tools disponibles.
                        Responde siempre en español,
                        """)
                .user(question)
                .call()
                .content();
    }
}
