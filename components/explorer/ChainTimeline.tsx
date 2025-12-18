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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";

interface ChainTimelineProps {
  records: any[];
  onRecordClick: (record: any) => void;
  selectedRecord: any;
}

export function ChainTimeline({ records, onRecordClick, selectedRecord }: ChainTimelineProps) {
  const getRecordHash = (record: any): string => {
    return record.record_hash || record.hash || "—";
  };

  const getPreviousHash = (record: any): string => {
    return record.previous_hash || record.prev_hash || "—";
  };

  const shortenHash = (hash: string): string => {
    if (hash === "—" || hash === "0".repeat(64)) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatTimestamp = (ts: string | number): string => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chain Timeline ({records.length} records)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="divide-y divide-gray-200">
            {records.map((record, index) => {
              const isSelected = selectedRecord === record;
              const recordHash = getRecordHash(record);
              const previousHash = getPreviousHash(record);
              
              return (
                <div
                  key={index}
                  onClick={() => onRecordClick(record)}
                  className={`p-4 cursor-pointer transition-all hover:bg-ssi-teal/5 ${
                    isSelected ? 'bg-ssi-teal/10 border-l-4 border-ssi-teal' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{index}
                        </Badge>
                        
                        {record.decision_type && (
                          <Badge variant="secondary" className="text-xs">
                            {record.decision_type}
                          </Badge>
                        )}
                        
                        {record.outcome && (
                          <Badge 
                            className={`text-xs ${
                              record.outcome === 'permit' || record.outcome === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : record.outcome === 'deny' || record.outcome === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {record.outcome}
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-gray-600 space-y-1 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-20">Timestamp:</span>
                          <span>{record.timestamp ? formatTimestamp(record.timestamp) : "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-20">Hash:</span>
                          <span className="text-blue-600" title={recordHash}>
                            {shortenHash(recordHash)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-20">Prev Hash:</span>
                          <span className="text-gray-700" title={previousHash}>
                            {shortenHash(previousHash)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight 
                      className={`flex-shrink-0 transition-transform ${isSelected ? 'text-ssi-teal rotate-90' : 'text-gray-400'}`} 
                      size={20} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
