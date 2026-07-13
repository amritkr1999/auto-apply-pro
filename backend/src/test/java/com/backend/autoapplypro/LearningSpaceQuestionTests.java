package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.learning.dto.AdminReviewRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionRatingRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionResponseDto;
import com.backend.autoapplypro.modules.learning.model.*;
import com.backend.autoapplypro.modules.learning.repository.PracticeQuestionRepository;
import com.backend.autoapplypro.modules.learning.repository.QuestionSubmissionRepository;
import com.backend.autoapplypro.modules.learning.repository.TopicRepository;
import com.backend.autoapplypro.modules.learning.service.QuestionRatingService;
import com.backend.autoapplypro.modules.learning.service.QuestionSubmissionService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class LearningSpaceQuestionTests {

    @Autowired
    private QuestionSubmissionService submissionService;

    @Autowired
    private QuestionRatingService ratingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private QuestionSubmissionRepository submissionRepository;

    @Autowired
    private PracticeQuestionRepository questionRepository;

    private User candidateUser;
    private User adminUser;
    private Topic subjectTopic;
    private Topic subtopicTopic;

    @BeforeEach
    void setUp() {
        // Create test candidate
        candidateUser = User.builder()
                .email("candidate_contributor@example.com")
                .passwordHash("hashed")
                .role(UserRole.CANDIDATE)
                .name("Alice Contributor")
                .mobile("9123456780")
                .username("alice_contrib")
                .build();
        candidateUser = userRepository.save(candidateUser);

        // Create test admin
        adminUser = User.builder()
                .email("admin_moderator@example.com")
                .passwordHash("hashed")
                .role(UserRole.ADMIN)
                .name("Bob Moderator")
                .mobile("9123456781")
                .username("bob_admin")
                .build();
        adminUser = userRepository.save(adminUser);

        // Create parent subject topic
        subjectTopic = Topic.builder()
                .name("Rust Language")
                .description("All about Rust language rules")
                .icon("rust")
                .build();
        subjectTopic = topicRepository.save(subjectTopic);

        // Create child topic
        subtopicTopic = Topic.builder()
                .name("Ownership & Lifetimes")
                .description("Borrow checker rules")
                .parentTopic(subjectTopic)
                .build();
        subtopicTopic = topicRepository.save(subtopicTopic);
    }

    @Test
    void testQuestionSubmissionLifecycle() {
        // 1. Submit Question DTO
        QuestionSubmissionRequestDto request = QuestionSubmissionRequestDto.builder()
                .title("Rust Borrow Checker")
                .content("Which of the following compiles in Rust?")
                .difficulty(DifficultyLevel.HARD)
                .choices(Arrays.asList("Only one mutable reference", "Multiple mutable references", "Mutable and immutable concurrently"))
                .correctAnswer("Only one mutable reference")
                .explanation("Rust borrow checker enforces single writer OR multiple readers rule.")
                .subjectId(subjectTopic.getId())
                .topicId(subtopicTopic.getId())
                .build();

        QuestionSubmissionResponseDto response = submissionService.submitQuestion(request, candidateUser.getEmail());
        assertNotNull(response);
        assertEquals("Rust Borrow Checker", response.getTitle());
        assertEquals(QuestionSubmissionStatus.PENDING, response.getStatus());
        assertEquals("Alice Contributor", response.getSubmittedByName());

        // Check it appears in pending
        List<QuestionSubmissionResponseDto> pending = submissionService.getPendingSubmissions();
        assertFalse(pending.isEmpty());
        assertTrue(pending.stream().anyMatch(s -> s.getId().equals(response.getId())));

        // 2. Reject Submission
        AdminReviewRequestDto rejectDto = AdminReviewRequestDto.builder()
                .status(QuestionSubmissionStatus.REJECTED)
                .feedback("Please explain options in details.")
                .build();

        QuestionSubmissionResponseDto rejectedResponse = submissionService.reviewSubmission(response.getId(), rejectDto, adminUser.getEmail());
        assertEquals(QuestionSubmissionStatus.REJECTED, rejectedResponse.getStatus());
        assertEquals("Please explain options in details.", rejectedResponse.getAdminFeedback());

        // Check it is no longer in pending list
        pending = submissionService.getPendingSubmissions();
        assertTrue(pending.stream().noneMatch(s -> s.getId().equals(response.getId())));

        // 3. Submit another question to approve
        QuestionSubmissionRequestDto approveRequest = QuestionSubmissionRequestDto.builder()
                .title("Rust Structs")
                .content("What keyword declares a struct in Rust?")
                .difficulty(DifficultyLevel.EASY)
                .choices(Arrays.asList("class", "struct", "type"))
                .correctAnswer("struct")
                .explanation("The struct keyword is used in Rust.")
                .subjectId(subjectTopic.getId())
                .topicId(subtopicTopic.getId())
                .build();

        QuestionSubmissionResponseDto approveResponse = submissionService.submitQuestion(approveRequest, candidateUser.getEmail());

        AdminReviewRequestDto approveDto = AdminReviewRequestDto.builder()
                .status(QuestionSubmissionStatus.APPROVED)
                .feedback("Excellent question!")
                .build();

        QuestionSubmissionResponseDto approvedResponse = submissionService.reviewSubmission(approveResponse.getId(), approveDto, adminUser.getEmail());
        assertEquals(QuestionSubmissionStatus.APPROVED, approvedResponse.getStatus());

        // Verify that a PracticeQuestion is published in subtopic
        List<PracticeQuestion> publishedQuestions = questionRepository.findByTopicId(subtopicTopic.getId());
        assertFalse(publishedQuestions.isEmpty());
        PracticeQuestion published = publishedQuestions.stream()
                .filter(q -> q.getTitle().equals("Rust Structs"))
                .findFirst()
                .orElse(null);
        assertNotNull(published);
        assertEquals("What keyword declares a struct in Rust?", published.getContent());
        assertEquals(0.0, published.getAverageRating());
        assertEquals(0, published.getTotalRatings());

        // 4. Rate the published question
        QuestionRatingRequestDto ratingDto1 = QuestionRatingRequestDto.builder()
                .rating(5)
                .comment("Perfect explanation!")
                .build();

        ratingService.rateQuestion(published.getId(), ratingDto1, candidateUser.getEmail());

        // Reload from repo
        published = questionRepository.findById(published.getId()).orElseThrow();
        assertEquals(5.0, published.getAverageRating());
        assertEquals(1, published.getTotalRatings());

        // Submit rating from another user
        User otherUser = User.builder()
                .email("other_user@example.com")
                .passwordHash("hashed")
                .role(UserRole.CANDIDATE)
                .name("Charlie Student")
                .mobile("9123456789")
                .username("charlie_student")
                .build();
        otherUser = userRepository.save(otherUser);

        QuestionRatingRequestDto ratingDto2 = QuestionRatingRequestDto.builder()
                .rating(3)
                .comment("Decent question.")
                .build();

        ratingService.rateQuestion(published.getId(), ratingDto2, otherUser.getEmail());

        // Reload and verify average rating is (5+3)/2 = 4.0
        published = questionRepository.findById(published.getId()).orElseThrow();
        assertEquals(4.0, published.getAverageRating());
        assertEquals(2, published.getTotalRatings());
    }
}
