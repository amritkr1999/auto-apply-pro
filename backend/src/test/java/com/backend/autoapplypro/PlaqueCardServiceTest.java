package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.users.dto.PlaqueCardDto;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.service.PlaqueCardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PlaqueCardServiceTest {

    @Autowired
    private PlaqueCardService plaqueCardService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfessionalProfileRepository professionalProfileRepository;

    @Test
    void testGetDefaultPlaqueCardAndModify() {
        // 1. Create a dummy User & Candidate
        User user = User.builder()
                .email("test_card_user@example.com")
                .passwordHash("password")
                .role(UserRole.CANDIDATE)
                .name("Alex Card Tester")
                .mobile("9876543210")
                .username("cardtester")
                .isProfilePublic(true)
                .build();
        user = userRepository.save(user);

        ProfessionalProfile candidate = ProfessionalProfile.builder()
                .user(user)
                .summary("Highly motivated tester of plaque cards.")
                .build();
        candidate = professionalProfileRepository.save(candidate);
        user.getProfessionalProfiles().add(candidate);

        // 2. Fetch Plaque Card (should generate defaults)
        PlaqueCardDto cardDto = plaqueCardService.getPlaqueCardByUserId(user.getId());
        assertNotNull(cardDto);
        assertNotNull(cardDto.getSettings());
        assertEquals("Alex Card Tester", cardDto.getSettings().get("displayName"));
        assertEquals(true, cardDto.getSettings().get("showSummary"));

        // 3. Update Plaque Card settings
        Map<String, Object> newSettings = new HashMap<>(cardDto.getSettings());
        newSettings.put("displayName", "Alex the Great");
        newSettings.put("showSummary", false);
        cardDto.setSettings(newSettings);

        PlaqueCardDto updatedDto = plaqueCardService.updatePlaqueCard(user.getId(), cardDto);
        assertNotNull(updatedDto);
        assertEquals("Alex the Great", updatedDto.getSettings().get("displayName"));
        assertEquals(false, updatedDto.getSettings().get("showSummary"));

        // 4. Load Public view
        var publicResponse = plaqueCardService.getPublicPlaqueCardByUsername("cardtester");
        assertNotNull(publicResponse);
        assertEquals("Alex Card Tester", publicResponse.getName()); // user's DB name
        assertEquals("Alex the Great", publicResponse.getCard().getSettings().get("displayName")); // overridden display name
        assertEquals(false, publicResponse.getCard().getSettings().get("showSummary"));
    }
}
