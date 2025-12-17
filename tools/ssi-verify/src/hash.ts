/**
 * Canonical hash computation for SSI RPX records
 * 
 * Spec:
 * - Alphabetical key order (lexicographic)
 * - No whitespace (compact JSON)
 * - UTF-8 encoding
 * - Exclude: record_hash, metadata
 */

import * as crypto from 'crypto';
import canonicalize from 'canonicalize';

export interface RPXRecord {
  record_id: string;
  timestamp: string;
  previous_hash: string;
  decision_type: string;
  agent_id: string;
  outcome: 'ALLOW' | 'DENY' | 'ESCALATE';
  context_hash: string;
  policy_version: string;
  record_hash: string;
  action_type?: string;
  reason?: string;
  metadata?: any;
}

/**
 * Compute canonical hash of an RPX record
 * 
 * @param record - RPX record object
 * @returns SHA-256 hash (lowercase hex, 64 characters)
 */
export function computeRecordHash(record: RPXRecord): string {
  // Create copy and exclude fields not included in hash
  const { record_hash, metadata, ...hashableFields } = record;

  // Canonicalize: alphabetical keys, no whitespace, UTF-8
  const canonical = canonicalize(hashableFields);
  
  if (!canonical) {
    throw new Error('Failed to canonicalize record');
  }

  // Compute SHA-256
  const hash = crypto.createHash('sha256')
    .update(canonical, 'utf8')
    .digest('hex');

  return hash;
}

/**
 * Verify record hash integrity
 * 
 * @param record - RPX record to verify
 * @returns true if record_hash matches computed hash
 */
export function verifyRecordHash(record: RPXRecord): boolean {
  const computed = computeRecordHash(record);
  return computed === record.record_hash;
}

/**
 * Compute hash of record for chain linking
 * Same as record_hash but exposed for clarity
 * 
 * @param record - RPX record
 * @returns SHA-256 hash for chain linking
 */
export function getChainLinkHash(record: RPXRecord): string {
  return record.record_hash;
}

/**
 * Genesis hash constant (SHA-256 of empty string)
 * Used as previous_hash for first record in chain
 */
export const GENESIS_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

/**
 * Verify if hash is genesis hash
 */
export function isGenesisHash(hash: string): boolean {
  return hash === GENESIS_HASH;
}
