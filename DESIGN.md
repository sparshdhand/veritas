---
name: Veritas Forensic
description: Defensible multi-modal AI detection and authorship provenance workbench
colors:
  primary: "#0F172A"
  accent-sky: "#0284C7"
  accent-violet: "#6D28D9"
  tier-proven: "#E11D48"
  tier-probable: "#EA580C"
  tier-inconclusive: "#D97706"
  tier-human: "#059669"
  neutral-canvas: "#F5F7FB"
  neutral-surface: "#FFFFFF"
  neutral-border: "#E2E8F0"
  neutral-muted: "#64748B"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.925rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  card-forensic:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: Veritas Forensic

## Overview

**Creative North Star: "The Optical Forensic Laboratory"**

Veritas Forensic blends clinical laboratory precision with specular liquid-glass optics. Designed for high-stakes academic integrity reviews, the interface pairs high-contrast slate typography and tabular monospace telemetry with translucent, multi-layered refractive panels (`backdrop-filter: blur(24px) saturate(180%)`).

The visual hierarchy keeps the manuscript text and native PDF preview as the primary evidentiary artifact on the left, flanked by a stationary, scannable forensic telemetry column on the right. Every statistical claim is anchored by exact numerical readouts, empirical p-values, and color-coded evidentiary tiers.

**Key Characteristics:**
- Specular liquid-glass surfaces over a cool daylight laboratory canvas (`#F5F7FB`).
- Dual-font discipline: `Plus Jakarta Sans` for UI and manuscript prose paired with `JetBrains Mono` (`tabular-nums`) for forensic telemetry.
- Strict four-tier semantic alert colors (Rose for Tier 3 Proven Synthetic, Orange for Tier 2 Probable AI, Amber for Tier 1 Inconclusive, Emerald for Tier 0 Human/Protected).
- Viewport-locked split-pane workbench where navigation and telemetry remain stationary while the manuscript scrolls independently.

## Colors

The palette pairs clinical cool-slate neutrals with high-visibility semantic tier accents and a refractive sky-blue optical brand mark.

### Primary
- **Forensic Obsidian** (`#0F172A`): Primary ink, active pill surfaces, and primary action controls.
- **Optical Sky** (`#0284C7`): Brand orb accent, active neural links, and interactive KaTeX equation badges.

### Secondary
- **Ingestion Violet** (`#6D28D9`): File ingestion call-to-action border and dropzone highlight.

### Tertiary
- **Tier 3 Crimson** (`#E11D48`): Deterministic synthetic proof alert and high-probability span highlights.
- **Tier 2 Amber-Orange** (`#EA580C`): Highly probable AI classification and elevated perplexity warnings.
- **Tier 1 Ochre** (`#D97706`): Inconclusive statistical signal requiring human review.
- **Tier 0 Emerald** (`#059669`): Verified human baseline, ESL protection badge, and LaTeX math guard indicators.

### Neutral
- **Laboratory Daylight** (`#F5F7FB`): Root viewport canvas background.
- **Refractive White** (`#FFFFFF`): Translucent liquid-glass card and panel base surface.
- **Specular Border** (`#E2E8F0`): Crisp structural hairlines and table dividers.
- **Telemetry Slate** (`#64748B`): Secondary labels, axis titles, and metadata captions.

### Named Rules
**The Semantic Tier Exclusivity Rule.** Rose (`#E11D48`), Orange (`#EA580C`), Amber (`#D97706`), and Emerald (`#059669`) are reserved strictly for evidentiary forensic tiers and protection badges—never use them as decorative backgrounds.

## Typography

**Display Font:** Plus Jakarta Sans (with `-apple-system, BlinkMacSystemFont, sans-serif` fallback)
**Body Font:** Plus Jakarta Sans (with `-apple-system, BlinkMacSystemFont, sans-serif` fallback)
**Label/Mono Font:** JetBrains Mono (with `ui-monospace, SFMono-Regular, monospace` fallback)

**Character:** Crisp geometric humanist sans-serif for effortless reading of long-form academic manuscripts, contrasted with technical tabular monospace for log-odds, p-values, and token likelihood metrics.

### Hierarchy
- **Display** (`700`, `1.5rem`, `1.2` line-height): Aggregate AI probability readouts and modal titles.
- **Headline** (`700`, `1.125rem`, `1.3` line-height): Panel headers and forensic dossier section titles.
- **Title** (`600`, `0.875rem`, `1.4` line-height): Card headers, corpus selector titles, and active tab labels.
- **Body** (`400`, `0.925rem`, `1.75` line-height): Manuscript span rendering with generous line spacing for inline highlight badges and KaTeX formulas.
- **Label** (`600`, `0.6875rem`, `0.08em` tracking, uppercase): Monospace telemetry tags, tier pills, and axis headers.

