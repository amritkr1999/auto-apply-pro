package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamSyllabusDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamSyllabus;
import com.backend.autoapplypro.modules.govt_exams.repository.ExamSyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SyllabusChunkerServiceImpl implements SyllabusChunkerService {

    private final ExamSyllabusRepository syllabusRepository;

    @Override
    public List<ExamSyllabusDto> generateAndSaveSyllabusForExam(UUID examId, String examName, ExamCategory category) {
        log.info("[SYLLABUS CHUNKER ENGINE] Automatically parsing and indexing syllabus for exam ID: {} ({})", examId, examName);
        List<ExamSyllabus> createdList = new ArrayList<>();

        if (category == ExamCategory.UPSC) {
            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Prelims - GS Paper 1")
                    .subject("General Studies & Indian Polity")
                    .topics("[\"Indian Polity & Governance - Constitution, Political System, Panchayati Raj\", \"Current events of national & international importance\", \"History of India & Indian National Movement\", \"Indian & World Geography - Physical, Social, Economic\", \"Economic & Social Development\", \"General issues on Environmental Ecology & Climate Change\"]")
                    .totalMarks(200)
                    .durationMinutes(120)
                    .negativeMarking("-0.66 Marks (1/3rd)")
                    .build());

            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Prelims - CSAT Paper 2")
                    .subject("Civil Services Aptitude Test")
                    .topics("[\"Comprehension & Interpersonal skills\", \"Logical reasoning & analytical ability\", \"Decision making & problem solving\", \"General mental ability\", \"Basic numeracy (numbers and their relations, orders of magnitude, Class X level)\", \"Data interpretation (charts, graphs, tables, data sufficiency)\"]")
                    .totalMarks(200)
                    .durationMinutes(120)
                    .negativeMarking("-0.83 Marks (33% qualifying threshold)")
                    .build());
        } else if (category == ExamCategory.BANKING) {
            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Prelims")
                    .subject("Reasoning Ability & Quantitative Aptitude")
                    .topics("[\"Seating Arrangement & Puzzles (Floor, Linear, Circular)\", \"Syllogisms, Inequalities, Input-Output\", \"Data Interpretation (Pie Chart, Line Graph, Tabular)\", \"Simplification, Approximation, Quadratic Equations\", \"Number Series & Data Sufficiency\"]")
                    .totalMarks(70)
                    .durationMinutes(40)
                    .negativeMarking("-0.25 Marks")
                    .build());

            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Prelims")
                    .subject("English Language")
                    .topics("[\"Reading Comprehension (Economy, Banking, Tech)\", \"Cloze Test & Para Jumbles\", \"Error Spotting & Sentence Replacement\", \"Vocabulary (Synonyms, Antonyms, Phrase Replacement)\"]")
                    .totalMarks(30)
                    .durationMinutes(20)
                    .negativeMarking("-0.25 Marks")
                    .build());
        } else {
            // Default Tier 1 & Tier 2 breakdown for SSC, Railways, State PSC, Defense
            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Tier 1 / CBT-1")
                    .subject("Quantitative Aptitude")
                    .topics("[\"Ratio & Proportion, Percentages, Profit & Loss\", \"Data Interpretation (Bar Graphs, Pie Charts)\", \"Algebra, Geometry & Trigonometric Identities\", \"Speed, Distance, Time & Work Problems\", \"Averages, Mixtures & Allegations\"]")
                    .totalMarks(50)
                    .durationMinutes(60)
                    .negativeMarking("-0.50 Marks")
                    .build());

            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Tier 1 / CBT-1")
                    .subject("General Intelligence & Reasoning")
                    .topics("[\"Analogies, Classification, Coding-Decoding\", \"Syllogisms & Logical Venn Diagrams\", \"Blood Relations, Direction Sense\", \"Non-Verbal Series & Folding Paper Patterns\", \"Matrix & Embedded Figures\"]")
                    .totalMarks(50)
                    .durationMinutes(60)
                    .negativeMarking("-0.50 Marks")
                    .build());

            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Tier 1 / CBT-1")
                    .subject("General Awareness & GK")
                    .topics("[\"Indian History, Freedom Movement & Art Culture\", \"Indian Polity & Constitution (Articles, Amendments)\", \"Physical & Economic Geography\", \"General Science (Physics, Chemistry, Biology) & National News\", \"Economy & Budget Highlights\"]")
                    .totalMarks(50)
                    .durationMinutes(60)
                    .negativeMarking("-0.50 Marks")
                    .build());

            createdList.add(ExamSyllabus.builder()
                    .examId(examId)
                    .stage("Tier 1 / CBT-1")
                    .subject("English Comprehension")
                    .topics("[\"Reading Comprehension & Cloze Test\", \"Error Spotting & Sentence Improvement\", \"Synonyms, Antonyms & One-Word Substitution\", \"Idioms, Phrases & Active/Passive Voice\"]")
                    .totalMarks(50)
                    .durationMinutes(60)
                    .negativeMarking("-0.50 Marks")
                    .build());
        }

        List<ExamSyllabus> saved = syllabusRepository.saveAll(createdList);

        return saved.stream()
                .map(s -> ExamSyllabusDto.builder()
                        .id(s.getId())
                        .examId(s.getExamId())
                        .stage(s.getStage())
                        .subject(s.getSubject())
                        .topics(s.getTopics())
                        .totalMarks(s.getTotalMarks())
                        .durationMinutes(s.getDurationMinutes())
                        .negativeMarking(s.getNegativeMarking())
                        .build())
                .toList();
    }
}
