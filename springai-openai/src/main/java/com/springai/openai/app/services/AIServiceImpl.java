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
    public String greeting() {
        return this.chatClient
                .prompt()
                .user("Dime hola mundo en frances, con mi nombre imarkcode una sola linea.")
                .call()
                .content();
    }
}
