# 🔍 Code Review Report

## Summary

| Metric | Value |
|--------|-------|
| **Overall Score** | 43/100 |
| **Files Reviewed** | 2 |
| **Critical Issues** | 14 |
| **High Priority Tests** | 7 |
| **Refactoring Opportunities** | 15 |

## 🎯 Top Recommendations

1. 🚨 **SQL Injection Vulnerabilities**: All database queries in subscription.js use string concatenation instead of parameterized queries, creating 8 SQL injection vulnerabilities across getSubscription, searchSubscriptions, createSubscription, and cancelSubscription functions. Attackers can extract data, modify records, or execute arbitrary SQL commands.
   - Files: src/subscription.js

2. 🚨 **Arbitrary Code Execution**: The chargeCard function uses eval() on user-provided input (amountStr), allowing attackers to execute arbitrary JavaScript code on the server. This enables complete system compromise including file system access, process manipulation, and remote command execution.
   - Files: src/subscription.js

3. 🚨 **Authentication Bypass**: The isAdmin function allows any user to gain admin privileges by including isAdmin: true in their request body. Additionally, it uses loose equality (==) enabling type coercion attacks. This completely bypasses authentication controls.
   - Files: src/subscription.js

4. 🚨 **Sensitive Data Exposure**: The createSubscription function logs plaintext passwords, full credit card numbers, and CVV codes to console. This violates PCI-DSS, GDPR, and basic security practices, exposing sensitive user credentials and payment data.
   - Files: src/subscription.js

5. 🚨 **Weak Cryptography**: Password hashing uses MD5 (line 48) which is cryptographically broken and easily cracked. Token generation uses Math.random() (line 47) which is predictable. Both enable account takeover attacks.
   - Files: src/subscription.js

## 📁 File Details

### 📄 `src/db.js`

**Quality Score:** 75/100 | **Coverage:** ~0%

#### Issues (2)
  - Line 5: `info` The query method accepts raw SQL strings without any validation or parameterization support, which could be problematic if this shim is later replaced with a real database driver.
  - Line 7: `low` The query method always returns an empty array, which may not adequately simulate real database behavior for testing purposes.


#### Test Gaps (2)
  - `createConnection() - line 3` (medium priority)
  - `query() method - line 5` (low priority)


#### Refactoring Opportunities (3)
  - **pattern-improvement**: The database connection factory creates a new connection object on each call with no connection pooling or reuse. This pattern doesn't match real database driver behavior and could mask performance issues in integration tests.
  - **modernize**: The mock query method could provide more useful debugging information by returning metadata about the query execution.

  *...and 1 more*

---

### 📄 `src/subscription.js`

**Quality Score:** 12/100 | **Coverage:** ~0%

#### Issues (26)
  - Line 6: `critical` Hardcoded API secret key 'FIXTURE-NOT-A-REAL-KEY-prod-billing-9f3a' is committed to source code. Even though labeled as a fixture, this establishes a dangerous pattern and the key name suggests it may have been derived from a production key.
  - Line 7: `critical` Hardcoded admin override token 'devflow-admin-2024' is committed to source code. This creates a backdoor authentication mechanism that bypasses normal security controls.
  - Line 19: `critical` SQL injection vulnerability: userId is directly concatenated into the SQL query without sanitization or parameterization. An attacker could pass "1' OR '1'='1" to access all subscriptions or use UNION attacks to extract data.

  *...and 23 more*

#### Test Gaps (15)
  - `getSubscription(userId) - line 16` (critical priority)
  - `getSubscription(userId) - line 16` (high priority)

  *...and 13 more*

#### Refactoring Opportunities (8)
  - **pattern-improvement**: All database queries use string concatenation to build SQL, creating SQL injection vulnerabilities. This pattern should be replaced with parameterized queries even in test fixtures to establish secure coding habits.
  - **extract-function**: Every function creates its own database connection with identical error handling patterns. This duplication makes it harder to add connection pooling, error handling, or transaction support.

  *...and 6 more*

---

*Generated at 2026-09-28T06:55:36.684Z • Duration: 390277ms*
