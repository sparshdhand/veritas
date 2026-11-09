# Offline Model Directory

This directory holds the quantized ONNX neural network weights for 100% offline local inference in Veritas Forensic.

Files:
- `model_quantized.onnx`: INT8 quantized ModernBERT/RoBERTa weights.
- `tokenizer.json`: Fast tokenizer configuration.
- `vocab.txt` / `config.json`: Model vocabulary and classification head config.

When packaged with Tauri, these files are embedded into the native installer and copied to the application runtime resource directory.
