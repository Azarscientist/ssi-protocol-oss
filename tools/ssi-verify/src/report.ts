/**
 * Verification report generation
 */

import { RPXRecord } from './hash';
import { verifyChain } from './verifyChain';

export interface VerificationReport {
  $schema: string;
  report_id: string;
  timestamp: string;
  chain_id: string;
  verification_scope: {
    records_verified: number;
    time_range: {
      earliest: string;
      latest: string;
    };
  };
  integrity_status: 'VALID' | 'INVALID' | 'INCOMPLETE';
  compliance_details: {
    constitutional_guarantees: {
      rpx_records_present: boolean;
      fail_closed_verified: boolean;
      human_escalation_available: boolean;
      hash_chain_intact: boolean;
      context_captured: boolean;
    };
    compliance_level: 'L1' | 'L2' | 'L3' | null;
    notes: string;
  };
  tamper_evidence: {
    record_id: string;
    tampering_type: string;
    description: string;
    position: number;
  }[];
  chain_metadata: {
    genesis_hash: string;
    current_head: string;
    decision_types: string[];
    agent_count: number;
  };
}

/**
 * Generate comprehensive verification report
 * 
 * @param records - RPX records to verify
 * @param chainId - Optional chain identifier
 * @returns Verification report conforming to verification-report.schema.json
 */
export function generateVerificationReport(
  records: RPXRecord[], 
  chainId?: string
): VerificationReport {
  
  // Verify chain
  const chainResult = verifyChain(records, chainId);
  
  if (!chainResult.proof) {
    throw new Error('Chain verification did not produce proof');
  }

  // Collect metadata
  const timestamps = records.map(r => r.timestamp).sort();
  const decisionTypes = [...new Set(records.map(r => r.decision_type))];
  const agents = [...new Set(records.map(r => r.agent_id))];

  // Check constitutional guarantees (SPEC §2.1-2.5)
  const guarantees = {
    rpx_records_present: records.every(r => 
      r.record_id && r.timestamp && r.decision_type && r.outcome
    ),
    fail_closed_verified: false, // Cannot verify from static records (requires runtime inspection)
    human_escalation_available: false, // Cannot verify from static records (requires system inspection)
    hash_chain_intact: chainResult.status === 'VALID',
    context_captured: records.every(r => r.context_hash && r.context_hash.length === 64)
  };

  // Determine compliance level
  let complianceLevel: 'L1' | 'L2' | 'L3' | null = null;
  let complianceNotes = '';

  if (chainResult.status === 'VALID') {
    // L1: Basic record keeping
    if (guarantees.rpx_records_present && guarantees.context_captured) {
      complianceLevel = 'L1';
      complianceNotes = 'L1 (Basic): RPX records present with context capture. Cannot verify fail-closed or escalation from static chain.';
    }
    // L2/L3 require runtime system verification
  } else {
    complianceNotes = `Chain integrity failed: ${chainResult.status}. Cannot assess compliance level.`;
  }

  // Generate report
  const report: VerificationReport = {
    $schema: '../../schemas/verification-report.schema.json',
    report_id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: new Date().toISOString(),
    chain_id: chainId || chainResult.proof.chain_id,
    verification_scope: {
      records_verified: records.length,
      time_range: {
        earliest: timestamps[0],
        latest: timestamps[timestamps.length - 1]
      }
    },
    integrity_status: chainResult.status,
    compliance_details: {
      constitutional_guarantees: guarantees,
      compliance_level: complianceLevel,
      notes: complianceNotes
    },
    tamper_evidence: chainResult.proof.tamper_evidence,
    chain_metadata: {
      genesis_hash: chainResult.proof.genesis_hash,
      current_head: chainResult.proof.current_head,
      decision_types: decisionTypes,
      agent_count: agents.length
    }
  };

  return report;
}
