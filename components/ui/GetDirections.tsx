"use client";
import { useState } from "react";
import { Navigation, X, Check, MapPin, Copy as CopyIcon } from "lucide-react";
import { Coordinates } from "@/types";
import { appleMapUrl, googleMapUrl, copyToClipboard } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

interface Props { name: string; coordinates?: Coordinates; address?: string; }

/**
 * Unified "Get Directions" control. Replaces the separate Apple Maps,
 * Google Maps, and Copy Address buttons with a single tappable pill
 * that opens a small sheet offering the three choices.
 */
export default function GetDirections({ name, coordinates, address }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!coordinates && !address) return null;
  const addrText = address || `${coordinates?.lat}, ${coordinates?.lng}`;

  const handleCopy = async () => {
    haptics.selection();
    try {
      await copyToClipboard(addrText);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
    } catch { /* ignore */ }
  };

  const handleOpen = () => { haptics.light(); setOpen(true); };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors mt-2"
      >
        <Navigation className="w-3 h-3" /> Get Directions
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl animate-slide-up"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="px-5 pb-6 pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Get Directions</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{name}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-2">
                <a
                  href={appleMapUrl(name, coordinates, address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { haptics.selection(); setOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Apple Maps</p>
                    <p className="text-[11px] text-gray-500">Open in Apple Maps</p>
                  </div>
                </a>

                <a
                  href={googleMapUrl(name, coordinates, address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { haptics.selection(); setOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Google Maps</p>
                    <p className="text-[11px] text-gray-500">Open in Google Maps</p>
                  </div>
                </a>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <CopyIcon className="w-4 h-4 text-blue-700 dark:text-blue-300" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {copied ? "Address Copied" : "Copy Address"}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{addrText}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
