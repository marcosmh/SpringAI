package com.springai.openai.app.services;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AIServiceImpl implements AIService {

    private final ChatClient chatClient;


    public AIServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public String greeting(String name) {
        return this.chatClient
                .prompt()
                .system("Responde siempre en Aleman y en una sola linea")
                .user("Dime hola mundo, con mi nombre %s".formatted(name))
                .call()
                .content();
    }

    @Override
    public String chat(String prompt) {
        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }

    @Override
    public String chatExpertSpring(String prompt) {
        return chatClient
                .prompt()
                .system("Eres un experto en Java y Spring Boot. Responde de forma clara y simple")
                .user(prompt)
                .call()
                .content();

    }
}
