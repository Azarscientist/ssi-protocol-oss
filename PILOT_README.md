# SSI Protocol: Pilot Deployment Guide

**Version:** 0.3.1  
**Last Updated:** December 15, 2025  
**Time to Deploy:** 1 hour (local), 1 day (staging)  
**Audience:** Engineering teams evaluating cryptographic audit trails

---

## What You'll Get from This Pilot

By the end of this guide, you will:

1. ✅ **Run SSI Protocol locally** (Docker Compose, all services)
2. ✅ **Record 10+ AI decisions** through the Gateway API
3. ✅ **Verify chain integrity** using the verification endpoint
4. ✅ **See tamper detection** in action (break a chain, see it fail)
5. ✅ **Understand multi-tenant isolation** (separate audit trails)

**Time commitment:** 1 hour (plus optional staging deployment)  
**Prerequisites:** Docker, Node.js 18+, basic API testing skills  
**Support:** Open an issue at [github.com/Jtjr86/ssi-protocol-oss/issues](https://github.com/Jtjr86/ssi-protocol-oss/issues)

---

## Pre-Flight: What You Need

### Required
- **Docker Desktop** (or Docker Engine + Docker Compose)
- **Node.js 18+** (for running tests)
- **curl or Postman** (for API testing)
- **5 GB disk space** (for PostgreSQL + services)

### Optional (for Staging Deployment)
- **AWS/Azure/GCP account** (for hosted PostgreSQL)
- **JWT signing key** (RS256 or ES256 keypair)
- **Domain name** (for HTTPS endpoints)

---

## Step 1: Clone and Configure (15 minutes)

### 1.1 Clone the Repository

```bash
git clone https://github.com/Jtjr86/ssi-protocol-oss.git
cd ssi-protocol-oss
```

### 1.2 Configure Environment Variables

Copy the example environment file and generate your own cryptographic signing seed:

```bash
cd reference/gateway
cp .env.example .env
```

Generate a secure signing seed:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Edit `.env` and replace the `SIGNING_SEED` value with your generated seed:

```dotenv
# Before (placeholder):
SIGNING_SEED=0000000000000000000000000000000000000000000000000000000000000000

# After (your generated value):
SIGNING_SEED=89cad00929764469db14b5e414191535403d324930f5fb3bd680904cda574c69
```

⚠️ **CRITICAL SECURITY NOTES:**
- **NEVER commit your `.env` file to version control** (it's in `.gitignore` by default)
- This seed controls the cryptographic signing key for ALL audit records
- If compromised, an attacker could forge audit trail entries
- For production: Migrate to AWS KMS, Azure Key Vault, or Google Cloud KMS

### 1.3 Start All Services

```bash
cd ../..  # Back to repo root
docker-compose -f docker/docker-compose.yml up -d
```

**What this does:**
- Starts **PostgreSQL** (audit trail database)
- Starts **Gateway** (API server on port 4040)
- Starts **Kernel** (policy evaluation service on port 5050)
- Runs **schema migrations** (creates tables, seeds dev API keys)

### 1.4 Verify Services Are Running

```bash
docker ps
```

You should see:
- `ssi-gateway` (port 4040)
- `ssi-kernel` (port 5050)
- `ssi-postgres` (port 5432)

**Health check:**

```bash
curl http://localhost:4040/health
# Expected: {"status":"ok","version":"0.3.1"}
```

---

## Step 2: Record Your First Decision (5 minutes)

### 2.1 Dev API Keys (Local Testing)

The Docker stack seeds three test API keys for local development:

| Role | Tenant | API Key | Permissions |
|------|--------|---------|-------------|
| **Admin** | tenant-alpha | `ssi_test_admin_key_alpha_2024` | Can POST decisions |
| **Auditor** | tenant-alpha | `ssi_test_auditor_key_alpha_2024` | Can verify chains |
| **Viewer** | tenant-beta | `ssi_test_viewer_key_beta_2024` | Can verify single entries |

⚠️ **SECURITY WARNING:**
- These keys are **FOR LOCAL DEVELOPMENT ONLY**
- They expire in 2026 and are hardcoded in the seed script
- **Production deployments MUST generate real API keys** (see Step 8)
- Never use these keys outside of localhost testing

### 2.2 Request Schema

The Gateway expects this JSON structure:

```json
{
  "client_id": "string",        // Who made the request (user ID, service name)
  "system_id": "string",         // Which system/environment (e.g., "trading-prod")
  "action": {
    "type": "string",            // Action type (e.g., "trade.order.place")
    "payload": { }               // Action-specific data (inputs, outputs, metadata)
  }
}
```

> **Note**: If you're used to `{actor, action, data}` from conceptual docs:
> - `actor` → `client_id` (or include in `action.payload`)
> - `action` → `action.type`
> - `data` → `action.payload`

### 2.3 Create a Test Decision

**Example: Record a trading decision**

```bash
curl -X POST http://localhost:4040/v1/decisions \
  -H "Content-Type: application/json" \
  -H "x-api-key: ssi_test_admin_key_alpha_2024" \
  -d '{
    "client_id": "trader-alice",
    "system_id": "trading-prod",
    "action": {
      "type": "trade.order.place",
      "payload": {
        "symbol": "AAPL",
        "qty": 10,
        "price": 150,
        "notional": 1500
      }
    }
  }'
```

**Expected response:**

```json
{
  "success": true,
  "decision": {
    "decision": "ALLOW",
    "reason": "Within policy limits.",
    "details": {
      "rules_evaluated": ["RULE-MAX-NOTIONAL-001", "RULE-MAX-OPEN-POSITIONS-001"],
      "rules_triggered": []
    },
    "provenance": {
      "lane": "prod",
      "envelope_id": "trading-safety-prod-v0.3.1",
      "envelope_version": "0.3.1"
    }
  },
  "rpx_id": "5e1a87f9-2922-4874-8ec7-5bf06f6d614d"
}
```

**What just happened:**
1. Gateway received your decision request
2. Kernel evaluated it against the `trading-safety-prod-v0.3.1` governance envelope
3. Policy check: notional $1,500 < limit $7,500 → **ALLOW**
4. Gateway canonicalized the entry (RFC 8785 deterministic JSON)
5. Gateway computed SHA-256 hash, signed with Ed25519, and chained to previous entry
6. PostgreSQL stored the cryptographically signed RPX entry
7. You got back the policy decision + `rpx_id` (cryptographic proof identifier)

### 2.4 Record a Few More Decisions

Try different scenarios:

```bash
# Policy violation (notional too high)
curl -X POST http://localhost:4040/v1/decisions \
  -H "Content-Type: application/json" \
  -H "x-api-key: ssi_test_admin_key_alpha_2024" \
  -d '{
    "client_id": "trader-bob",
    "system_id": "trading-prod",
    "action": {
      "type": "trade.order.place",
      "payload": {"symbol": "TSLA", "qty": 100, "price": 200, "notional": 20000}
    }
  }'
# Expected: "decision": "DENY", "reason": "Order notional 20000 exceeds max allowed 7500"

# Another allowed trade
curl -X POST http://localhost:4040/v1/decisions \
  -H "Content-Type: application/json" \
  -H "x-api-key: ssi_test_admin_key_alpha_2024" \
  -d '{
    "client_id": "trader-charlie",
    "system_id": "trading-prod",
    "action": {
      "type": "trade.order.place",
      "payload": {"symbol": "NVDA", "qty": 5, "price": 800, "notional": 4000}
    }
  }'
```

---

## Step 3: Verify Chain Integrity (5 minutes)

### 3.1 Verify a Single Decision

Take the `id` from Step 2.3 (e.g., `dec_abc123...`) and verify it:

```bash
curl http://localhost:4040/v1/audit/verify/dec_abc123... \
  -H "x-api-key: ssi_test_admin_key_alpha_2024"
```

**Expected response:**

```json
{
  "valid": true,
  "decision_id": "dec_abc123...",
  "hash_matches": true,
  "signature_valid": true,
  "chain_position": 5,
  "timestamp": "2025-12-15T10:30:00Z"
}
```

**What this proves:**
- ✅ The record's hash matches its content (not tampered)
- ✅ The Ed25519 signature is valid (signed by Kernel)
- ✅ The record exists in the database

### 3.2 Verify the Entire Chain

```bash
curl http://localhost:4040/v1/audit/verify-chain/dec_abc123... \
  -H "x-api-key: ssi_test_auditor_key_alpha_2024"
```

**Expected response:**

```json
{
  "valid": true,
  "chain_length": 5,
  "genesis_hash": "0000000000...",
  "latest_hash": "a1b2c3d4...",
  "broken_links": [],
  "verified_at": "2025-12-15T10:35:00Z"
}
```

**What this proves:**
- ✅ All records in the chain link correctly (no gaps)
- ✅ No records have been modified since creation
- ✅ The chain starts from a valid genesis block

---

## Step 4: See Tamper Detection (10 minutes)

This is the **critical test**. Can SSI Protocol actually detect tampering?

### 4.1 Manually Tamper with a Record

Connect to the database:

```bash
docker exec -it ssi-postgres psql -U ssi_user -d ssi_cloud
```

Find a decision ID:

```sql
SELECT id, action, hash FROM audit_decisions LIMIT 5;
```

Pick one and modify its data:

```sql
UPDATE audit_decisions
SET data = '{"tampered": true}'::jsonb
WHERE id = 'dec_abc123...';
```

### 4.2 Try to Verify the Chain Again

```bash
curl http://localhost:4040/v1/audit/verify-chain/dec_abc123... \
  -H "x-api-key: ssi_test_auditor_key_alpha_2024"
```

**Expected response:**

```json
{
  "valid": false,
  "chain_length": 5,
  "broken_links": [
    {
      "decision_id": "dec_abc123...",
      "expected_hash": "a1b2c3d4...",
      "actual_hash": "f9e8d7c6...",
      "reason": "hash_mismatch"
    }
  ],
  "verified_at": "2025-12-15T10:40:00Z"
}
```

**What this proves:**
- ✅ Tampering is **immediately detectable**
- ✅ The chain breaks at the exact tampered record
- ✅ Verification returns `valid: false` (not a silent failure)

### 4.3 Restore the Database (Clean Up)

```bash
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d
```

---

## Step 5: Test Multi-Tenant Isolation (10 minutes)

### 5.1 Record Decisions for Two Different Tenants

**Tenant A (Healthcare):**

```bash
curl -X POST http://localhost:4040/v1/decisions \
  -H "Content-Type: application/json" \
  -H "x-api-key: ssi_test_admin_key_alpha_2024" \
  -H "x-tenant-id: tenant-healthcare-001" \
  -d '{
    "client_id": "model:diagnosis-assistant",
    "system_id": "healthcare-prod",
    "action": {
      "type": "diagnosis.suggested",
      "payload": {"patient_id": "patient_123", "diagnosis": "hypertension"}
    }
  }'
```

**Tenant B (Finance):**

```bash
curl -X POST http://localhost:4040/v1/decisions \
  -H "Content-Type: application/json" \
  -H "x-api-key: ssi_test_admin_key_alpha_2024" \
  -H "x-tenant-id: tenant-finance-001" \
  -d '{
    "client_id": "model:fraud-detector",
    "system_id": "finance-prod",
    "action": {
      "type": "transaction.flagged",
      "payload": {"transaction_id": "txn_999", "fraud_score": 0.92}
    }
  }'
```

### 5.2 Verify Tenants Cannot See Each Other's Data

**Try to verify Tenant A's decision using Tenant B's context:**

```bash
curl http://localhost:4040/v1/audit/verify-chain/[tenant-A-decision-id] \
  -H "x-api-key: ssi_test_auditor_key_alpha_2024" \
  -H "x-tenant-id: tenant-finance-001"
```

**Expected response:**

```json
{
  "error": "Decision not found",
  "status": 404
}
```

**What this proves:**
- ✅ Tenant B cannot access Tenant A's audit trail
- ✅ Isolation is enforced at the database query level (not just API)

---

## Step 6: Test Role-Based Access Control (10 minutes)

SSI Protocol enforces three roles:

- **Viewer**: Can verify individual decisions (read-only)
- **Auditor**: Can verify chains (read-only + chain traversal)
- **Admin**: Can write new decisions

### 6.1 Test Viewer Permissions

**Viewer can verify a decision:**

```bash
curl http://localhost:4040/v1/audit/verify/dec_abc123... \
  -H "x-api-key: ssi_test_viewer_key_beta_2024"
# Expected: 200 OK
```

**Viewer CANNOT verify a chain:**

```bash
curl http://localhost:4040/v1/audit/verify-chain/dec_abc123... \
  -H "x-api-key: ssi_test_viewer_key_beta_2024"
# Expected: 403 Forbidden
```

**Viewer CANNOT write decisions:**

```bash
curl -X POST http://localhost:4040/v1/decisions \
  -H "Content-Type: application/json" \
  -H "x-api-key: ssi_test_viewer_key_beta_2024" \
  -d '{"client_id":"test","system_id":"test","action":{"type":"test","payload":{}}}'
# Expected: 403 Forbidden
```

### 6.2 Test Auditor Permissions

**Auditor can verify chains:**

```bash
curl http://localhost:4040/v1/audit/verify-chain/dec_abc123... \
  -H "x-api-key: ssi_test_auditor_key_alpha_2024"
# Expected: 200 OK
```

**Auditor CANNOT write decisions:**

```bash
curl -X POST http://localhost:4040/v1/decisions \
  -H "Content-Type: application/json" \
  -H "x-api-key: ssi_test_auditor_key_alpha_2024" \
  -d '{"client_id":"test","system_id":"test","action":{"type":"test","payload":{}}}'
# Expected: 403 Forbidden
```

---

## Step 7: Run the Full Test Suite (5 minutes)

Instead of manual API calls, run the automated tests:

```bash
npm install
npm test
```

**Expected output:**

```
✅ hash_chain_test.ts (5/5 tests passed)
✅ tenant_isolation_test.ts (5/5 tests passed)
✅ auth_api_key_test.ts (5/5 tests passed)
✅ jwt_auth_test.ts (5/5 tests passed)
✅ rbac_test.ts (6/6 tests passed)

Total: 26/26 tests passed (EXIT 0)
```

**What this proves:**
- ✅ All security guarantees are automatically tested
- ✅ You can run these tests in your own CI/CD pipeline

---

## Step 8: Generate Production API Keys (For Real Deployments)

⚠️ **DO NOT use the dev API keys (`ssi_test_*`) in production!**

### 8.1 Generate a Secure API Key

```bash
node -e "console.log('ssi_' + require('crypto').randomBytes(32).toString('hex'))"
```

Example output: `ssi_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

### 8.2 Hash the API Key

The database stores bcrypt-hashed keys (never plaintext):

```bash
npm install -g bcrypt-cli
echo -n "ssi_a1b2c3..." | bcrypt-cli 10
```

Example output: `$2b$10$abcd1234...`

### 8.3 Insert into Database

```sql
INSERT INTO api_keys (key_hash, role, tenant_id, expires_at)
VALUES (
  '$2b$10$abcd1234...',  -- Your bcrypt hash
  'admin',                -- Role: viewer, auditor, or admin
  'tenant-prod-001',      -- Your tenant ID
  '2026-12-31'            -- Expiration date
);
```

### 8.4 Distribute Securely

- Share the **plaintext key** (`ssi_a1b2c3...`) with your application via environment variable
- Store in **secret manager** (AWS Secrets Manager, Azure Key Vault, etc.)
- **Never log or commit** the plaintext key

---

## Next Steps: Staging Deployment (Optional)

If the local pilot works, you can deploy to staging:

### 9.1 Provision a PostgreSQL Database

**AWS RDS (Recommended):**

```bash
aws rds create-db-instance \
  --db-instance-identifier ssi-protocol-staging \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username ssi_admin \
  --master-user-password [SECURE_PASSWORD] \
  --allocated-storage 20
```

**Azure Database for PostgreSQL:**

```bash
az postgres server create \
  --resource-group ssi-protocol-rg \
  --name ssi-protocol-staging \
  --location eastus \
  --admin-user ssi_admin \
  --admin-password [SECURE_PASSWORD] \
  --sku-name B_Gen5_1
```

### 9.2 Run Migrations on Staging DB

```bash
export DATABASE_URL="postgresql://ssi_admin:[PASSWORD]@[DB_HOST]:5432/ssi_protocol"
npm run migrate
```

### 9.3 Deploy Gateway and Kernel

**Option A: Docker (Easiest)**

```bash
docker build -f docker/gateway.Dockerfile -t ssi-gateway .
docker run -p 4040:4040 \
  -e DATABASE_URL=$DATABASE_URL \
  -e SIGNING_SEED=$SIGNING_SEED \
  -e KERNEL_URL=http://kernel:5050 \
  -e PORT=4040 \
  ssi-gateway
```

**Option B: Kubernetes (Production)**

See `docs/kubernetes-deployment.md` (documentation coming soon)

### 9.4 Configure JWT Authentication (Optional)

Generate an RS256 keypair:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Set environment variables:

```bash
export JWT_PUBLIC_KEY=$(cat public.pem)
export JWT_ALGORITHM=RS256
```

### 9.5 Test Staging Deployment

```bash
curl https://your-staging-domain.com/health
# Expected: {"status":"ok","version":"0.3.1"}
```

---

## Troubleshooting

### Services won't start

**Check logs:**

```bash
docker-compose -f docker/docker-compose.yml logs gateway
docker-compose -f docker/docker-compose.yml logs kernel
```

**Common issues:**
- Port 4040/5050 already in use → Stop conflicting services
- PostgreSQL not ready → Wait 10 seconds, retry
- `.env` file missing → Run `cp .env.example .env` in `reference/gateway/`

### Tests failing

**Re-run migrations:**

```bash
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d
sleep 5
npm test
```

### API returns 401 Unauthorized

**Check API key:**

```bash
# List valid dev keys
docker exec -it ssi-postgres psql -U ssi_user -d ssi_cloud \
  -c "SELECT key_prefix, role, tenant_id FROM api_keys;"
```

**Valid dev keys** (see `reference/gateway/sql/003a_seed_dev_api_keys.sql`):
- `ssi_test_admin_key_alpha_2024` (admin, tenant-alpha)
- `ssi_test_auditor_key_alpha_2024` (auditor, tenant-alpha)
- `ssi_test_viewer_key_beta_2024` (viewer, tenant-beta)

⚠️ **Remember:** These are DEV ONLY. Generate real keys for production (see Step 8).

---

## What You've Proven

By completing this pilot, you've validated:

✅ **Cryptographic integrity works** (hash chains, signatures)  
✅ **Tamper detection works** (broken chains are caught)  
✅ **Multi-tenant isolation works** (no cross-tenant leakage)  
✅ **RBAC works** (roles enforced correctly)  
✅ **Tests pass reliably** (zero regressions)

---

## Feedback & Next Steps

We want to hear from you:

1. **Did this solve your audit trail problem?**
2. **What would make this production-ready for you?**
3. **What's blocking adoption?**

**Contact:**
- Open an issue: [github.com/Jtjr86/ssi-protocol-oss/issues](https://github.com/Jtjr86/ssi-protocol-oss/issues)
- Discussions: [github.com/Jtjr86/ssi-protocol-oss/discussions](https://github.com/Jtjr86/ssi-protocol-oss/discussions)

**If you want to go deeper:**
- Read `docs/WHY_SSI.md` (problem/solution narrative)
- Review `docs/CLAIM_MATRIX.md` (what we can/cannot claim)
- Check the protocol spec: `spec/README.md`

---

**End of Pilot Guide**

*If you got this far, you're evaluating seriously.*  
*Let's talk about production deployment.*
