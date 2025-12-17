# ssi-verify

**Independent verification tool for SSI RPX chains**

`ssi-verify` enables third-party tamper detection and compliance reporting for autonomous system decision logs. It implements the cryptographic verification methods specified in the [SSI Protocol](../../README.md).

## Features

- ✅ **Single Record Verification**: Validate schema compliance and hash integrity
- ✅ **Chain Verification**: Detect tampering, missing records, and timestamp violations
- ✅ **Compliance Reporting**: Assess constitutional guarantee adherence (SPEC §2.1-2.5)
- ✅ **Portable Proof**: Generate machine-verifiable chain-proof.json and verification-report.json
- ✅ **Zero Trust**: No network calls, no trust required—pure cryptographic verification

## Installation

```bash
cd tools/ssi-verify
npm install
npm run build
```

## Usage

### Verify Single Record

Validates schema compliance and recomputes hash to detect modification:

```bash
ssi-verify record --in decision.json
```

**Exit codes:**
- `0` - Record is VALID
- `1` - Record is INVALID (schema violation or hash mismatch)

---

### Verify Chain Integrity

Checks chain continuity, timestamp monotonicity, and generates tamper-proof chain-proof.json:

```bash
ssi-verify chain --in rpx.jsonl --out chain-proof.json
```

**Exit codes:**
- `0` - Chain is VALID (no tampering)
- `1` - Chain is INVALID (tampering detected)
- `2` - Chain is INCOMPLETE (missing records/broken links)

**Tamper detection:**
- Hash mismatch → Record modified
- Broken link → Record deleted or inserted
- Timestamp violation → Records reordered

---

### Generate Verification Report

Produces comprehensive compliance assessment with constitutional guarantee verification:

```bash
ssi-verify report --in rpx.jsonl --out verification-report.json
```

**Exit codes:** Same as `chain` command

**Report includes:**
- Integrity status (VALID/INVALID/INCOMPLETE)
- Compliance level (L1/L2/L3 or null)
- Constitutional guarantees checklist (§2.1-2.5)
- Tamper evidence details
- Chain metadata (genesis hash, decision types, agent count)

---

## Canonical Hash Specification

Per [rpx-record.schema.json](../../schemas/rpx-record.schema.json):

**Include in hash:**
- `record_id`, `timestamp`, `previous_hash`, `decision_type`, `agent_id`, `outcome`, `context_hash`, `policy_version`
- Optional: `action_type`, `reason` (if present)

**Exclude from hash:**
- `record_hash` (field being computed)
- `metadata` (implementation-specific data)

**Canonical form:**
- Alphabetical key order (lexicographic)
- No whitespace (compact JSON)
- UTF-8 encoding
- SHA-256 hash

**Example:**
```typescript
import { computeRecordHash } from './src/hash';

const record = {
  record_id: 'rec_abc123',
  timestamp: '2026-01-15T10:30:00.123456Z',
  previous_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  decision_type: 'care_access',
  agent_id: 'dealgo-lite-v1.0',
  outcome: 'ALLOW',
  context_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  policy_version: 'policy-v1.0.0',
  record_hash: '...' // Computed by ssi-verify
};

const hash = computeRecordHash(record); // Matches record.record_hash if unmodified
```

---

## Exit Codes

- **0** - `VALID`: Integrity verified, no tampering
- **1** - `INVALID`: Tampering detected (hash mismatch, timestamp violation)
- **2** - `INCOMPLETE`: Missing links, cannot establish continuity

---

## Chain Verification Rules

1. **Genesis Integrity**: First record has `previous_hash = SHA-256('')`
2. **Chain Continuity**: `record[i].previous_hash === record[i-1].record_hash`
3. **Timestamp Monotonicity**: Timestamps are non-decreasing (detects reordering)
4. **Hash Integrity**: Recomputed hash matches stored `record_hash`

**Tamper evidence types:**
- `hash-mismatch` - Record content modified
- `broken-link` - Record deleted or chain gap
- `timestamp-violation` - Records reordered
- `schema-invalid` - Malformed record structure

---

## Constitutional Guarantees (SPEC §2.1-2.5)

From static chain verification, `ssi-verify` can assess:

