package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.users.dto.CareersInterestRequestDto;
import com.backend.autoapplypro.modules.users.service.SystemEmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CareersControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private SystemEmailService systemEmailService;

    @Test
    void testSubscribeToJobUpdates_Success() throws Exception {
        String email = "jobseeker@example.com";
        CareersInterestRequestDto request = CareersInterestRequestDto.builder()
                .email(email)
                .build();

        doNothing().when(systemEmailService).sendCareersInterestAcknowledgementEmail(email);

        mockMvc.perform(post("/api/v1/public/careers/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists());

        verify(systemEmailService).sendCareersInterestAcknowledgementEmail(email);
    }

    @Test
    void testSubscribeToJobUpdates_InvalidEmail_ReturnsBadRequest() throws Exception {
        CareersInterestRequestDto request = CareersInterestRequestDto.builder()
                .email("invalid-email-format")
                .build();

        mockMvc.perform(post("/api/v1/public/careers/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
