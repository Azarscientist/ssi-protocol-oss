/**
 * Schema validation for SSI artifacts
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Import schemas (will load from ../../schemas/)
import * as rpxRecordSchema from '../../../schemas/rpx-record.schema.json';
import * as chainProofSchema from '../../../schemas/chain-proof.schema.json';
import * as verificationReportSchema from '../../../schemas/verification-report.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Compile validators
const validateRPXRecord = ajv.compile(rpxRecordSchema);
const validateChainProof = ajv.compile(chainProofSchema);
const validateVerificationReport = ajv.compile(verificationReportSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate RPX record against schema
 */
export function validateRecord(record: any): ValidationResult {
  const valid = validateRPXRecord(record);
  
  if (!valid && validateRPXRecord.errors) {
    return {
      valid: false,
      errors: validateRPXRecord.errors.map(err => 
        `${err.instancePath} ${err.message}`
      )
    };
  }

  return { valid: true };
}

/**
 * Validate chain proof against schema
 */
export function validateChainProofOutput(proof: any): ValidationResult {
  const valid = validateChainProof(proof);
  
  if (!valid && validateChainProof.errors) {
    return {
      valid: false,
      errors: validateChainProof.errors.map(err => 
        `${err.instancePath} ${err.message}`
      )
    };
  }

  return { valid: true };
}

/**
 * Validate verification report against schema
 */
export function validateVerificationReportOutput(report: any): ValidationResult {
  const valid = validateVerificationReport(report);
  
  if (!valid && validateVerificationReport.errors) {
    return {
      valid: false,
      errors: validateVerificationReport.errors.map(err => 
        `${err.instancePath} ${err.message}`
      )
    };
  }

  return { valid: true };
}
