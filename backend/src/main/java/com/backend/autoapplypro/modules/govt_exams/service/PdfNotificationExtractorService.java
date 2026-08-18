package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;

import java.io.InputStream;

public interface PdfNotificationExtractorService {
    ExamNotificationDto extractMetadataFromPdfStream(InputStream pdfStream, String defaultExamName, String defaultOrganizingBody);
    ExamNotificationDto extractMetadataFromPdfUrl(String pdfUrl, String defaultExamName, String defaultOrganizingBody);
}
