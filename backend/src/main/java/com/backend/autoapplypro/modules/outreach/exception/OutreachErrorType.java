package com.backend.autoapplypro.modules.outreach.exception;

public enum OutreachErrorType {
    INVALID_RECIPIENT, // equivalent to 550 Invalid Address
    RATE_LIMITED,      // equivalent to 429 Rate Limit Exceeded
    UNAUTHORIZED,      // token revoked or invalid credentials
    PROVIDER_ERROR,    // upstream API provider error
    SYSTEM_ERROR,      // internal system error
    GENERIC
}
