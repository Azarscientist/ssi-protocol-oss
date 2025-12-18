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

import { useState } from "react";
import { Download, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  report: any;
  chain: any[];
  uploadedFiles: any[];
}

export function ExportButton({ report, chain, uploadedFiles }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setExporting(true);

    try {
      // Generate case cover sheet
      const coverSheet = {
        export_timestamp: new Date().toISOString(),
        tool: "SSI Chain Explorer",
        version: "1.0.0",
        summary: {
          integrity_status: report?.integrity_status || "UNKNOWN",
          compliance_level: report?.compliance_level || "UNKNOWN",
          record_count: chain.length,
          finding_count: report?.findings?.length || 0,
        },
        files_included: [
          report ? "verification-report.json" : null,
          chain.length > 0 ? "chain-export.jsonl" : null,
          "case-cover-sheet.json",
        ].filter(Boolean),
      };

      // Download cover sheet
      downloadFile(
        JSON.stringify(coverSheet, null, 2),
        "case-cover-sheet.json",
        "application/json"
      );

      // Download verification report if present
      if (report) {
        downloadFile(
          JSON.stringify(report, null, 2),
          "verification-report.json",
          "application/json"
        );
      }

      // Download chain if present
      if (chain.length > 0) {
        const jsonl = chain.map(record => JSON.stringify(record)).join('\n');
        downloadFile(jsonl, "chain-export.jsonl", "application/x-ndjson");
      }

      // Download original uploaded files
      uploadedFiles.forEach((file: any) => {
        downloadFile(file.content, `original-${file.name}`, "text/plain");
      });

    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. See console for details.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      className="bg-ssi-teal hover:bg-ssi-teal/90 text-white"
    >
      {exporting ? (
        <>
          <FileArchive className="mr-2" size={18} />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2" size={18} />
          Download Evidence Bundle
        </>
      )}
    </Button>
  );
}
