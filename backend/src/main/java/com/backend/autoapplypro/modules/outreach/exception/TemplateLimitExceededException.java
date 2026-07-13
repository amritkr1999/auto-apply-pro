package com.backend.autoapplypro.modules.outreach.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Template limit reached. Free users can create a maximum of 3 custom templates.")
public class TemplateLimitExceededException extends RuntimeException {
    public TemplateLimitExceededException(String message) {
        super(message);
    }
}
