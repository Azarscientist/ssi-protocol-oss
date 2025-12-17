# Security Policy

**Status:** Non-normative  
**Purpose:** Vulnerability reporting and disclosure process

---

## Reporting Security Vulnerabilities

**Preferred Method:** [GitHub Security Advisories](https://github.com/YOUR_ORG/ssi-protocol-oss/security/advisories)  
**Alternative:** [GitHub Discussions (Security Category)](https://github.com/YOUR_ORG/ssi-protocol-oss/discussions)

**What to Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact (hash chain integrity, fail-open scenarios, policy bypass)
- Affected versions/components

**Do NOT:**
- Publicly disclose vulnerabilities before coordinated disclosure period
- Include live exploit code targeting production systems

---

## Response Timeline

| Phase | Timeline | Action |
|-------|----------|--------|
| **Acknowledgment** | 48 hours | Confirm receipt of report |
| **Assessment** | 7 days | Determine severity and impact |
| **Fix Development** | 30 days (critical)<br>90 days (non-critical) | Patch development and testing |
| **Disclosure** | 30-90 days after fix | Public advisory with credit to reporter |

---

## Security Model

SSI Protocol **guarantees:**
- **Tamper-evident audit trails** (cryptographic hash chains)
- **Fail-closed behavior** (unauthorized actions denied by default)
- **Independent verification** (3rd parties can validate chain integrity)

SSI Protocol **does NOT guarantee:**
- **Policy correctness** (SSI records decisions; policy logic is domain-specific)
- **Availability** (SSI focuses on integrity, not uptime)
- **Protection against infrastructure compromise** (if the host is compromised, SSI records the compromise but cannot prevent it)

**Security requirements for compliance are defined by [AUDIT.md](AUDIT.md), [FAILURE.md](FAILURE.md), and [COMPLIANCE.md](COMPLIANCE.md).**

---

## Scope

**In Scope (SSI Protocol Vulnerabilities):**
- Cryptographic hash chain integrity bypass
- Fail-open scenarios (system allows unauthorized actions)
- Policy evaluation logic errors in reference implementations
- Chain verification bypass
- Timestamp manipulation that violates causality

**Out of Scope (Infrastructure/Deployment Issues):**
- Denial of service attacks (availability)
- Social engineering or phishing
- Vulnerabilities in dependencies (report to upstream projects)
- Misconfigured deployments (policy logic errors are operator responsibility)

---

## Disclosure Policy

SSI follows **coordinated disclosure**:

1. Reporter submits vulnerability via GitHub Security Advisories
2. Maintainers confirm and develop fix
3. Fix is released and deployed to reference implementations
4. Public advisory is published with:
   - Vulnerability description
   - Affected versions
   - Mitigation guidance
   - Credit to reporter (if requested)

**Typical disclosure timeline:** 30-90 days after fix is available.

---

## Cryptographic Assumptions

SSI Protocol relies on:

- **SHA-256** (FIPS 180-4) for record hashing
- **ISO 8601** timestamps (UTC, microsecond precision)
- **TLS 1.3** for API transport security (deployment-specific)

**If these assumptions are broken (e.g., SHA-256 collision found), SSI will transition to stronger primitives via RFC process.**

---

## Security Audits

Reference implementations undergo:
- **Automated scanning** (npm audit, Dependabot)
- **Code review** (multi-reviewer PR approval)
- **Conformance testing** (constitutional guarantee verification)

**Professional security audits are planned for v1.1.0 (Q2 2026).** See [ROADMAP.md](ROADMAP.md).

---

## Questions?

Security questions about SSI Protocol: [GitHub Discussions](https://github.com/YOUR_ORG/ssi-protocol-oss/discussions)  
Vulnerability reports: [GitHub Security Advisories](https://github.com/YOUR_ORG/ssi-protocol-oss/security/advisories)

**This security policy is non-normative. Security requirements for SSI compliance are defined in [AUDIT.md](AUDIT.md) and [FAILURE.md](FAILURE.md).**
