/**
 * RPX chain verification
 */

import { RPXRecord, GENESIS_HASH, isGenesisHash } from './hash';
import { verifyRecord } from './verifyRecord';

export interface TamperEvidence {
  record_id: string;
  tampering_type: 'hash-mismatch' | 'broken-link' | 'timestamp-violation' | 'schema-invalid';
  description: string;
  position: number;
}

export interface ChainProof {
  $schema: string;
  proof_id: string;
  chain_id: string;
  genesis_hash: string;
  current_head: string;
  record_count: number;
  verification_timestamp: string;
  integrity_status: 'VALID' | 'INVALID' | 'INCOMPLETE';
  tamper_evidence: TamperEvidence[];
  sample_records?: {
    position: number;
    record_id: string;
    timestamp: string;
    record_hash: string;
  }[];
}

export interface ChainVerificationResult {
  valid: boolean;
  status: 'VALID' | 'INVALID' | 'INCOMPLETE';
  errors: string[];
  proof?: ChainProof;
}

/**
 * Verify RPX chain integrity
 * 
 * Checks:
 * 1. All records pass individual verification (schema + hash)
 * 2. Genesis record has correct previous_hash
 * 3. Chain continuity: record[i].previous_hash === record[i-1].record_hash
 * 4. Timestamp monotonicity: timestamps non-decreasing
 * 
 * @param records - Array of RPX records (in chain order)
 * @param chainId - Optional chain identifier
 * @returns Chain verification result with proof
 */
export function verifyChain(records: RPXRecord[], chainId?: string): ChainVerificationResult {
  const errors: string[] = [];
  const tamperEvidence: TamperEvidence[] = [];

  // Empty chain
  if (records.length === 0) {
    return {
      valid: false,
      status: 'INCOMPLETE',
      errors: ['Chain is empty']
    };
  }

  // 1. Verify each record individually
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const result = verifyRecord(record);
    
    if (!result.valid) {
      tamperEvidence.push({
        record_id: record.record_id,
        tampering_type: 'schema-invalid',
        description: `Record ${i} failed validation: ${result.errors.join('; ')}`,
        position: i
      });
      errors.push(`Record ${i} (${record.record_id}): ${result.errors.join('; ')}`);
    }
  }

  // 2. Verify genesis record
  const genesisRecord = records[0];
  if (!isGenesisHash(genesisRecord.previous_hash)) {
    tamperEvidence.push({
      record_id: genesisRecord.record_id,
      tampering_type: 'broken-link',
      description: `Genesis record has invalid previous_hash: ${genesisRecord.previous_hash} (expected: ${GENESIS_HASH})`,
      position: 0
    });
    errors.push(`Genesis record has invalid previous_hash`);
  }

  // 3. Verify chain continuity and timestamp monotonicity
  for (let i = 1; i < records.length; i++) {
    const current = records[i];
    const previous = records[i - 1];

    // Check chain link
    if (current.previous_hash !== previous.record_hash) {
      tamperEvidence.push({
        record_id: current.record_id,
        tampering_type: 'broken-link',
        description: `Record ${i} previous_hash (${current.previous_hash}) does not match record ${i-1} hash (${previous.record_hash})`,
        position: i
      });
      errors.push(`Broken chain link at position ${i}: ${current.record_id}`);
    }

    // Check timestamp monotonicity
    const currentTime = new Date(current.timestamp).getTime();
    const previousTime = new Date(previous.timestamp).getTime();
    
    if (currentTime < previousTime) {
      tamperEvidence.push({
        record_id: current.record_id,
        tampering_type: 'timestamp-violation',
        description: `Record ${i} timestamp (${current.timestamp}) is before record ${i-1} timestamp (${previous.timestamp}) - possible reordering`,
        position: i
      });
      errors.push(`Timestamp violation at position ${i}: ${current.record_id}`);
    }
  }

  // Determine status
  let status: 'VALID' | 'INVALID' | 'INCOMPLETE';
  if (tamperEvidence.length === 0) {
    status = 'VALID';
  } else {
    // Check if any evidence indicates incomplete chain (missing records)
    const hasIncomplete = tamperEvidence.some(e => 
      e.tampering_type === 'broken-link' && !e.description.includes('Genesis')
    );
    status = hasIncomplete ? 'INCOMPLETE' : 'INVALID';
  }

  // Generate chain proof
  const proof: ChainProof = {
    $schema: '../../schemas/chain-proof.schema.json',
    proof_id: `proof-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    chain_id: chainId || `chain-${records[0].record_id}`,
    genesis_hash: records[0].record_hash,
    current_head: records[records.length - 1].record_hash,
    record_count: records.length,
    verification_timestamp: new Date().toISOString(),
    integrity_status: status,
    tamper_evidence: tamperEvidence,
    sample_records: [
      // First record
      {
        position: 0,
        record_id: records[0].record_id,
        timestamp: records[0].timestamp,
        record_hash: records[0].record_hash
      },
      // Last record
      ...(records.length > 1 ? [{
        position: records.length - 1,
        record_id: records[records.length - 1].record_id,
        timestamp: records[records.length - 1].timestamp,
        record_hash: records[records.length - 1].record_hash
      }] : []),
      // Middle record (if chain > 2)
      ...(records.length > 2 ? [{
        position: Math.floor(records.length / 2),
        record_id: records[Math.floor(records.length / 2)].record_id,
        timestamp: records[Math.floor(records.length / 2)].timestamp,
        record_hash: records[Math.floor(records.length / 2)].record_hash
      }] : [])
    ]
  };

  return {
    valid: status === 'VALID',
    status,
    errors,
    proof
  };
}
