# SSI Protocol - Implementation Guide

This guide covers how to run SSI Protocol reference implementations.

**This file is non-normative.** Compliance requirements are defined in the constitutional documents.

---

## Quick Start

### 1. Read the Constitutional Framework

Read the five constitutional documents in order:

1. [SPEC.md](SPEC.md) — Understand core invariants
2. [DECISIONS.md](DECISIONS.md) — Learn what constitutes a decision
3. [AUDIT.md](AUDIT.md) — See how verification works
4. [FAILURE.md](FAILURE.md) — Understand fail-closed semantics
5. [COMPLIANCE.md](COMPLIANCE.md) — Review certification requirements

### 2. Run Reference Implementation

```bash
# Clone repository
git clone https://github.com/Jtjr86/ssi-protocol-oss.git
cd ssi-protocol-oss

# Start SSI Gateway
cd reference/gateway
npm install
npm start

# In another terminal, start SSI Kernel
cd reference/kernel
npm install
npm start
```

### 3. Make Your First Decision

```bash
# Submit decision request
curl -X POST http://localhost:4041/api/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test-agent-001",
    "decision_type": "EXAMPLE_ACTION",
    "context": {
      "description": "Test decision for SSI evaluation"
    }
  }'

# Response includes RPX record with hash chain
{
  "outcome": "ALLOW",
  "record_id": "550e8400-e29b-41d4-a716-446655440000",
  "record_hash": "7b3e4f2a...",
  "previous_hash": "a2f9c1d5...",
  "timestamp": "2025-12-17T14:32:11Z"
}
```

### 4. Verify Hash Chain

Verification procedures are defined in [AUDIT.md](AUDIT.md). Reference implementation provides verification tooling (check `reference/gateway` for verification scripts).

---

## System Requirements

- Node.js 18+ (reference implementations)
- PostgreSQL 14+ (Gateway storage, optional)
- 2GB RAM minimum
- Docker (optional, for containerized deployment)

---

## Production Deployment

**Critical reminders:**
- Ensure fail-closed defaults are enforced (see [FAILURE.md](FAILURE.md))
- Ensure RPX records are immutable and hash-chained (see [AUDIT.md](AUDIT.md))
- Treat this guide as operational documentation, not constitutional specification

For production setup:
- Configure high-availability PostgreSQL
- Set up monitoring and alerting
- Implement backup and recovery procedures
- Review [FAILURE.md](FAILURE.md) for emergency halt procedures

---

## Troubleshooting

### Gateway won't start
- Check PostgreSQL connection (if using database storage)
- Verify port 4041 is available
- Review logs for error details

### Kernel policy errors
- Validate policy syntax
- Check policy file permissions
- Review fail-closed behavior in [FAILURE.md](FAILURE.md)

### Hash chain verification fails
- **DO NOT** modify RPX records manually
- Check for database corruption
- Review [AUDIT.md](AUDIT.md) for verification procedures
- If tampering suspected, follow incident response in [SECURITY.md](SECURITY.md)

---

**This is an implementation guide. Compliance is defined in the constitutional documents.**
