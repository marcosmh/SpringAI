package com.springai.openai.app.models;

public record TicketClasificationDto(
        String category,
        String reason,
        Integer priority
) { }
