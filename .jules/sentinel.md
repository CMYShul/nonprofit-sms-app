# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-13 - Enforcing Recipient Limits and Robust Input Validation
**Vulnerability:** The SMS API lacked a limit on the number of recipients per request, making it susceptible to resource exhaustion and potential billing abuse.
**Learning:** Even with existing basic validation, missing type checks (like `Array.isArray`) and explicit count limits can leave an API vulnerable to edge cases or intentional abuse.
**Prevention:** Explicitly limit batch operation sizes (e.g., 50 recipients) and strictly validate input types before processing to ensure predictable resource usage.
