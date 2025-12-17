/**
 * File I/O utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { RPXRecord } from './hash';

/**
 * Read JSONL file (one JSON object per line)
 * 
 * @param filePath - Path to JSONL file
 * @returns Array of RPX records
 */
export function readJSONL(filePath: string): RPXRecord[] {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  const records: RPXRecord[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    try {
      const record = JSON.parse(lines[i]);
      records.push(record);
    } catch (err) {
      throw new Error(`Failed to parse line ${i + 1}: ${err}`);
    }
  }

  return records;
}

/**
 * Read single JSON file
 * 
 * @param filePath - Path to JSON file
 * @returns Parsed JSON object
 */
export function readJSON(filePath: string): any {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err}`);
  }
}

/**
 * Write JSON file with pretty printing
 * 
 * @param filePath - Path to output file
 * @param data - Data to write
 */
export function writeJSON(filePath: string, data: any): void {
  const absolutePath = path.resolve(filePath);
  const dir = path.dirname(absolutePath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(absolutePath, json, 'utf-8');
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}
