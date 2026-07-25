package com.springai.ollama.app.models;

public record CityInfoDto(
        String city,
        String country,
        Integer population,
        String description
) { }
