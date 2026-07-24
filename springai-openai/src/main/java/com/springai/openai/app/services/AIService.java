package com.springai.openai.app.services;

import com.springai.openai.app.models.CityInfoDto;
import com.springai.openai.app.models.CodeDto;
import com.springai.openai.app.models.Requirement;
import com.springai.openai.app.models.TicketClasificationDto;

public interface AIService {

    String greeting(String name);

    String chat(String prompt);

    String chatExpertSpring(String prompt);

    CodeDto generateCode(Requirement requirement);

    String explain(String code);

    String chatFormat(String topic);

    String analyze(String text);

    CityInfoDto cityInfo(String city);

    TicketClasificationDto clasifyTyped(String text);

}
