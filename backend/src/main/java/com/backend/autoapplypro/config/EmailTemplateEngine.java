package com.backend.autoapplypro.config;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmailTemplateEngine {

    private final Mustache.Compiler mustacheCompiler;

    // Hardcoded 'Professional Boilerplate' structure with placeholders
    private static final String DEFAULT_BASE_TEMPLATE =
            "Dear {{recruiterName}},\n\n" +
            "{{HOOK}}\n\n" +
            "{{EXPERIENCE_HIGHLIGHT}}\n\n" +
            "{{CLOSING}}";

    /**
     * Renders the template by merging context placeholders using Mustache.
     * Fallback to the default boilerplate if no custom template body is provided.
     */
    public String render(String templateText, Map<String, Object> context) {
        String templateToUse = (templateText == null || templateText.trim().isEmpty()) ? DEFAULT_BASE_TEMPLATE : templateText;
        Template compiled = mustacheCompiler.compile(templateToUse);
        return compiled.execute(context);
    }
}
