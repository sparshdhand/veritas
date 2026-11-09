import { pipeline, env } from "@huggingface/transformers";

// Configure local offline execution
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.useBrowserCache = true;

// Configure local WASM binaries path
if (typeof window !== "undefined" && env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.wasmPaths = "/wasm/";
}

type TextClassificationOutput = Array<{ label: string; score: number }>;
type TextClassifierPipeline = (
  text: string,
  options?: { top_k?: number; truncation?: boolean }
) => Promise<TextClassificationOutput | TextClassificationOutput[]>;

let offlineClassifierPromise: Promise<TextClassifierPipeline | null> | null = null;
let modelLoadFailed = false;

/**
 * Initializes the bundled local offline ONNX classifier pipeline.
 * Loads the model directly from local assets (/models/modernbert-detector/)
 * with zero remote network requests, falling back to /models/roberta-detector if needed.
 */
export async function getLocalOfflineNeuralClassifier(): Promise<TextClassifierPipeline | null> {
  if (modelLoadFailed) {
    return null;
  }

  if (!offlineClassifierPromise) {
    offlineClassifierPromise = (async () => {
      // 1. Prefer modern ModernBERT detector (8192 token window, trained on modern LLM RAID/MAGE data)
      try {
        const modernPath = "/models/modernbert-detector";
        const classifier = await Promise.race([
          pipeline("text-classification", modernPath, {
            dtype: "q8",
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("ModernBERT load timeout")), 15000)
          ),
        ]);
        return classifier as unknown as TextClassifierPipeline;
      } catch (errModern) {
        console.warn("[LocalNeuralClassifier] ModernBERT load failed, attempting fallback to RoBERTa:", errModern);
      }

      // 2. Fallback to RoBERTa detector
      try {
        const modelPath = "/models/roberta-detector";
        const classifier = await Promise.race([
          pipeline("text-classification", modelPath, {
            dtype: "q8",
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Local model load timeout")), 20000)
          ),
        ]);
        return classifier as unknown as TextClassifierPipeline;
      } catch (err) {
        console.warn("[LocalNeuralClassifier] Offline transformer model load fallback:", err);
        modelLoadFailed = true;
        return null;
      }
    })();
  }

  return offlineClassifierPromise;
}

/**
 * Extracts AI probability score from classification output.
 * Handles both ModernBERT (LABEL_1 = AI/Generated, LABEL_0 = Human/Real)
 * and RoBERTa (Fake / Real labels).
 */
export function extractAiProbability(
  output: TextClassificationOutput | TextClassificationOutput[]
): number | null {
  const flat: TextClassificationOutput = Array.isArray(output[0])
    ? (output as TextClassificationOutput[])[0]
    : (output as TextClassificationOutput);

  if (!Array.isArray(flat) || flat.length === 0) return null;

  for (const item of flat) {
    const lbl = item.label.toLowerCase();
    // ModernBERT convention: LABEL_1 is AI/Generated, LABEL_0 is Human
    // RoBERTa convention: "Fake" is AI, "Real" is Human
    if (lbl === "label_1" || lbl.includes("fake") || lbl.includes("ai") || lbl.includes("synthetic")) {
      return Number(Math.max(0.01, Math.min(0.99, item.score)).toFixed(4));
    }
    if (lbl === "label_0" || lbl.includes("real") || lbl.includes("human")) {
      return Number(Math.max(0.01, Math.min(0.99, 1 - item.score)).toFixed(4));
    }
  }
  return null;
}
