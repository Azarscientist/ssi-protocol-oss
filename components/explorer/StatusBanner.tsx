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

import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StatusBannerProps {
  report: any;
}

export function StatusBanner({ report }: StatusBannerProps) {
  const status = report.integrity_status?.toUpperCase() || "UNKNOWN";
  const complianceLevel = report.compliance_level || "UNKNOWN";
  const recordCount = report.chain?.record_count || report.record_count || 0;
  const findingCount = report.findings?.length || 0;

  // Determine status styling
  const statusConfig = {
    VALID: {
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-400",
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
      message: "Chain integrity verified",
    },
    INVALID: {
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-400",
      badgeBg: "bg-red-100",
      badgeText: "text-red-800",
      message: "Tampering detected",
    },
    INCOMPLETE: {
      icon: AlertTriangle,
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      badgeBg: "bg-yellow-100",
      badgeText: "text-yellow-800",
      message: "Integrity cannot be proven (missing continuity)",
    },
    UNKNOWN: {
      icon: Info,
      color: "text-gray-700",
      bg: "bg-gray-50",
      border: "border-gray-400",
      badgeBg: "bg-gray-100",
      badgeText: "text-gray-800",
      message: "Status unknown",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNKNOWN;
  const Icon = config.icon;

  // Format timestamp range if available
  const firstTimestamp = report.chain?.genesis_timestamp || report.first_timestamp;
  const lastTimestamp = report.chain?.head_timestamp || report.last_timestamp;
  const timeRange = firstTimestamp && lastTimestamp
    ? `${new Date(firstTimestamp).toLocaleString()} → ${new Date(lastTimestamp).toLocaleString()}`
    : null;

  return (
    <Card className={`border-l-4 ${config.border} ${config.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 rounded-full ${config.badgeBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={config.color} size={24} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-2xl font-bold ${config.color}`}>
                  {status}
                </h2>
                {complianceLevel !== "UNKNOWN" && (
                  <Badge variant="outline" className={`${config.badgeBg} ${config.badgeText} border-0`}>
                    {complianceLevel}
                  </Badge>
                )}
              </div>

              <p className={`text-sm font-medium mb-3 ${config.color}`}>
                {config.message}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Records:</span>
                  <span className="ml-2 font-semibold text-gray-900">{recordCount}</span>
                </div>
                
                <div>
                  <span className="text-gray-600 font-medium">Findings:</span>
                  <span className={`ml-2 font-semibold ${findingCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {findingCount}
                  </span>
                </div>

                {timeRange && (
                  <div className="md:col-span-1">
                    <span className="text-gray-600 font-medium">Time Range:</span>
                    <div className="text-xs text-gray-700 mt-1 font-mono">{timeRange}</div>
                  </div>
                )}
              </div>

              {/* Tool info if available */}
              {report.tool && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                  Verified by: <span className="font-mono">{report.tool.name}</span>
                  {report.tool.version && ` v${report.tool.version}`}
                  {report.tool.hash_spec && ` (${report.tool.hash_spec})`}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
