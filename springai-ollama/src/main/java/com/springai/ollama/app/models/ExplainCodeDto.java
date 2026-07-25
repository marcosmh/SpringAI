package com.springai.ollama.app.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ExplainCodeDto(
        String language,
        String summary,
        @JsonProperty("line_by_line")
        List<LineExplication> lineByLine,
        @JsonProperty("exlain_final")
        String explainFinal
) {
    public record LineExplication(Integer line, String explication) {}
}

