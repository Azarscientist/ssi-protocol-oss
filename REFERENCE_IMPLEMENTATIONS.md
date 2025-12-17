# SSI Protocol - Reference Implementations

SSI Protocol maintainers provide **maintained reference implementations** to demonstrate compliance patterns.

**This file is non-normative.** Compliance requirements are defined in the constitutional documents.

---

## SSI Kernel

Decision evaluation engine with policy-based authorization.

**Location:** [`reference/kernel/`](reference/kernel/)

**Features:**
- Policy-based decision evaluation
- Fail-closed error handling
- RPX record generation
- Operator escalation workflows

**Documentation:** See [IMPLEMENTATION.md](IMPLEMENTATION.md)

---

## SSI Gateway

RPX record management, hash chain verification, and audit interfaces.

**Location:** [`reference/gateway/`](reference/gateway/)

**Features:**
- RPX record storage (PostgreSQL or in-memory)
- Hash chain integrity verification
- REST API for decision requests
- Audit log export

**Documentation:** See [IMPLEMENTATION.md](IMPLEMENTATION.md)

---

## DeAlgo

**DeAlgo is a reference governance implementation authored by the creators of the SSI Protocol.**

DeAlgo demonstrates advanced governance patterns including:
- Reflection-first decision processing
- Survival-aware gating
- Human authority escalation workflows
- Cryptographic linkage to SSI audit trails

**Location:** See [ssi-protocol-existing repository](https://github.com/Jtjr86/ssi-protocol-existing) for implementation examples.

**Note:** DeAlgo builds on SSI Protocol but is not part of the constitutional standard. It demonstrates how sophisticated governance can be implemented while maintaining SSI compliance.

---

## SDKs

### TypeScript/JavaScript
**Location:** [`sdks/typescript/`](sdks/typescript/)  
**Status:** In development

### Python
**Status:** Planned for v1.1.0

### Rust
**Status:** Planned for v2.0.0

---

## Community Implementations

Third-party SSI-compliant implementations can be listed on the [Community Implementations](https://github.com/Jtjr86/ssi-protocol-oss/wiki/Community-Implementations) wiki page (to be established).

To register an implementation:
1. Pass Level 1 compliance tests
2. Submit documentation showing conformance to constitutional requirements
3. Include link to public verification report (if available)

---

**Reference implementations demonstrate the protocol. Compliance is defined in the constitutional documents.**
