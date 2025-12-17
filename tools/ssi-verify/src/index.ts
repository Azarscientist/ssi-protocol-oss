#!/usr/bin/env node

/**
 * ssi-verify CLI
 * 
 * Independent verification tool for SSI RPX chains
 * Enables third-party tamper detection and compliance reporting
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readJSON, readJSONL, writeJSON } from './io';
import { verifyRecord } from './verifyRecord';
import { verifyChain } from './verifyChain';
import { generateVerificationReport } from './report';
import { RPXRecord } from './hash';

// Exit codes
const EXIT_VALID = 0;
const EXIT_INVALID = 1;
const EXIT_INCOMPLETE = 2;

// CLI definition
yargs(hideBin(process.argv))
  .scriptName('ssi-verify')
  .version('1.0.0')
  .usage('$0 <command> [options]')
  
  // Command: verify single record
  .command(
    'record',
    'Verify single RPX record (schema + hash integrity)',
    (yargs) => {
      return yargs.option('in', {
        alias: 'i',
        type: 'string',
        demandOption: true,
        description: 'Input JSON file containing single RPX record'
      });
    },
    async (argv) => {
      try {
        const record: RPXRecord = readJSON(argv.in);
        const result = verifyRecord(record);

        if (result.valid) {
          console.log(`✓ Record ${record.record_id} is VALID`);
          if (result.warnings && result.warnings.length > 0) {
            console.log('\nWarnings:');
            result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
          }
          process.exit(EXIT_VALID);
        } else {
          console.error(`✗ Record ${record.record_id} is INVALID`);
          console.error('\nErrors:');
          result.errors.forEach(e => console.error(`  • ${e}`));
          process.exit(EXIT_INVALID);
        }
      } catch (err) {
        console.error(`Error: ${err}`);
        process.exit(EXIT_INVALID);
      }
    }
  )

  // Command: verify chain and emit proof
  .command(
    'chain',
    'Verify RPX chain integrity (continuity + tamper detection)',
    (yargs) => {
      return yargs
        .option('in', {
          alias: 'i',
          type: 'string',
          demandOption: true,
          description: 'Input JSONL file containing RPX records (one per line)'
        })
        .option('out', {
          alias: 'o',
          type: 'string',
          demandOption: true,
          description: 'Output file for chain-proof.json'
        })
        .option('chain-id', {
          type: 'string',
          description: 'Optional chain identifier'
        });
    },
    async (argv) => {
      try {
        const records = readJSONL(argv.in);
        const chainId = argv['chain-id'];
        
        console.log(`Verifying chain with ${records.length} records...`);
        
        const result = verifyChain(records, chainId);

        if (!result.proof) {
          console.error('Error: Chain verification did not produce proof');
          process.exit(EXIT_INVALID);
        }

        // Write proof
        writeJSON(argv.out, result.proof);
        console.log(`\nChain proof written to: ${argv.out}`);

        // Display results
        console.log(`\nStatus: ${result.status}`);
        console.log(`Records verified: ${records.length}`);
        console.log(`Genesis hash: ${result.proof.genesis_hash}`);
        console.log(`Current head: ${result.proof.current_head}`);

        if (result.proof.tamper_evidence.length > 0) {
          console.error(`\n⚠ Tamper evidence detected (${result.proof.tamper_evidence.length} issues):`);
          result.proof.tamper_evidence.forEach(e => {
            console.error(`  • [${e.tampering_type}] Position ${e.position}: ${e.description}`);
          });
        }

        // Exit code
        if (result.status === 'VALID') {
          console.log('\n✓ Chain is VALID (no tampering detected)');
          process.exit(EXIT_VALID);
        } else if (result.status === 'INVALID') {
          console.error('\n✗ Chain is INVALID (tampering detected)');
          process.exit(EXIT_INVALID);
        } else {
          console.error('\n⚠ Chain is INCOMPLETE (missing records or broken links)');
          process.exit(EXIT_INCOMPLETE);
        }
      } catch (err) {
        console.error(`Error: ${err}`);
        process.exit(EXIT_INVALID);
      }
    }
  )

  // Command: generate full verification report
  .command(
    'report',
    'Generate comprehensive verification report with compliance assessment',
    (yargs) => {
      return yargs
        .option('in', {
          alias: 'i',
          type: 'string',
          demandOption: true,
          description: 'Input JSONL file containing RPX records'
        })
        .option('out', {
          alias: 'o',
          type: 'string',
          demandOption: true,
          description: 'Output file for verification-report.json'
        })
        .option('chain-id', {
          type: 'string',
          description: 'Optional chain identifier'
        });
    },
    async (argv) => {
      try {
        const records = readJSONL(argv.in);
        const chainId = argv['chain-id'];

        console.log(`Generating verification report for ${records.length} records...`);

        const report = generateVerificationReport(records, chainId);

        // Write report
        writeJSON(argv.out, report);
        console.log(`\nVerification report written to: ${argv.out}`);

        // Display summary
        console.log(`\nReport ID: ${report.report_id}`);
        console.log(`Chain ID: ${report.chain_id}`);
        console.log(`Integrity Status: ${report.integrity_status}`);
        console.log(`Compliance Level: ${report.compliance_details.compliance_level || 'N/A'}`);
        console.log(`\nConstitutional Guarantees:`);
        Object.entries(report.compliance_details.constitutional_guarantees).forEach(([key, value]) => {
          const symbol = value ? '✓' : '✗';
          console.log(`  ${symbol} ${key.replace(/_/g, ' ')}`);
        });

        if (report.tamper_evidence.length > 0) {
          console.error(`\n⚠ Tamper Evidence (${report.tamper_evidence.length} issues):`);
          report.tamper_evidence.forEach(e => {
            console.error(`  • [${e.tampering_type}] Position ${e.position}: ${e.description}`);
          });
        }

        console.log(`\nNotes: ${report.compliance_details.notes}`);

        // Exit code
        if (report.integrity_status === 'VALID') {
          console.log('\n✓ Verification PASSED');
          process.exit(EXIT_VALID);
        } else if (report.integrity_status === 'INVALID') {
          console.error('\n✗ Verification FAILED (tampering detected)');
          process.exit(EXIT_INVALID);
        } else {
          console.error('\n⚠ Verification INCOMPLETE');
          process.exit(EXIT_INCOMPLETE);
        }
      } catch (err) {
        console.error(`Error: ${err}`);
        process.exit(EXIT_INVALID);
      }
    }
  )

  .demandCommand(1, 'You must specify a command (record, chain, or report)')
  .help()
  .alias('help', 'h')
  .parse();
