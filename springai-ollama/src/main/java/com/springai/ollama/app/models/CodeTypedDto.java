package com.springai.ollama.app.models;

import java.util.List;

public record CodeTypedDto(
    String requirements,
    String summary,
    String code,
    List<String> notes
) { }
