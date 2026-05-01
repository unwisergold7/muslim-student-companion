"use client";
import { VerificationStatus } from "@/types";
import { cn } from "@/lib/utils";

const C: Record<VerificationStatus, { l: string; c: string }> = {
  verified: { l: "Verified", c: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
  community: { l: "Community", c: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
  unverified: { l: "Unverified", c: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" },
  outdated: { l: "Outdated", c: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800" },
};

/**
 * Displays the verification status exactly as stored.
 * The "outdated" label only ever appears when it was set manually
 * by a developer in the data layer — never auto-applied.
 */
export default function VerificationBadge({ status }: { status: VerificationStatus; lastVerified?: string }) {
  const c = C[status] || C.unverified;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border", c.c)}>{c.l}</span>;
}
