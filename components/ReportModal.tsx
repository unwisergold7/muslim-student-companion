"use client";
import { useState } from "react";
import { X, Flag, Check } from "lucide-react";
import { submitReport } from "@/lib/supabase-queries";
import { DEFAULT_UNIVERSITY_ID } from "@/data/universities";
import { haptics } from "@/lib/haptics";
import type { ReportKind } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  /** For food/space entry reports */
  entityId?: string;
  entityType?: "space" | "food";
  entityName?: string;
  /** For app-level reports via Settings */
  mode?: "entry" | "feedback" | "feature_request" | "general";
  title?: string;
}

/**
 * Unified report and feedback modal.
 *
 * Entry reports route as { target_type: 'space' | 'food', target_id: <id> }.
 * App-level feedback routes as { target_type: 'app', target_id: <mode> }.
 * No fake fallback values — the schema cleanly carries either.
 */
export default function ReportModal({
  open, onClose,
  entityId, entityType, entityName,
  mode = "entry", title,
}: Props) {
  const isEntry = mode === "entry";

  const [issueType, setIssueType] = useState<ReportKind>(
    isEntry ? "issue" :
    mode === "feature_request" ? "feature_request" :
    mode === "feedback" ? "feedback" : "general"
  );
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const heading = title
    || (isEntry ? "Report an Issue"
    : mode === "feature_request" ? "Suggest a Feature"
    : mode === "feedback" ? "Send Feedback"
    : "Tell Us Something");

  const submit = async () => {
    if (!msg.trim() && !isEntry) { setError("Please include a short message."); return; }
    setSending(true);
    setError(null);
    haptics.light();

    const targetType: "space" | "food" | "app" =
      isEntry ? (entityType as "space" | "food") : "app";
    const targetId: string = isEntry ? (entityId || "unknown") : `app:${mode}`;

    const ok = await submitReport({
      university_id: DEFAULT_UNIVERSITY_ID,
      target_type: targetType,
      target_id: targetId,
      issue_type: issueType,
      message: msg.trim(),
    });

    setSending(false);
    if (ok) {
      haptics.success();
      setSent(true);
      setTimeout(() => { setSent(false); setMsg(""); onClose(); }, 1500);
    } else {
      setError("We couldn't send that just now. Please try again.");
      haptics.error();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl animate-slide-up"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{heading}</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800" aria-label="Close">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {entityName && (
            <p className="text-xs text-gray-500 mb-3">
              About: <strong className="text-gray-700 dark:text-gray-300">{entityName}</strong>
            </p>
          )}

          {sent ? (
            <div className="text-center py-8">
              <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-600">Thanks — we've received your message.</p>
            </div>
          ) : (
            <>
              {isEntry && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {(
                    [
                      ["issue", "Something's wrong"],
                      ["changed", "This has changed"],
                      ["not_found", "Couldn't find it"],
                    ] as [ReportKind, string][]
                  ).map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => { haptics.selection(); setIssueType(k); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        issueType === k
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={
                  isEntry
                    ? "Optional details — what did you notice?"
                    : mode === "feature_request"
                    ? "What would help you? The more detail, the better."
                    : "Tell us what happened or what we can improve."
                }
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none resize-none mb-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />

              {error && (
                <p className="text-xs text-red-600 mb-2">{error}</p>
              )}

              <button
                onClick={submit}
                disabled={sending || (!isEntry && !msg.trim())}
                className="w-full py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
              >
                <Flag className="w-4 h-4" />
                {sending ? "Sending…" : "Submit"}
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                Stored securely. No personal info is collected.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
