# SSI Protocol (Self-Sovereign Infrastructure)

**Version:** 1.0.0-invariant  
**Status:** Constitutional Standard  
**Jurisdiction:** Global (regulatory-agnostic)

---

## What is SSI Protocol?

SSI Protocol is a **constitutional standard** for AI decision-making that guarantees:

1. **Every decision is recorded** (tamper-evident hash chain)
2. **Failures are logged before prevention** (fail-closed by default)
3. **Humans retain veto authority** (agents cannot override)
4. **Audit trails are independently verifiable** (no trust required)

**SSI is NOT:**
- An AI model or training framework
- A blockchain or distributed ledger (though it can integrate)
- A specific product or vendor solution
- A replacement for domain-specific safety standards

SSI provides the **audit infrastructure** that allows AI agents to operate in regulated environments where accountability, traceability, and independent verification are mandatory.

---

## Who is this for?

**Regulators & Policymakers**  
SSI provides the constitutional framework for AI governance. Constitutional documents define what compliant systems must guarantee. Implementation details are non-normative.

**Enterprises & System Integrators**  
SSI enables AI deployment in regulated environments (finance, healthcare, autonomous systems) where audit trails and fail-safe behavior are required by law.

**Implementers & Developers**  
SSI is a protocol specification, not a product. You can build conformant implementations using reference code, community SDKs, or custom solutions. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for operational guidance.

---

## Constitutional Documents

SSI's guarantees are defined by five constitutional documents. **These are the normative specification:**

| Document | Purpose | Stability |
|----------|---------|-----------|
| [SPEC.md](SPEC.md) | Record format, hash chain structure | **Invariant** |
| [DECISIONS.md](DECISIONS.md) | Decision classification, policy evaluation rules | **Invariant** |
| [AUDIT.md](AUDIT.md) | Cryptographic proof requirements, chain verification | **Invariant** |
| [FAILURE.md](FAILURE.md) | Fail-closed semantics, emergency protocols | **Invariant** |
| [COMPLIANCE.md](COMPLIANCE.md) | Three-tier compliance levels, certification criteria | **Indicative** |

**Invariant** documents cannot be weakened. Changes require RFC process with multi-stakeholder consensus. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Core Principles

**1. Fail-Closed by Default**  
Systems MUST deny unauthorized actions. Hash chain integrity failures MUST prevent further decisions. No "optimistic" execution.

**2. Tamper-Evident Provenance**  
Every decision links to previous decisions via cryptographic hash. Any modification to historical records is mathematically detectable.

**3. Human Authority Preserved**  
AI agents cannot override human veto. Emergency shutdowns MUST be immediate and unconditional.

**4. Independent Verification**  
Audit trails MUST be verifiable by 3rd parties without trusting the operator. Cryptographic proofs replace trust.

---

## Compliance Levels

SSI defines three indicative compliance levels (see [COMPLIANCE.md](COMPLIANCE.md) for full criteria):

| Level | Scope | Indicative Estimate |
|-------|-------|---------------------|
| **L1 (Basic)** | Hash chain + fail-closed | ~2,000 lines of code |
| **L2 (Standard)** | L1 + policy framework + API | ~10,000 lines of code |
| **L3 (Full)** | L2 + distributed verification + ecosystem integration | ~50,000+ lines of code |

**Note:** These estimates are non-normative. Compliance is measured by conformance to constitutional guarantees, not implementation size.

---

## Getting Started

**For Regulators:**  
Read the [constitutional documents](#constitutional-documents) to understand SSI's guarantees. COMPLIANCE.md explains certification criteria.

**For Implementers:**  
- Read [IMPLEMENTATION.md](IMPLEMENTATION.md) for operational guidance
- Review [REFERENCE_IMPLEMENTATIONS.md](REFERENCE_IMPLEMENTATIONS.md) for maintained reference code
- See [USE_CASES.md](USE_CASES.md) for domain-specific applications
- Check [ROADMAP.md](ROADMAP.md) for ecosystem development timeline

**For Contributors:**  
See [CONTRIBUTING.md](CONTRIBUTING.md) for RFC process and governance model.

---

## Governance

SSI Protocol evolves through the **RFC (Request for Comments) process**:

1. **Implementation improvements** (Gateway, Kernel, SDKs) → Standard GitHub PR
2. **Documentation/tooling** → Discussion + PR
3. **Constitutional changes** → RFC discussion → Multi-stakeholder review → Maintainer decision

**Stability Philosophy:**  
Constitutional guarantees cannot be weakened. Backward compatibility is mandatory. Major transitions require 12-24 months notice.

---

## Project Status

**Current Version:** v1.0.0-invariant  
**Constitutional Docs:** Complete (SPEC, DECISIONS, AUDIT, FAILURE, COMPLIANCE)  
**Reference Implementation:** Available (SSI Kernel, SSI Gateway)  
**SDKs:** TypeScript (in development), Python/Rust (planned)

---

## License

Constitutional documents (SPEC.md, DECISIONS.md, AUDIT.md, FAILURE.md, COMPLIANCE.md):  
**Creative Commons Attribution 4.0 International (CC BY 4.0)**

Reference implementations and tooling:  
**Apache License 2.0**

See [LICENSE](LICENSE) for full terms.

---

## Contact

- **GitHub Issues:** Technical implementation questions
- **GitHub Discussions:** RFC proposals, governance questions
- **Security:** See [SECURITY.md](SECURITY.md) for vulnerability reporting
- **Standards Body (future):** SSI governance transitions to multi-stakeholder foundation (see [ROADMAP.md](ROADMAP.md))

---

**SSI Protocol is a constitutional standard for AI audit infrastructure.**  
**Implementations can be built by anyone. Trust is mathematical, not claimed.**