### Named Rules
**The Tabular Telemetry Rule.** Every numeric probability, log-odds weight, word count, and p-value must render in `JetBrains Mono` with `font-variant-numeric: tabular-nums` so columns never jitter during live sandbox adjustments.

## Layout

The application uses a viewport-locked (`h-screen overflow-hidden`) 12-column split workbench (`max-w-[1600px] mx-auto`):
- **Left 7 Columns (`lg:col-span-7`):** Fixed document header sub-bar, independently scrolling manuscript / PDF / LaTeX preview container (`flex-1 min-h-0 overflow-y-auto overscroll-contain`), and fixed bottom token inspector bar.
- **Right 5 Columns (`lg:col-span-5`):** Independent scrollable forensic telemetry stack containing the Aggregate Probability Gauge, 5-Stage Pipeline Diagnostics, Radar/GLTR Charts, Container & Image Forensics, and Sentence-Level Span Breakdown.

## Elevation & Depth

Depth is achieved through the **Liquid Glass Surface System**—translucent white-to-slate gradients (`rgba(255,255,255,0.88)` to `rgba(248,250,252,0.72)`), `backdrop-filter: blur(24px) saturate(180%)`, crisp `1.5px` white specular borders, and dual inset highlights.

### Shadow Vocabulary
- **Shell Elevation** (`0 28px 64px -16px rgba(15, 23, 42, 0.09)`): Outer workbench container depth.
- **Panel Elevation** (`0 16px 40px -12px rgba(15, 23, 42, 0.06)`): Primary workspace and telemetry panes.
- **Card Elevation** (`0 8px 20px -6px rgba(15, 23, 42, 0.05)`): Individual diagnostic cards and metric tiles.

### Named Rules
**The Specular Rim Rule.** Every elevated glass panel pairs a soft outer slate shadow with a `1.5px solid rgba(255, 255, 255, 0.95)` border and `inset 0 1.5px 2px 0 rgba(255, 255, 255, 1)` top highlight to preserve physical edge definition against light backgrounds.

## Shapes

- **Panels:** Generous `24px` (`rounded-3xl`) outer radii on main workspace panes.
- **Cards & Diagnostic Tiles:** `16px` (`rounded-2xl`) and `12px` (`rounded-xl`) internal containers.
- **Navigation & Status Pills:** Full capsule geometry (`9999px` / `rounded-full`) for top bar view switchers and corpus selectors.

## Components

### Buttons
- **Shape:** Full capsule (`9999px`) for navigation and action triggers; `12px` (`rounded-xl`) for utility controls.
- **Primary:** Forensic Obsidian (`#0F172A`) fill with white text (`6px 14px` padding) and subtle inner top sheen.
- **Ingestion Button:** Translucent white-violet gradient with a `2px solid rgba(109, 40, 217, 0.72)` border.

### Cards / Containers
- **Corner Style:** `24px` (`rounded-3xl`) for primary panels, `16px` (`rounded-2xl`) for nested telemetry cards.
- **Background:** `.liquid-glass-panel` and `.liquid-glass-card` refractive white gradients.
- **Internal Padding:** `16px` to `24px` (`p-4` to `p-6`).

### Navigation
- **Top Bar:** Compact single-row `.liquid-glass-bar` housing brand identity, sample corpus selector, Upload button, 4-tab view switcher (`Forensic Workspace`, `Weight Sandbox`, `Validation & ESL`, `System Spec`), and Hearing Dossier trigger.

## Do's and Don'ts

### Do:
- **Do** keep the outer shell locked to `h-screen overflow-hidden` so scrolling inside the manuscript never scrolls the top navigation bar or telemetry sidebar out of view.
- **Do** render mathematical expressions through KaTeX (`MathText`) and display the `LaTeX Math Guard` badge whenever symbolic density is detected.
- **Do** use `JetBrains Mono` with `tabular-nums` for all forensic metrics, p-values, and log-odds weights.

### Don't:
- **Don't** use dark-mode neon cyberpunk backgrounds; maintain the clinical daylight laboratory aesthetic (`#F5F7FB`).
- **Don't** display a Tier 3 (`Proven Synthetic`) badge when deterministic container proof is absent.
- **Don't** allow raw LaTeX control sequences or PDF font ligature garbage to render unformatted in the manuscript reader.
