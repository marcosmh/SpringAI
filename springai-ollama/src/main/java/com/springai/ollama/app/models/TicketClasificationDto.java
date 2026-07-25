package com.springai.ollama.app.models;

public record TicketClasificationDto(
        String category,
        String reason,
        Integer priority
) { }
