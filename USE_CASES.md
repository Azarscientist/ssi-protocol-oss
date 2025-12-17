# SSI Protocol - Use Cases

SSI Protocol enables defensible autonomous systems across multiple domains.

**This file is non-normative.** It explains where SSI applies and what it enables.

---

## Autonomous Vehicles

**SSI provides:**
- Pre-decision authorization (lane change, braking, acceleration)
- Cryptographic decision logs for post-incident analysis
- Fail-closed safety (if authorization fails, vehicle halts)

**Regulatory Alignment:** ISO 26262 (automotive safety)

**Example:** After an incident, investigators use SSI audit trails to verify whether the autonomous system's decisions followed safety protocols, with cryptographic proof of when decisions were made and what context was considered.

---

## Healthcare AI

**SSI provides:**
- Decision provenance for treatment recommendations
- Auditability for malpractice review
- Human escalation for high-stakes decisions

**Regulatory Alignment:** IEC 62304 (medical device software), FDA SaMD

**Example:** AI recommends medication dosage. SSI requires physician approval for high-risk adjustments. All decisions are logged with full context, creating defensible audit trail for regulatory review.

---

## Financial Trading

**SSI provides:**
- Audit trails for algorithmic trading decisions
- Fail-closed risk management (deny execution on policy violation)
- Compliance reporting for regulators

**Regulatory Alignment:** MiFID II, Dodd-Frank, SEC requirements

**Example:** Trading algorithm proposes order execution. SSI evaluates against risk limits, position constraints, and market conditions. If policy is violated, execution is denied and logged with full reasoning.

---

## Industrial Automation

**SSI provides:**
- Safety interlocks for robotic systems
- Operator override mechanisms
- Certification substrate for industrial safety standards

**Regulatory Alignment:** IEC 61508 (functional safety)

**Example:** Robotic system plans movement near human operators. SSI enforces proximity protocols, requires safety zone verification, and logs all decisions for safety certification audits.

---

## Smart Cities

**SSI provides:**
- Decision accountability for autonomous traffic control
- Audit trails for public service AI
- Fail-closed infrastructure protection

**Regulatory Alignment:** Municipal governance standards, public accountability laws

**Example:** Traffic management AI adjusts signal timing. SSI logs decisions with justification (congestion data, emergency vehicle priority). Citizens can verify decisions were justified by public safety criteria.

---

## Space Systems

**SSI provides:**
- Command authorization trails for autonomous spacecraft
- Fail-closed safety for critical maneuvers
- Tamper-evident operations logs

**Regulatory Alignment:** NASA/ESA mission assurance standards

**Example:** Spacecraft autonomously executes debris avoidance maneuver. SSI logs decision with collision probability analysis, fuel cost assessment, and mission timeline impact. Ground control can verify autonomous action was warranted.

---

## Common Patterns Across Domains

**All use cases share:**
1. **Pre-decision logging** — Context captured before execution
2. **Cryptographic provenance** — Hash-chained audit trail
3. **Fail-closed safety** — Deny on uncertainty
4. **Human authority** — Operators retain veto power
5. **Independent verification** — Third parties can audit decisions

---

**Use cases demonstrate SSI applicability. Compliance is defined in the constitutional documents.**
