# SSI Verification Test Vectors

**B4: Golden test cases that lock canonical ssi-verify behavior**

This directory contains the **anti-drift lock** for SSI verification - test vectors that define the canonical truth for tamper detection across all implementations.

---

## Purpose

These test vectors ensure:

1. **Behavioral Consistency**: ssi-verify behavior is deterministic and regression-free
2. **Cross-Language Compatibility**: Python, Rust, Go implementations must produce identical results
3. **Court-Grade Evidence**: Golden outputs serve as canonical references for legal proceedings
4. **Standards Compliance**: Locks exit codes, integrity statuses, and finding types as immutable

---

## Test Vectors

### 1. `valid-chain-10.jsonl`

**Clean 10-record chain with proper linkage**

- ✅ Genesis hash correct (`SHA-256('')`)
- ✅ Chain continuity intact (all `previous_hash` links valid)
- ✅ Timestamps monotonic (non-decreasing)
- ✅ All hashes match computed values

**Expected:**
- `integrity_status`: `VALID`
- `compliance_level`: `L1`
- `tamper_evidence`: `[]` (empty)
- Exit code: `0`

---

### 2. `tampered-record.jsonl`

**Record #5 outcome modified without updating hash**

- ❌ Record #5: `outcome` field changed from `DENY` to `ALLOW`
- ❌ `record_hash` **not updated** → hash mismatch
- ✅ Chain links intact (previous_hash values unchanged)

**Expected:**
- `integrity_status`: `INVALID`
- `compliance_level`: `null`
- `tamper_evidence`: 1 finding (`hash-mismatch` or `schema-invalid`)
- Exit code: `1`

**Detects:** Content modification (bit flips, field changes)

---

### 3. `missing-link.jsonl`

**Record #5 deleted from chain**

- ❌ Record #5 removed entirely
- ❌ Record #6 `previous_hash` points to non-existent record #5
- ✅ Remaining records individually valid

**Expected:**
- `integrity_status`: `INCOMPLETE`
- `compliance_level`: `null`
- `tamper_evidence`: 1+ findings (`broken-link`)
- Exit code: `2`

**Detects:** Record deletion, chain gaps

---

### 4. `reordered.jsonl`

**Records #6 and #7 swapped positions**

- ❌ Record #6 and #7 positions swapped
- ❌ Timestamp monotonicity violated (timestamps out of order)
- ❌ Chain links broken (previous_hash mismatches)

**Expected:**
- `integrity_status`: `INCOMPLETE` or `INVALID`
- `compliance_level`: `null`
- `tamper_evidence`: 3+ findings (`timestamp-violation`, `broken-link`)
- Exit code: `2` (or `1` depending on implementation priority)

**Detects:** Record reordering, timestamp manipulation

---

### 5. `bad-timestamp.jsonl`

**Record #6 timestamp goes backward**

- ❌ Record #6 timestamp earlier than record #5
- ❌ Violates monotonicity requirement
- ✅ Hash updated to match modified timestamp

**Expected:**
- `integrity_status`: `INCOMPLETE` or `INVALID`
- `compliance_level`: `null`
- `tamper_evidence`: 1+ findings (`timestamp-violation`, `broken-link`)
- Exit code: `2` or `1`

**Detects:** Timestamp manipulation, clock anomalies

---

## Directory Structure

```
tests/vectors/
├── rpx/                           # Input JSONL files
│   ├── valid-chain-10.jsonl
│   ├── tampered-record.jsonl
│   ├── missing-link.jsonl
│   ├── reordered.jsonl
│   └── bad-timestamp.jsonl
├── expected/                      # Golden expected outputs
│   ├── valid-chain-10.verification-report.json
│   ├── tampered-record.verification-report.json
│   ├── missing-link.verification-report.json
│   ├── reordered.verification-report.json
│   └── bad-timestamp.verification-report.json
├── generate-vectors.mjs           # Vector generator script
├── package.json                   # Dependencies (canonicalize)
└── README.md                      # This file
```

---

## Running Tests

### Quick Test (ssi-verify)

```bash
cd tools/ssi-verify
npm test
```

**Output:**
```
🔐 Running ssi-verify Golden Test Vectors

🧪 Testing valid-chain-10...
  ✓ Passed - integrity_status: VALID, tamper_evidence: 0

🧪 Testing tampered-record...
  ✓ Passed - integrity_status: INVALID, tamper_evidence: 1

...

📊 Results: 5 passed, 0 failed

✅ All tests PASSED
```

