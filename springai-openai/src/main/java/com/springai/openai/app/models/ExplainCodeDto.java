package com.springai.openai.app.models;

import java.util.List;

public record ExplainCodeDto(
        String language,
        String summary,
        List<String> explainCode,
        String explainFinal
) { }
