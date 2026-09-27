# Security Analysis Skill

## Purpose

Use this skill when reviewing any code to identify security vulnerabilities,
unsafe practices, and potential risks.

## OWASP Top 10

Check for relevant risks including:

- Broken access control
- Cryptographic failures
- Injection vulnerabilities
- Insecure design
- Security misconfiguration
- Vulnerable or outdated dependencies
- Identification and authentication failures
- Software and data integrity failures
- Logging and monitoring failures
- Server-side request forgery (SSRF)

## Secrets and Credentials

Check for:

- Hardcoded API keys
- Passwords
- Access tokens
- Private keys
- Connection strings
- Credentials committed to source code
- Secrets exposed in logs or error messages

Secrets should be stored through secure environment or secret-management
mechanisms rather than source code.

## Input and Data Handling

Check for:

- Unvalidated external input
- Unsafe command execution
- SQL injection
- Command injection
- Path traversal
- Unsafe deserialization
- Malicious file handling
- Untrusted data used without validation

## Web and API Security

When applicable, check for:

- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Unsafe CORS configuration
- Missing authentication or authorization checks
- Sensitive information exposed through APIs
- Insecure HTTP communication

## Dependency Security

Check for:

- Suspicious or unnecessary dependencies
- Known insecure dependency usage
- Unsafe package configuration
- Dependencies used without appropriate validation

Do not claim a dependency is vulnerable unless the available evidence supports
the finding.

## Error Handling and Logging

Check that:

- Sensitive information is not exposed in errors
- Tokens and credentials are not logged
- Security-relevant failures are handled appropriately
- Logs contain useful security context without exposing secrets

## Review Output

For each security finding provide:

1. File path
2. Line number or line range when available
3. Vulnerability or security concern
4. Why it matters
5. Severity: critical, high, medium, low, or info
6. Concrete remediation
7. Code example when useful

Do not invent vulnerabilities, files, line numbers, or credentials.
Base findings only on the actual code and configuration being reviewed.