### Manual Verification

```bash
cd tools/ssi-verify

# Test valid chain
node dist/index.js report \
  --in ../../tests/vectors/rpx/valid-chain-10.jsonl \
  --out /tmp/test-output.json
echo "Exit code: $?"  # Should be 0

# Test tampered record
node dist/index.js report \
  --in ../../tests/vectors/rpx/tampered-record.jsonl \
  --out /tmp/test-output.json
echo "Exit code: $?"  # Should be 1
```

---

## Regenerating Vectors

If you modify the canonical hash spec or schema, regenerate vectors:

```bash
cd tests/vectors
node generate-vectors.mjs

# Regenerate expected outputs
cd ../../tools/ssi-verify
for vector in ../../tests/vectors/rpx/*.jsonl; do
  basename=$(basename "$vector" .jsonl)
  node dist/index.js report \
    --in "$vector" \
    --out "../../tests/vectors/expected/${basename}.verification-report.json"
done
```

**⚠️ Warning:** Only regenerate if schema changes are intentional. Expected outputs are **canonical truth**.

---

## Comparison Rules

### Strict Comparison (MUST match exactly)

- `integrity_status` - VALID | INVALID | INCOMPLETE
- `compliance_level` - L1 | L2 | L3 | null
- `tamper_evidence.length` - Number of findings
- `constitutional_guarantees` - All boolean flags
- Exit code - 0 | 1 | 2

### Loose Comparison (Ignored)

- `report_id` - Randomly generated
- `timestamp` - Report generation time
- `proof_id` - Randomly generated
- `verification_timestamp` - Current time

### Finding Type Consistency

Tamper evidence `tampering_type` must use canonical codes:

- `hash-mismatch` - Computed hash ≠ stored hash
- `broken-link` - previous_hash doesn't match prior record_hash
- `timestamp-violation` - Timestamp monotonicity violated
- `schema-invalid` - Record doesn't conform to rpx-record.schema.json

---

## Exit Code Contract (Immutable)

| Code | Status | Meaning |
|------|--------|---------|
| 0 | `VALID` | Integrity verified, no tampering |
| 1 | `INVALID` | Tampering detected (hash mismatch, timestamp violation) |
| 2 | `INCOMPLETE` | Missing links, cannot establish continuity |

**These exit codes are part of the standard and MUST NOT change.**

---

## Cross-Language Verification

Python/Rust/Go implementations must:

1. **Match TypeScript canonical hash computation**
   - Same alphabetical key order
   - Same whitespace stripping
   - Same SHA-256 input
   - Same hex output (lowercase)

2. **Produce identical verification reports**
   - Same `integrity_status` for each vector
   - Same `tamper_evidence` findings (order can vary)
   - Same exit codes

3. **Pass all test vectors**
   - Run these 5 vectors as regression tests
   - CI must fail if behavior diverges

---

## Why This Matters

**From SSI SPEC §1.2:**
> "Autonomous systems must generate tamper-evident audit trails that can be independently verified without trusting the system operator."

Test vectors ensure **verification itself is trustworthy**:

- **Court admissibility**: Golden outputs = canonical truth
- **Standards compliance**: No implementation drift across versions
- **Regulatory confidence**: Third parties can validate verifier behavior
- **Portable trust**: Verification works the same everywhere

---

## Maintenance

**When to update vectors:**

- ✅ Schema changes (decision_type enum, new required fields)
- ✅ Hash algorithm changes (extremely rare, requires versioning)
- ✅ New tampering detection methods

**When NOT to update:**

- ❌ "I don't like the output format" (unless schema changes)
- ❌ "Exit codes are confusing" (exit codes are immutable)
- ❌ "Test is too strict" (strictness prevents drift)

**Process for updates:**

1. Discuss change in GitHub issue/RFC
2. Update schema + specification docs
3. Regenerate vectors with new spec
4. Update all implementations (TypeScript, Python, Rust)
5. Verify cross-language consistency
6. Commit updated vectors with RFC reference

---

## License

Apache-2.0 (same as SSI Protocol)

Test vectors are **public domain** - use freely for verification testing.

---

## Links

- [ssi-verify CLI](../../tools/ssi-verify/README.md)
- [RPX Record Schema](../../schemas/rpx-record.schema.json)
- [Verification Report Schema](../../schemas/verification-report.schema.json)
- [SSI Protocol Specification](../../README.md)
