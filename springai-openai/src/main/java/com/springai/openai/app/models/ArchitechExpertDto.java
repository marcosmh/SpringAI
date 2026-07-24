package com.springai.openai.app.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ArchitechExpertDto(
        String question,
        String recomendation,
        List<String> pros,
        List<String> cons,
        @JsonProperty("final_decision")
        String finalDecision
 ) { }
