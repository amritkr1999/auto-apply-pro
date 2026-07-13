package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.dto.PlaqueCardContactRequest;
import com.backend.autoapplypro.modules.users.dto.PlaqueCardDto;
import com.backend.autoapplypro.modules.users.dto.PublicPlaqueCardResponse;

public interface PlaqueCardService {
    PlaqueCardDto getPlaqueCardByUserId(Long userId);
    PlaqueCardDto updatePlaqueCard(Long userId, PlaqueCardDto dto);
    PublicPlaqueCardResponse getPublicPlaqueCardByUsername(String username);
    void sendContactEmail(String username, PlaqueCardContactRequest request);
}
