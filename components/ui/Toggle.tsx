"use client";
import { cn } from "@/lib/utils";
export default function Toggle({ on, onChange, color = "green" }: { on: boolean; onChange: (v: boolean) => void; color?: "green"|"gold" }) { return <button onClick={() => onChange(!on)} className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",on?(color==="gold"?"bg-yellow-500":"bg-emerald-600"):"bg-gray-300 dark:bg-gray-600")}><span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform",on?"translate-x-6":"translate-x-1")}/></button>; }
