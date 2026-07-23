package com.springai.openai.app.services;

import com.springai.openai.app.models.CodeDto;
import com.springai.openai.app.models.Requirement;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

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

    @Override
    public CodeDto generateCode(Requirement requirement) {
        String code = chatClient
                .prompt()
                .system(""" 
                  Eres un Experto Desarrollador Senior en Java, Jakarta y Spring Boot 4.
                  Con buenas practicas responde solo preguntas o requirimientos relacionados con Java y Spring Boot 4. 
                  Pero nada mas, ningun otro lenguaje ni contexto, solo programacion Java
                  """)
                .user(requirement.requirement())
                .call()
                .content();

        return new CodeDto(code);
    }

    @Override
    public String explain(String code) {

        String promptSystem = """
                        Eres un Profesor experto en programacion.
                        Explica paso a paso de forma sencilla.
                        """;
        PromptTemplate promptTemplate = new PromptTemplate("Explica el codigo linea por linea: {code}");
        String userPrompt = promptTemplate.render(Map.of("code",code));

        return chatClient
                .prompt()
                .system(promptSystem)
                .user(userPrompt)
                .call()
                .content();
    }
}
