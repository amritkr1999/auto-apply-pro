package com.backend.autoapplypro.modules.outreach.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class CoverLetterPdfGenerator {

    /**
     * Converts raw text into a formatted PDF byte array.
     */
    public byte[] generatePdf(String title, String body) {
        if (body == null || body.trim().isEmpty()) {
            body = "Cover Letter";
        }

        // Clean HTML tags if present in body
        String cleanBody = body.replaceAll("<br\\s*/?>", "\n")
                               .replaceAll("<p[^>]*>", "\n")
                               .replaceAll("</p>", "\n")
                               .replaceAll("<[^>]*>", "")
                               .replace("&nbsp;", " ")
                               .replace("&amp;", "&")
                               .replace("&lt;", "<")
                               .replace("&gt;", ">");

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);

            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            float margin = 50;
            float yStart = page.getMediaBox().getHeight() - margin;
            float width = page.getMediaBox().getWidth() - 2 * margin;
            float yPosition = yStart;

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {

                // Header / Title
                if (title != null && !title.trim().isEmpty()) {
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 16);
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText(cleanText(title));
                    contentStream.endText();
                    yPosition -= 30;
                }

                // Body lines
                String[] rawLines = cleanBody.split("\n");
                for (String rawLine : rawLines) {
                    if (rawLine.trim().isEmpty()) {
                        yPosition -= 12;
                        continue;
                    }

                    List<String> wrappedLines = wrapText(rawLine.trim(), fontRegular, 11, width);
                    for (String line : wrappedLines) {
                        if (yPosition < margin + 40) {
                            // Close stream for current page, add new page
                            contentStream.close();
                            page = new PDPage(PDRectangle.LETTER);
                            document.addPage(page);
                            yPosition = page.getMediaBox().getHeight() - margin;
                            
                            // Re-open contentStream for new page
                            PDPageContentStream newStream = new PDPageContentStream(document, page);
                            newStream.beginText();
                            newStream.setFont(fontRegular, 11);
                            newStream.newLineAtOffset(margin, yPosition);
                            newStream.showText(cleanText(line));
                            newStream.endText();
                            yPosition -= 16;
                            
                            // We return here to process rest in a simplified loop, or keep writing
                            // Let's use simple single page stream for clean output
                        } else {
                            contentStream.beginText();
                            contentStream.setFont(fontRegular, 11);
                            contentStream.newLineAtOffset(margin, yPosition);
                            contentStream.showText(cleanText(line));
                            contentStream.endText();
                            yPosition -= 16;
                        }
                    }
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            log.info("Successfully generated Cover Letter PDF (size: {} bytes)", out.size());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for Cover Letter", e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    private List<String> wrapText(String text, PDType1Font font, float fontSize, float maxWidth) throws Exception {
        List<String> result = new ArrayList<>();
        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            String candidate = currentLine.length() == 0 ? word : currentLine + " " + word;
            float textWidth = font.getStringWidth(cleanText(candidate)) / 1000 * fontSize;
            if (textWidth > maxWidth) {
                if (currentLine.length() > 0) {
                    result.add(currentLine.toString());
                    currentLine = new StringBuilder(word);
                } else {
                    result.add(candidate);
                    currentLine = new StringBuilder();
                }
            } else {
                currentLine = new StringBuilder(candidate);
            }
        }
        if (currentLine.length() > 0) {
            result.add(currentLine.toString());
        }
        return result;
    }

    private String cleanText(String text) {
        if (text == null) return "";
        // Replace non-WinAnsi characters to prevent PDFBox font encoding exceptions
        return text.replaceAll("[^\\x00-\\x7F]", "")
                   .replace("\r", "");
    }
}
