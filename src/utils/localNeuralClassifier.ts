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
 * Loads the model directly from local assets (/models/roberta-detector/)
 * with zero remote network requests.
 */
export async function getLocalOfflineNeuralClassifier(): Promise<TextClassifierPipeline | null> {
  if (modelLoadFailed) {
    return null;
  }

  if (!offlineClassifierPromise) {
    offlineClassifierPromise = (async () => {
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
 * Extracts AI probability score from RoBERTa classification output.
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
    if (lbl.includes("fake") || lbl.includes("ai") || lbl.includes("synthetic") || lbl === "label_0") {
      return Number(Math.max(0.01, Math.min(0.99, item.score)).toFixed(4));
    }
    if (lbl.includes("real") || lbl.includes("human") || lbl === "label_1") {
      return Number(Math.max(0.01, Math.min(0.99, 1 - item.score)).toFixed(4));
    }
  }
  return null;
}
