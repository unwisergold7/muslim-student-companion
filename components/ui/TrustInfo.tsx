"use client";
import { AlertTriangle, ExternalLink, Clock } from "lucide-react";
import { Verifiable, HasHours } from "@/types";
import { formatDate, areHoursStale } from "@/lib/utils";

/**
 * Shows provenance info. The verification badge itself is rendered
 * elsewhere; this panel surfaces the last-verified date, source, and
 * notes. The "outdated" label only appears if a developer has
 * manually set the status in the data layer — nothing in the client
 * auto-applies it.
 */
export default function TrustInfo({
  entry,
  showHours = false,
}: {
  entry: Verifiable & Partial<HasHours>;
  showHours?: boolean;
}) {
  const isUnverified = entry.verification_status === "unverified";
  const isOutdated = entry.verification_status === "outdated";

  return (
    <div className="space-y-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
      {isUnverified && (
        <div className="flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400 font-medium">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Not independently verified.
        </div>
      )}

      {isOutdated && (
        <div className="flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400 font-medium">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Marked outdated — information may have changed.
        </div>
      )}

      {showHours && entry.hours_text && (
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{entry.hours_text}</span>
          {areHoursStale(entry.hours_last_verified) && (
            <span className="text-orange-500 font-medium ml-1">· Check hours</span>
          )}
        </div>
      )}

      <div className="text-[10px] text-gray-400 dark:text-gray-500 space-y-0.5">
        <p>
          Verified: {formatDate(entry.last_verified)}
          {entry.verified_by && <> · by {entry.verified_by}</>}
        </p>
        <p className="italic">Source: {entry.source}</p>
        {entry.source_note && <p className="italic">{entry.source_note}</p>}
        {entry.evidence_note && <p>Evidence: {entry.evidence_note}</p>}
        {entry.contact_method && <p>To re-verify: {entry.contact_method}</p>}
        {entry.source_url && (
          <a
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline not-italic"
          >
            Source link <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}
