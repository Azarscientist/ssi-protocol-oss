/*
 * Copyright 2025 Jtjr86
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FileUploadZoneProps {
  onUpload: (files: { report?: any; chain?: any[]; raw: any[] }) => void;
}

export function FileUploadZone({ onUpload }: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const parseJSONL = (text: string): any[] => {
    return text
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  };

  const processFiles = async (fileList: FileList) => {
    setError(null);
    setProcessing(true);

    try {
      const files = Array.from(fileList);
      let report: any = null;
      let chain: any[] = [];
      const raw: any[] = [];

      for (const file of files) {
        const text = await file.text();
        raw.push({ name: file.name, content: text });

        if (file.name.endsWith('.jsonl')) {
          // Parse RPX chain
          try {
            chain = parseJSONL(text);
          } catch (e) {
            setError(`Failed to parse ${file.name} as JSONL`);
            setProcessing(false);
            return;
          }
        } else if (file.name.endsWith('.json')) {
          // Parse verification report or chain proof
          try {
            const parsed = JSON.parse(text);
            
            // Detect if this is a verification report (has integrity_status)
            if (parsed.integrity_status || parsed.findings || parsed.compliance_level) {
              report = parsed;
            } else if (Array.isArray(parsed.chain)) {
              // Could be a chain proof with embedded chain array
              chain = parsed.chain;
              report = parsed;
            }
          } catch (e) {
            setError(`Failed to parse ${file.name} as JSON`);
            setProcessing(false);
            return;
          }
        } else {
          setError(`Unsupported file type: ${file.name}. Use .jsonl or .json files.`);
          setProcessing(false);
          return;
        }
      }

      if (!report && chain.length === 0) {
        setError("No valid RPX chain or verification report found in uploaded files.");
        setProcessing(false);
        return;
      }

      onUpload({ report, chain, raw });
    } catch (e: any) {
      setError(`Upload failed: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle>Upload Verification Artifacts</CardTitle>
        <CardDescription>
          Drag & drop or click to upload RPX chains (.jsonl) and verification reports (.json)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            dragActive 
              ? 'border-ssi-teal bg-ssi-teal/5' 
              : 'border-gray-300 hover:border-gray-400'
          } ${processing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".jsonl,.json"
            onChange={handleFileChange}
            disabled={processing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-ssi-teal/10 rounded-full flex items-center justify-center">
              <Upload className="text-ssi-teal" size={32} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {processing ? "Processing files..." : "Drop files here or click to browse"}
              </p>
              <p className="text-sm text-gray-600">
                Accepts: *.jsonl (RPX chains), verification-report.json, chain-proof.json
              </p>
            </div>

            <div className="flex gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText size={14} />
                .jsonl
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText size={14} />
                .json
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
