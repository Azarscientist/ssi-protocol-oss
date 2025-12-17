# SSI Protocol — Decision Ontology

**Version:** 1.0.0-invariant  
**Status:** Constitutional  
**Last Modified:** December 17, 2025  
**Authority:** SSI Protocol Foundation Documents  
**Related:** [SPEC.md](SPEC.md)

---

## Purpose of This Document

This document defines **what constitutes a decision** under the SSI Protocol. It establishes the ontological boundaries that determine when an RPX (Reflective Provenance Extension) record is required.

**Legal Purpose:** Courts, regulators, and auditors may rely on this definition to determine whether an action falls under SSI governance and whether its audit trail is admissible as evidence.

**Implementation Purpose:** Developers use this definition to determine when their systems must invoke SSI and generate RPX records.

---

## 1. Core Definition

A **decision** is:

> **A proposed action by an autonomous or semi-autonomous agent that, if executed, would produce consequential effects in the external world and requires authorization prior to execution.**

This definition has four critical components:

1. **Proposed action** — Intent to act, not yet executed
2. **Autonomous/semi-autonomous agent** — Not direct human commands
3. **Consequential external effects** — Real-world impact beyond internal system state
4. **Requires authorization** — Must be evaluated before execution

**All four conditions must be met for SSI governance to apply.**

---

## 2. What IS a Decision (Positive Definition)

The following actions **ARE decisions** and **MUST produce RPX records**:

### 2.1 Physical World Interactions

- **Autonomous vehicle:** Change lane, accelerate, brake, make turn
- **Robotic system:** Grasp object, move actuator, apply force
- **Medical device:** Administer dosage, adjust treatment parameter
- **Industrial control:** Valve position change, temperature adjustment, emergency shutdown

**Rationale:** Physical actions create irreversible consequences and potential safety risks.

---

### 2.2 Financial Transactions

- **Trading system:** Execute buy/sell order, adjust position size, halt trading
- **Payment system:** Authorize transfer, approve transaction, decline payment
- **Lending system:** Approve loan, set interest rate, trigger margin call

**Rationale:** Financial actions have legal and economic consequences for stakeholders.

---

### 2.3 Data Governance Actions

- **Access control:** Grant data access, revoke permissions, share sensitive information
- **Privacy enforcement:** Delete personal data, anonymize records, block data export
- **Content moderation:** Remove content, suspend account, apply warning label

**Rationale:** Data actions affect rights, privacy, and legal obligations.

---

### 2.4 Communication to External Parties

- **Customer communication:** Send notification, issue alert, recommend action
- **Emergency response:** Dispatch services, issue evacuation order, trigger alarm
- **Regulatory reporting:** Submit compliance report, file disclosure, flag violation

**Rationale:** External communications create obligations, expectations, and potential liabilities.

---

### 2.5 Policy Enforcement Actions

- **Compliance system:** Block non-compliant action, require approval, escalate violation
- **Safety interlock:** Prevent unsafe operation, trigger emergency stop
- **Regulatory gate:** Deny action due to regulatory constraint

**Rationale:** Enforcement actions directly impact operational outcomes and accountability.

---

## 3. What IS NOT a Decision (Negative Definition)

The following actions **ARE NOT decisions** and **DO NOT require RPX records**:

### 3.1 Internal System Operations

- ❌ Logging events to internal systems
- ❌ Caching data for performance
- ❌ Updating internal state variables
- ❌ Running diagnostic checks
- ❌ Prefetching data for predictions

**Rationale:** Internal operations have no external consequences. They are implementation details, not governed actions.

---

### 3.2 Read-Only Queries

- ❌ Retrieving data from databases
- ❌ Calling APIs that do not mutate state
- ❌ Checking sensor readings
- ❌ Monitoring system health
- ❌ Displaying information to operators

**Rationale:** Reading data does not change the world. Decision governance applies to *actions*, not *observations*.

---

### 3.3 Pure Computation

- ❌ Running machine learning inference
- ❌ Calculating predictions or scores
- ❌ Evaluating policy rules (without execution)
- ❌ Simulating outcomes
- ❌ Generating recommendations (not yet communicated)

**Rationale:** Computation becomes a decision only when its output is **acted upon** or **communicated externally**. Thinking is not deciding.

---

### 3.4 Direct Human Commands

