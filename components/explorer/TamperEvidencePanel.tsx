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

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Link2Off, Hash, Clock, FileX, AlertCircle } from "lucide-react";

interface TamperEvidencePanelProps {
  findings: any[];
  onFindingClick: (recordIndex: number) => void;
}

export function TamperEvidencePanel({ findings, onFindingClick }: TamperEvidencePanelProps) {
  const getFindingIcon = (type: string) => {
    const typeMap: Record<string, any> = {
      'broken-link': Link2Off,
      'hash-mismatch': Hash,
      'timestamp-violation': Clock,
      'schema-invalid': FileX,
      'missing-record': AlertCircle,
    };
    return typeMap[type] || AlertTriangle;
  };

  const getFindingColor = (severity: string) => {
    const severityMap: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return severityMap[severity?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Group findings by type
  const groupedFindings = findings.reduce((acc: any, finding: any) => {
    const type = finding.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(finding);
    return acc;
  }, {});

  return (
    <Card className="border-2 border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle size={20} />
          Tamper Evidence ({findings.length} findings)
        </CardTitle>
        <CardDescription>
          Integrity violations detected by verification tool
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {Object.entries(groupedFindings).map(([type, typedFindings]: [string, any]) => {
            const Icon = getFindingIcon(type);
            
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {type.replace(/-/g, ' ')} ({typedFindings.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {typedFindings.map((finding: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (finding.record_index !== undefined) {
                          onFindingClick(finding.record_index);
                        } else if (finding.position !== undefined) {
                          onFindingClick(finding.position);
                        }
                      }}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                        getFindingColor(finding.severity)
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {finding.record_index !== undefined && (
                            <Badge variant="outline" className="font-mono text-xs">
                              Record #{finding.record_index}
                            </Badge>
                          )}
                          {finding.position !== undefined && (
                            <Badge variant="outline" className="font-mono text-xs">
                              Position {finding.position}
                            </Badge>
                          )}
                          {finding.severity && (
                            <Badge variant="outline" className="text-xs uppercase">
                              {finding.severity}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm font-medium mb-1">
                        {finding.message || finding.description || 'No description provided'}
                      </p>

                      {finding.details && (
                        <div className="text-xs font-mono bg-white/50 p-2 rounded mt-2">
                          {typeof finding.details === 'string' 
                            ? finding.details
                            : JSON.stringify(finding.details, null, 2)
                          }
                        </div>
                      )}

                      {finding.expected !== undefined && finding.actual !== undefined && (
                        <div className="mt-2 text-xs space-y-1">
                          <div>
                            <span className="text-gray-600">Expected:</span>
                            <code className="ml-2 bg-white/50 px-1 rounded">{String(finding.expected)}</code>
                          </div>
                          <div>
                            <span className="text-gray-600">Actual:</span>
                            <code className="ml-2 bg-white/50 px-1 rounded">{String(finding.actual)}</code>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Forensic Note:</strong> These findings were generated by the ssi-verify CLI tool. 
          Click any finding to jump to the affected record in the timeline.
        </div>
      </CardContent>
    </Card>
  );
}
