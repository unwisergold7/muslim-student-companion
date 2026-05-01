"use client";
import { cn } from "@/lib/utils";
export default function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all",active?"bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500":"bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700")}>{children}</button>; }
