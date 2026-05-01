"use client";
import { AvailabilityType } from "@/types";
import { cn } from "@/lib/utils";
import { RotateCcw, Check, AlertTriangle } from "lucide-react";
const C: Record<AvailabilityType, { l: string; c: string; I: typeof Check }> = { available_today:{l:"Today",c:"text-emerald-600 dark:text-emerald-400",I:Check}, usually_available:{l:"Usually available",c:"text-blue-600 dark:text-blue-400",I:Check}, always_available:{l:"Always available",c:"text-emerald-600 dark:text-emerald-400",I:Check}, menu_rotates:{l:"Rotates — check menu",c:"text-amber-600 dark:text-amber-400",I:RotateCcw}, reported_only:{l:"Reported only",c:"text-orange-600 dark:text-orange-400",I:AlertTriangle} };
export default function AvailabilityBadge({ type }: { type: AvailabilityType }) { const c = C[type]||C.reported_only; const I = c.I; return <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold",c.c)}><I className="w-3 h-3"/>{c.l}</span>; }