- ❌ Operator manually executing an action
- ❌ Human approving an agent proposal (the approval itself is logged, not the human's thought process)
- ❌ Administrator overriding system behavior

**Rationale:** SSI governs **autonomous** decisions. When a human directly commands an action, SSI does not apply. However, if an agent *proposes* and a human *approves*, the agent's proposal is a decision.

---

### 3.5 Periodic Maintenance Tasks

- ❌ Scheduled database backups
- ❌ Log rotation
- ❌ Cache cleanup
- ❌ Credential refresh

**Rationale:** Routine maintenance tasks without discretionary logic are not decisions. If maintenance involves *choosing* whether to act based on context, it becomes a decision.

---

## 4. Triggering Conditions for RPX Records

An RPX record **MUST** be created when:

1. ✅ An agent **evaluates** whether to take a consequential action
2. ✅ The action, if allowed, would produce external effects
3. ✅ Authorization is required before execution
4. ✅ The outcome is `ALLOW`, `DENY`, or `ESCALATE`

An RPX record **MAY** be created (optional) when:

- An agent generates a recommendation that will be communicated externally (even if not yet acted upon)
- An agent performs internal policy evaluation for audit purposes

An RPX record **MUST NOT** be created for:

- ❌ Internal state changes
- ❌ Read-only operations
- ❌ Pure computation without external effect
- ❌ Direct human commands

---

## 5. Decision Outcomes

Every decision evaluation MUST result in one of three outcomes:

### 5.1 ALLOW

**Definition:** The proposed action is authorized and may proceed.

**RPX Requirements:**
- Context snapshot (what was known)
- Policy evaluation result
- Timestamp of authorization

**Example:** Autonomous vehicle decides to change lanes → SSI evaluates → `ALLOW` → vehicle executes lane change.

---

### 5.2 DENY

**Definition:** The proposed action is not authorized and must not proceed.

**RPX Requirements:**
- Context snapshot (what was known)
- Reason for denial (policy violation, missing context, risk threshold exceeded)
- Timestamp of denial

**Example:** Trading system proposes large position → SSI evaluates → `DENY` due to risk limit → trade does not execute.

---

### 5.3 ESCALATE

**Definition:** The proposed action requires human review before proceeding.

**RPX Requirements:**
- Context snapshot (what was known)
- Reason for escalation (ambiguity, high-stakes, policy uncertainty)
- Timestamp of escalation request
- Operator identity (once human reviews)
- Final outcome (`ALLOW` or `DENY` after review)

**Example:** Medical AI proposes treatment → SSI evaluates → `ESCALATE` to physician → physician reviews → `ALLOW` → treatment proceeds.

---

## 6. Decision Types (Taxonomy)

While all decisions share the core definition, they may be classified by consequence domain:

### 6.1 Safety-Critical Decisions

Actions where failure could result in physical harm.

**Examples:** Autonomous driving, medical dosing, industrial control

**Characteristic:** Often require pre-execution verification and post-execution audits.

---

### 6.2 Financial Decisions

Actions with direct economic consequences.

**Examples:** Trading, lending, payment authorization

**Characteristic:** Often require regulatory compliance and fraud detection.

---

### 6.3 Privacy Decisions

Actions affecting personal data rights.

**Examples:** Data access, deletion, sharing

**Characteristic:** Often require GDPR/CCPA compliance and data subject rights enforcement.

---

### 6.4 Communication Decisions

Actions that transmit information to external parties.

**Examples:** Customer notifications, emergency alerts, regulatory disclosures

**Characteristic:** Create legal obligations and expectations.

---

### 6.5 Enforcement Decisions

Actions that prevent or compel behavior.

**Examples:** Blocking non-compliant actions, triggering safety interlocks

**Characteristic:** Often irreversible and high-stakes.

---

## 7. Temporal Boundaries

### 7.1 Pre-Decision Phase (NOT governed by SSI)

- Agent gathers information
- Agent runs inference models
- Agent evaluates internal heuristics
- Agent generates potential actions

**SSI does not apply here.** This is the agent's "thinking" phase.

---

### 7.2 Decision Phase (GOVERNED by SSI)

- Agent **proposes** a specific action
- SSI evaluates the proposal against policy
- SSI generates RPX record with outcome

**SSI applies here.** This is the authorization checkpoint.

---

### 7.3 Execution Phase (NOT governed by SSI)

- If `ALLOW`: Agent executes the action
- If `DENY`: Agent does not execute
- If `ESCALATE`: Execution waits for human review

**SSI does not control execution.** It controls **permission to execute**.

---

### 7.4 Post-Decision Phase (Audit Only)

- RPX records are available for forensic review
- Operators may analyze decision patterns
- Regulators may audit compliance

**SSI provides evidence, not retroactive control.**

---

## 8. Edge Cases and Clarifications

### 8.1 Composite Actions

**Question:** If an agent takes multiple actions as part of a single goal, is each one a separate decision?

**Answer:** Yes, if each action independently meets the decision criteria. Example: Autonomous vehicle decides to (1) signal, (2) check blind spot, (3) change lane. Each is a separate decision if it has external effect.

**Exception:** If actions are tightly coupled and always executed together, they may be treated as a single decision for simplicity. Example: "execute trade" might encompass order submission + position update as one decision.

---

### 8.2 Recommendations vs. Actions

**Question:** If an agent generates a recommendation but does not execute it, is that a decision?

**Answer:**
- If recommendation is **communicated externally** (e.g., to a customer), it **IS** a decision (external effect).
- If recommendation is **internal only** (e.g., displayed to operator for review), it is **NOT** a decision.

---

### 8.3 Time-Delayed Execution

**Question:** If a decision authorizes an action to occur later (e.g., "execute trade at 2pm"), when is the RPX record created?

**Answer:** RPX record is created **at authorization time**, not execution time. The record captures the decision to authorize future execution.

---

### 8.4 Human-in-the-Loop Systems

**Question:** If a human must approve every action, does SSI still apply?

**Answer:** Yes. The agent's **proposal** is the decision, even if a human has final approval. RPX records capture the agent's recommendation and the human's override (if any).

---

## 9. Evidence Admissibility Criteria

For an RPX record to be admissible as evidence in legal or regulatory proceedings, it must:

1. ✅ Correspond to a **decision as defined in Section 1**
2. ✅ Include all required fields per [SPEC.md Section 2.1](SPEC.md#21-every-decision-has-a-record)
3. ✅ Be part of a **verified hash chain** per [SPEC.md Section 2.4](SPEC.md#24-hash-chain-integrity-is-verifiable)
4. ✅ Capture **context at decision time** per [SPEC.md Section 2.5](SPEC.md#25-decisions-are-context-bound)
5. ✅ Be produced **before execution**, not retroactively

**Non-Admissible Records:**
- ❌ Logs created after the action occurred
- ❌ Records missing required context fields
- ❌ Records with broken hash chain links
- ❌ Records for non-decisions (internal operations, reads)

---

## 10. Relationship to SPEC.md

This document **refines** [SPEC.md](SPEC.md) by defining scope.

- **SPEC.md** says: "Every decision has a record."
- **DECISIONS.md** says: "Here's what a decision is."

Together, they form the complete constitutional framework:

```
SPEC.md:      The invariants that apply
DECISIONS.md: The scope they apply to
AUDIT.md:     How to verify them (coming)
FAILURE.md:   How they hold under failure (coming)
COMPLIANCE.md: How to certify them (coming)
```

---

## 11. Implementation Guidance

### For Developers

**When integrating SSI, ask:**

1. Is this action **proposed by an agent** (not a direct human command)?
2. Does it have **external consequences** (beyond internal state)?
3. Does it require **authorization** (not just observation)?

If **all three are true** → create RPX record.

**Code Pattern:**

```pseudocode
function agentProposesAction(action) {
  if (isDecision(action)) {
    outcome = ssi.evaluate(action, context)
    if (outcome == ALLOW) {
      execute(action)
    } else if (outcome == DENY) {
      logDenial(action)
    } else if (outcome == ESCALATE) {
      queueForHumanReview(action)
    }
  } else {
    // Not a decision, execute directly
    execute(action)
  }
}
```

---

### For Operators

**When defining policies, classify actions:**

- **High-stakes decisions** → require pre-approval or post-audit
- **Routine decisions** → allow with monitoring
- **Non-decisions** → no SSI governance needed

**Example Policy:**

- Trading > $1M → `ESCALATE` to human
- Trading < $1M within risk limits → `ALLOW`
- Trading violating risk limits → `DENY`
- Internal price calculations → Not a decision, no RPX

---

## 12. Governance

This document is maintained under the SSI Protocol governance framework.

Changes require:
- Public RFC process
- Demonstrated need (ambiguity, legal precedent, implementation confusion)
- Backward compatibility (existing decisions remain valid)

**Acceptance Criteria:** Proposed changes must not broaden scope to include non-consequential actions or exclude genuinely consequential ones.

---

## 13. Contact and Clarifications

**Ontological Questions:** [GitHub Discussions](https://github.com/Jtjr86/ssi-protocol-oss/discussions)  
**Legal Interpretations:** Consult with legal counsel; this document is technical guidance, not legal advice  
**Implementation Support:** See reference implementations (Kernel, Gateway, DeAlgo)

---

**This document establishes the ontological boundaries of SSI governance. It defines what decisions are, enabling consistent implementation and regulatory clarity.**

---

## Appendix A: Decision Flowchart

```
┌─────────────────────────────────────┐
│ Agent considers taking an action    │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────────────┐
       │ Is this action│
       │ proposed by   │───NO──► Execute directly
       │ an agent?     │         (not governed by SSI)
       └───────┬───────┘
               │ YES
               ▼
       ┌───────────────┐
       │ Does it have  │
       │ external      │───NO──► Execute directly
       │ consequences? │         (not a decision)
       └───────┬───────┘
               │ YES
               ▼
       ┌───────────────┐
       │ Requires pre- │
       │ authorization?│───NO──► Log for audit only
       └───────┬───────┘         (optional RPX)
               │ YES
               ▼
       ┌───────────────────────┐
       │ Create RPX record     │
       │ Evaluate with SSI     │
       └──────────┬────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
   ┌───▼────┐  ┌────▼────┐  ┌─────▼──────┐
   │ ALLOW  │  │  DENY   │  │ ESCALATE   │
   └───┬────┘  └────┬────┘  └─────┬──────┘
       │            │              │
   Execute     Don't execute   Wait for human
                                  review
```

---

**End of SSI Protocol Decision Ontology**