| Guarantee | Verifiable from Chain? |
|-----------|----------------------|
| §2.1 RPX Records Present | ✅ Yes - All records conform to schema |
| §2.2 Fail-Closed Behavior | ❌ No - Requires runtime system inspection |
| §2.3 Human Escalation | ❌ No - Requires system configuration check |
| §2.4 Hash Chain Integrity | ✅ Yes - Full chain continuity verified |
| §2.5 Context Captured | ✅ Yes - All records have `context_hash` |

**Compliance levels:**
- **L1 (Basic)**: RPX records + context capture verified
- **L2/L3**: Require runtime system verification (cannot assess from static chain)

---

## Output Formats

### chain-proof.json

Conforms to [chain-proof.schema.json](../../schemas/chain-proof.schema.json):

```json
{
  "$schema": "../../schemas/chain-proof.schema.json",
  "proof_id": "proof-1737024000-abc123",
  "chain_id": "chain-rec_genesis",
  "genesis_hash": "5feceb66ffc86f38d952786c6d696c79...",
  "current_head": "d4735e3a265e16eee03f59718b9b5d03...",
  "record_count": 42,
  "verification_timestamp": "2026-01-15T12:00:00Z",
  "integrity_status": "VALID",
  "tamper_evidence": []
}
```

### verification-report.json

Conforms to [verification-report.schema.json](../../schemas/verification-report.schema.json):

```json
{
  "$schema": "../../schemas/verification-report.schema.json",
  "report_id": "report-1737024000-xyz789",
  "timestamp": "2026-01-15T12:00:00Z",
  "chain_id": "chain-rec_genesis",
  "verification_scope": {
    "records_verified": 42,
    "time_range": {
      "earliest": "2026-01-01T00:00:00Z",
      "latest": "2026-01-15T11:59:59Z"
    }
  },
  "integrity_status": "VALID",
  "compliance_details": {
    "constitutional_guarantees": {
      "rpx_records_present": true,
      "fail_closed_verified": false,
      "human_escalation_available": false,
      "hash_chain_intact": true,
      "context_captured": true
    },
    "compliance_level": "L1",
    "notes": "L1 (Basic): RPX records present with context capture. Cannot verify fail-closed or escalation from static chain."
  },
  "tamper_evidence": [],
  "chain_metadata": {
    "genesis_hash": "5feceb66ffc86f38d952786c6d696c79...",
    "current_head": "d4735e3a265e16eee03f59718b9b5d03...",
    "decision_types": ["care_access", "vehicle_safety", "financial_transaction"],
    "agent_count": 3
  }
}
```

---

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- chain --in test.jsonl --out proof.json

# Build for production
npm run build

# Run compiled version
npm run verify -- report --in rpx.jsonl --out report.json
```

---

## Schema Validation

All input/output conforms to JSON schemas in [schemas/](../../schemas/):

- [rpx-record.schema.json](../../schemas/rpx-record.schema.json) - Individual decision records
- [chain-proof.schema.json](../../schemas/chain-proof.schema.json) - Chain verification proof
- [verification-report.schema.json](../../schemas/verification-report.schema.json) - Compliance report

Validate manually:
```bash
npm install -g ajv-cli
ajv validate -s schemas/rpx-record.schema.json -d decision.json
```

---

## Why Independent Verification Matters

**From SSI SPEC §1.2:**
> "Autonomous systems must generate tamper-evident audit trails that can be independently verified without trusting the system operator."

`ssi-verify` enables:
- **Courtroom Evidence**: Cryptographic proof admissible in legal proceedings
- **Regulatory Compliance**: Third-party auditors verify constitutional guarantees
- **Public Trust**: Anyone can verify claims without trusting the operator
- **Portable Truth**: Verification reports travel with chains (no vendor lock-in)

**Use cases:**
- Insurance adjusters validating autonomous vehicle decisions
- Healthcare auditors verifying care allocation fairness
- Financial regulators checking trading algorithm compliance
- Cities auditing smart infrastructure safety claims

---

## License

Apache-2.0 (same as reference implementation)

See [LICENSE](../../LICENSE) for details.

---

## Links

- [SSI Protocol Specification](../../README.md)
- [Constitutional Documents](../../docs/)
- [Artifact Schemas](../../schemas/)
- [Reference Implementation](../../reference/)
