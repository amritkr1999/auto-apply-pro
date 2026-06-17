package com.backend.autoapplypro.modules.outreach.exception;

import lombok.Getter;

@Getter
public class OutreachSendException extends RuntimeException {
    private final OutreachErrorType errorType;

    public OutreachSendException(OutreachErrorType errorType, String message, Throwable cause) {
        super(message, cause);
        this.errorType = errorType;
    }

    public OutreachSendException(OutreachErrorType errorType, String message) {
        super(message);
        this.errorType = errorType;
    }
}
