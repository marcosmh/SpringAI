package com.springai.openai.app.controllers;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IAController {

    private final ChatClient chatClient;

    public IAController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/greeting")
    public String greeting() {
        return this.chatClient
                .prompt()
                .user("Dime hola mundo en frances, con mi nombre imarkcode una sola linea.")
                .call()
                .content();
    }

    
}

