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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, Hash } from "lucide-react";

interface RecordDetailPanelProps {
  record: any;
  verificationReport?: any;
}

export function RecordDetailPanel({ record, verificationReport }: RecordDetailPanelProps) {
  if (!record) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent>
          <div className="text-center text-gray-500">
            <FileJson size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a record to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract computed hash if available in verification report
  const computedHash = verificationReport?.computed_hashes?.[record.index];

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson size={20} />
          Record Details
        </CardTitle>
        <CardDescription>
          Full record content and metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="formatted" className="h-[480px] flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            {computedHash && <TabsTrigger value="hash">Hash Info</TabsTrigger>}
          </TabsList>

          <TabsContent value="formatted" className="flex-1 overflow-hidden px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="space-y-3 text-sm">
                {Object.entries(record).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <div className="font-semibold text-gray-700 mb-1">{key}</div>
                    <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded break-all">
                      {typeof value === 'object' 
                        ? JSON.stringify(value, null, 2)
                        : String(value)
                      }
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="flex-1 overflow-hidden px-4 pb-4">
            <ScrollArea className="h-full">
              <pre className="text-xs font-mono bg-gray-50 p-4 rounded overflow-x-auto">
                {JSON.stringify(record, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>

          {computedHash && (
            <TabsContent value="hash" className="flex-1 overflow-hidden px-4 pb-4">
              <ScrollArea className="h-full">
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Hash size={16} />
                      Computed Hash
                    </div>
                    <div className="font-mono text-xs text-gray-900 bg-gray-50 p-3 rounded break-all">
                      {computedHash}
                    </div>
                  </div>

                  {record.record_hash && (
                    <div>
                      <div className="font-semibold text-gray-700 mb-2">Claimed Hash</div>
                      <div className="font-mono text-xs text-gray-900 bg-gray-50 p-3 rounded break-all">
                        {record.record_hash}
                      </div>
                    </div>
                  )}

                  {record.record_hash && computedHash && (
                    <div>
                      <div className="font-semibold text-gray-700 mb-2">Match Status</div>
                      <div className={`p-3 rounded ${
                        record.record_hash === computedHash
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                      }`}>
                        {record.record_hash === computedHash
                          ? '✓ Hashes match (integrity verified)'
                          : '✗ Hash mismatch (tampering detected)'
                        }
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Note:</strong> Hash verification requires the ssi-verify CLI tool. 
                    This UI only displays pre-computed values from verification reports.
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
