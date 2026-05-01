"use client";
import { X } from "lucide-react";
import StatusExplainer from "@/components/StatusExplainer";
import { haptics } from "@/lib/haptics";

/**
 * Bottom-sheet food guide. Opened from the Food tab's Guide button.
 * Wraps the shared StatusExplainer so dietary and verification
 * definitions stay consistent with Settings.
 */
export default function FoodGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl animate-slide-up max-h-[88vh] overflow-y-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Food Guide</h2>
              <p className="text-xs text-gray-500 mt-0.5">How to read the labels on every item</p>
            </div>
            <button
              onClick={() => { haptics.selection(); onClose(); }}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <StatusExplainer />
        </div>
      </div>
    </div>
  );
}
