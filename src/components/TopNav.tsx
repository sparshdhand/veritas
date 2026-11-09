import React from "react";
import {
  Sparkles,
  RotateCcw,
  Eye,
  Fingerprint,
  FileCheck2,
  Lock,
  Layers,
  Scale,
} from "lucide-react";

interface TopNavProps {
  hasActiveSubmission: boolean;
  isPreviewActive: boolean;
  detectedSpanCount: number;
  onTogglePreview: () => void;
  onTriggerUpload: () => void;
  onReset: () => void;
  onOpenDossier: () => void;
  onReplayIntro?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  hasActiveSubmission,
  isPreviewActive,
  detectedSpanCount,
  onTogglePreview,
  onTriggerUpload,
  onReset,
  onOpenDossier,
  onReplayIntro,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3 bg-transparent flex justify-center">
      <div className="w-full max-w-[96rem] px-6 py-3 rounded-2xl border border-[#DCD4C6] bg-[#FAF8F4]/95 backdrop-blur-xl shadow-lg shadow-[#1C1917]/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#0F3B5F] text-amber-300 flex items-center justify-center font-bold shadow-sm">
            <Fingerprint className="w-4.5 h-4.5 stroke-[2.4]" />
          </div>
          <div className="flex items-baseline">
            <span className="text-base font-bold tracking-tight text-[#1C1917]">
              Veritas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveSubmission && (
            <>
              <button
                type="button"
                onClick={onTogglePreview}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isPreviewActive
                    ? "bg-[#0F3B5F] text-white"
                    : "bg-[#F4F1EA] text-[#645D56] hover:text-[#1C1917]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isPreviewActive ? `${detectedSpanCount} Flags Active` : "Flags Hidden"}</span>
              </button>



              <button
                type="button"
                onClick={onReset}
                className="p-2 rounded-xl text-[#645D56] hover:text-[#1C1917] bg-[#F4F1EA] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              title="Replay Veritas Tour & Architecture Showcase"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#645D56] hover:text-[#1C1917] hover:bg-[#EBE5DA] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tour</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTriggerUpload}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1C1917] hover:bg-[#292524] shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Upload</span>
          </button>
        </div>
      </div>
    </header>
  );
};
