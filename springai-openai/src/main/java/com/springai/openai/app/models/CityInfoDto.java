package com.springai.openai.app.models;

public record CityInfoDto(
        String city,
        String country,
        Integer population,
        String description
) { }
