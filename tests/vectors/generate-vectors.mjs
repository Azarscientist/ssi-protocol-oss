/**
 * Generate test vectors for ssi-verify
 * 
 * Run: node generate-vectors.mjs
 */

import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import canonicalize from 'canonicalize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GENESIS_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function computeRecordHash(record) {
  const { record_hash, metadata, ...hashableFields } = record;
  const canonical = canonicalize(hashableFields);
  if (!canonical) throw new Error('Failed to canonicalize');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function generateValidChain(count) {
  const records = [];
  const baseTime = new Date('2025-12-01T00:00:00.000000Z').getTime();

  for (let i = 0; i < count; i++) {
    const recordId = `rec_2025-12-01_${String(i).padStart(3, '0')}`; // Meets 8-64 char requirement
    const timestamp = new Date(baseTime + i * 60000).toISOString().replace(/\.000Z$/, '.000000Z'); // Microseconds
    const previousHash = i === 0 ? GENESIS_HASH : records[i - 1].record_hash;
    const decisionType = ['authorization.action', 'safety.constraint', 'policy.evaluation'][i % 3]; // Valid enum values
    const agentId = `dealgo-v1-${i % 3}`;
    const outcome = ['ALLOW', 'DENY', 'ESCALATE'][i % 3];
    const contextHash = createHash('sha256').update(`context_${i}`).digest('hex');
    const policyVersion = 'policy-v1.0.0';
    const actionType = `action_type_${i % 3}`;
    const reason = `Decision reason for record ${i}`;

    const recordWithoutHash = {
      record_id: recordId,
      timestamp,
      previous_hash: previousHash,
      decision_type: decisionType,
      agent_id: agentId,
      outcome,
      context_hash: contextHash,
      policy_version: policyVersion,
      action_type: actionType,
      reason
    };

    const recordHash = computeRecordHash(recordWithoutHash);

    const record = {
      ...recordWithoutHash,
      record_hash: recordHash,
      metadata: {
        test_vector: 'valid-chain-10',
        record_index: i
      }
    };

    records.push(record);
  }

  return records;
}

function writeJSONL(filePath, records) {
  const lines = records.map(r => JSON.stringify(r)).join('\n');
  writeFileSync(filePath, lines + '\n', 'utf-8');
}

function main() {
  const outputDir = join(__dirname, 'rpx');

  // 1. Generate valid chain
  console.log('Generating valid-chain-10.jsonl...');
  const validChain = generateValidChain(10);
  writeJSONL(join(outputDir, 'valid-chain-10.jsonl'), validChain);
  console.log('✓ valid-chain-10.jsonl created');

  // 2. Generate tampered record (modify field in record #5)
  console.log('\nGenerating tampered-record.jsonl...');
  const tamperedChain = [...validChain];
  // Tamper with record #5 - change outcome without updating hash
  tamperedChain[5] = {
    ...tamperedChain[5],
    outcome: tamperedChain[5].outcome === 'ALLOW' ? 'DENY' : 'ALLOW'
    // record_hash stays the same → hash mismatch
  };
  writeJSONL(join(outputDir, 'tampered-record.jsonl'), tamperedChain);
  console.log('✓ tampered-record.jsonl created (record #5 outcome changed, hash unchanged)');

  // 3. Generate missing link (delete record #5)
  console.log('\nGenerating missing-link.jsonl...');
  const missingLinkChain = validChain.filter((_, i) => i !== 5);
  writeJSONL(join(outputDir, 'missing-link.jsonl'), missingLinkChain);
  console.log('✓ missing-link.jsonl created (record #5 deleted)');

  // 4. Generate reordered chain (swap records #6 and #7)
  console.log('\nGenerating reordered.jsonl...');
  const reorderedChain = [...validChain];
  [reorderedChain[6], reorderedChain[7]] = [reorderedChain[7], reorderedChain[6]];
  writeJSONL(join(outputDir, 'reordered.jsonl'), reorderedChain);
  console.log('✓ reordered.jsonl created (records #6 and #7 swapped)');

  // 5. Generate bad timestamp (timestamp goes backward at record #6)
  console.log('\nGenerating bad-timestamp.jsonl...');
  const badTimestampChain = [...validChain];
  const earlierTime = new Date(new Date(validChain[5].timestamp).getTime() - 60000).toISOString().replace(/\.000Z$/, '.000000Z');
  
  // Recompute record #6 with earlier timestamp
  const rec6WithoutHash = {
    record_id: validChain[6].record_id,
    timestamp: earlierTime,
    previous_hash: validChain[6].previous_hash,
    decision_type: validChain[6].decision_type,
    agent_id: validChain[6].agent_id,
    outcome: validChain[6].outcome,
    context_hash: validChain[6].context_hash,
    policy_version: validChain[6].policy_version,
    action_type: validChain[6].action_type,
    reason: validChain[6].reason
  };
  
  const newHash = computeRecordHash(rec6WithoutHash);
  
  badTimestampChain[6] = {
    ...rec6WithoutHash,
    record_hash: newHash,
    metadata: validChain[6].metadata
  };

  writeJSONL(join(outputDir, 'bad-timestamp.jsonl'), badTimestampChain);
  console.log('✓ bad-timestamp.jsonl created (record #6 timestamp goes backward)');

  console.log('\n✅ All test vectors generated successfully!');
  console.log('\nNext steps:');
  console.log('1. cd ../../tools/ssi-verify');
  console.log('2. npm run build');
  console.log('3. Run ssi-verify on each vector to generate expected outputs');
}

main();
