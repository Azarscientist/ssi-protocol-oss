/**
 * Single RPX record verification
 */

import { RPXRecord, verifyRecordHash } from './hash';
import { validateRecord } from './schema';

export interface RecordVerificationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Verify single RPX record
 * 
 * Checks:
 * 1. Schema compliance
 * 2. Hash integrity (recompute and compare)
 * 
 * @param record - RPX record to verify
 * @returns Verification result
 */
export function verifyRecord(record: RPXRecord): RecordVerificationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Schema validation
  const schemaResult = validateRecord(record);
  if (!schemaResult.valid) {
    errors.push('Schema validation failed:');
    if (schemaResult.errors) {
      errors.push(...schemaResult.errors);
    }
    return { valid: false, errors };
  }

  // 2. Hash integrity
  const hashValid = verifyRecordHash(record);
  if (!hashValid) {
    errors.push(`Hash mismatch for record ${record.record_id}: stored hash does not match computed hash`);
    return { valid: false, errors };
  }

  // Warnings (non-fatal)
  if (!record.action_type) {
    warnings.push('No action_type specified (optional field)');
  }
  if (!record.reason) {
    warnings.push('No reason specified (optional field)');
  }

  return { 
    valid: true, 
    errors: [],
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
