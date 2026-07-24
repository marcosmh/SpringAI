package com.springai.openai.app.services;

import com.springai.openai.app.models.*;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
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

    @Override
    public String chatFormat(String topic) {
        return chatClient
                .prompt()
                .system("""
                        Eres un experto en tecnologia.
                        Responde usando:
                        - Titulo
                        - Lista de 3 puntos importantes
                        - Un ejemplo practico
                        
                        """)
                .user(topic)
                .call()
                .content();
    }

    @Override
    public String analyze(String text) {
        String textSystem = """
                Eres un experto en Analisis de Texto.
                Devuelve solo json valido.
                Formato exacto:
                {
                  "summary": "string",
                  "key_points": ["string","string","string"],
                  "sentirment": "positive[meutral]negative"
                }
                """;

        return chatClient
                .prompt()
                .system(textSystem)
                .user(text)
                .call()
                .content();

    }

    @Override
    public CityInfoDto cityInfo(String city) {

        String textPrompt = """
                Eres un asistente experto en Geografia.
                Responde solo con la informacion correcta y formato en json.
                """;
        String userPrompt = """
                Resuelve la informacion en español de la ciudad %s con este formato:
                    {
                        "city": "string",
                        "country": "string",
                        "population": number,
                        "description": "string"
                    }
                """.formatted(city);

        return chatClient
                .prompt()
                .system(textPrompt)
                .user(userPrompt)
                .call()
                .entity(CityInfoDto.class);
    }

    @Override
    public TicketClasificationDto clasifyTyped(String text) {
        String textSystem = """
                Eres un sistema de clasificacion de tickets.
                Responde solo en JSON valido.
                """;
        String textUser = """
                Clasifica el siguiente texto en una catagoria y prioridad.
                Categorias:
                - Soporte
                - Ventas
                - Reclamo
                
                Formato:
                {
                  "category": "string",
                  "reason": "string,
                  "priority": number
                }
                
                Texto:
                 %s
                """.formatted(text);

        return chatClient
                .prompt()
                .system(textSystem)
                .user(textUser)
                .call()
                .entity(TicketClasificationDto.class);
    }

    @Override
    public CodeTypedDto generateCodeTyped(Requirement requirement) {

        String textSystem = """
                Eres un Experto Desarrollador Senior en Java, Spring Boot 4.
                Con buenas practicas de programación
                """;
        String textUser = """
                 Responde en este formato json usando el DTO CodeTypedDto.
                 
                 Texto:
                 %s
                 
                """.formatted(requirement.requirement());

        return chatClient
                .prompt()
                .system(textSystem)
                .user(textUser)
                .call()
                .entity(CodeTypedDto.class);
    }

    @Override
    public ExplainCodeDto explainCodeX(String code) {

        String promptSystem = """
                        Eres un Profesor experto en programacion.
                        Explica paso a paso de forma sencilla.
                        Responde en este formato json usando el DTO ExplainCodeDto.
                        """;
        PromptTemplate promptTemplate = new PromptTemplate("""
        Explica el codigo linea por linea: {code}
        """);

        String userPrompt = promptTemplate.render(Map.of("code",code));

        IO.println(userPrompt);

        return chatClient
                .prompt()
                .system(promptSystem)
                .user(userPrompt)
                .call()
                .entity(ExplainCodeDto.class);

    }

    @Override
    public ArchitechExpertDto architechExpert(String prompt) {
        String promptSystem = """
                Eres un experto Arquitecto de Software en Microservicios, Spring Boot y
                Arquitectura de Sistemas.
                Devuelve solo JSON validdo.
                Responde en este formato json usando el DTO ArchitechExpertDto.
                """;

        return chatClient
                .prompt()
                .system(promptSystem)
                .user(prompt)
                .call()
                .entity(ArchitechExpertDto.class);
    }

    @Override
    public Map<String, Object> chatMetadata(String prompt) {
        ChatResponse response = chatClient
                .prompt()
                .user(prompt)
                .call()
                .chatResponse();

        return Map.of("answer", response.getResult().getOutput().getText(),
                "metadata",response.getMetadata());
    }
}
