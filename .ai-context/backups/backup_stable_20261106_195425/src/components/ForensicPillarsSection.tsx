import React from "react";
import {
  FileCode,
  Cpu,
  BarChart3,
  Waves,
  Shield,
  FileCheck2,
  Workflow,
} from "lucide-react";

export const ForensicPillarsSection: React.FC = () => {
  const pillars = [
    {
      icon: <FileCode className="w-5 h-5 text-sky-600" />,
      tag: "Container Layer",
      title: "DOCX & PDF Container Provenance",
      description:
        "Disassembles OpenXML packages using JSZip to extract total editing minutes, revision save IDs (rsidR), and font subset tags, identifying external paste anomalies.",
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
      tag: "Neural Engine",
      title: "Local Transformer Inference",
      description:
        "Direct ONNX quantized sequence classification with Xenova/roberta-base-openai-detector running purely on host CPU, ensuring air-gapped student privacy.",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
      tag: "Statistical Rigor",
      title: "Conformal Baseline Bounds",
      description:
        "Every submission non-conformity score is calibrated against an empirical 200-sample peer-reviewed human academic baseline to yield valid p-values.",
    },
    {
      icon: <Waves className="w-5 h-5 text-amber-600" />,
      tag: "Spectral Vision",
      title: "2D Fast Fourier Spectral Decay",
      description:
        "Performs 2D Cooley-Tukey FFT and azimuthal radial power spectrum decay fitting on embedded images to flag synthetic diffusion grid harmonics.",
    },
    {
      icon: <Shield className="w-5 h-5 text-rose-600" />,
      tag: "Demographic Equity",
      title: "ESL & Symbolic Veto Shields",
      description:
        "Explicit algorithmic vetoes prevent non-native English (L2) syntax patterns and technical LaTeX / KaTeX formulas from triggering false synthetic flags.",
    },
    {
      icon: <FileCheck2 className="w-5 h-5 text-teal-600" />,
      tag: "Administrative Law",
      title: "4-Phase Hearing Dossier",
      description:
        "Outputs structured institutional hearings documentation ready for academic review boards, clarifying corroborated vs inconclusive cases.",
    },
  ];

  return (
    <section
      id="pillars"
      className="w-full py-16 sm:py-20 px-6 sm:px-12 lg:px-20 bg-slate-50 border-b border-slate-200"
    >
      <div className="widescreen-frame space-y-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-600">
            <Workflow className="w-3.5 h-3.5 text-sky-600" />
            <span>Multi-Modal Evidentiary Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Six verifiable forensic layers.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Unlike commercial AI checkers that output a single opaque probability percentage,
            Veritas breaks analysis down into empirical container and linguistic signals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  {pillar.icon}
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {pillar.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
