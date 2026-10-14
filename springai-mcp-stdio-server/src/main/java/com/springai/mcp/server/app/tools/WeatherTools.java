package com.springai.mcp.server.app.tools;

import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.stereotype.Component;

@Component
public class WeatherTools {

    @McpTool(description = "Gets the current temperature and weather for a city.")
    public String getCurrentWeatherTemperature(String city) {
        return switch (city.toLowerCase()) {
            case "santiago" -> "La temperatura actual de santiago es de 22 grados C";
            case "madrid" -> "La temperatura actual de madrid es de 16 grados C";
            case "buenos aires" -> "La temperatura actual de buenos aires es de 24 grados C";
            case "cuidad de mexico" -> "La temperatura actual de santiago es de 32 grados C";
            default -> "No tengo datos de temperaturas para la ciudad: " + city;
        };
    }

    @McpTool(description = "recommends clothing based on the city's weather")
    public String getWeatherRecommendation(String city) {
        return switch (city.toLowerCase()) {
            case "santiago" -> "En Santiago se pued usar ropa ligera y una chaqueta delgada para la tarde";
            case "madrid" -> "En Madrid conviene llevar una chaqueta ligera durante el día y en la tarde noche bien abrigado";
            case "buenos aires" -> "En Buenos Aires puedes usar ropa fresca y comoda";
            case "cuidad de mexico" -> "En CDMX  se recomienda llevar  Camisa manga corta o sudadera y short";
            default -> "No recomendaciones del clima para la ciudad: " + city;
        };

    }

}
