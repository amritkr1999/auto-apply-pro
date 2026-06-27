package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.outreach.service.OutreachSchedulerService;
import com.backend.autoapplypro.modules.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OutreachSchedulerServiceTest {

    @Mock
    private EmailQueueRepository queueRepository;

    @InjectMocks
    private OutreachSchedulerService schedulerService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCalculateNextScheduleTime_FreshStart() {
        User user = new User();
        user.setId(1L);
        user.setOutreachMinIntervalMin(10);
        user.setOutreachMaxIntervalMin(30);
        user.setOutreachTimezone("UTC");
        user.setOutreachSlotStart(LocalTime.of(9, 0));
        user.setOutreachSlotEnd(LocalTime.of(17, 0));
        user.setOutreachSkipWeekends(false); // disable weekends check to make it simple

        when(queueRepository.findFirstByUserIdAndScheduledAtIsNotNullOrderByScheduledAtDesc(1L))
                .thenReturn(Optional.empty());

        LocalDateTime nextTime = schedulerService.calculateNextScheduleTime(user);

        assertNotNull(nextTime);
        assertTrue(nextTime.isAfter(LocalDateTime.now()));
    }
}
