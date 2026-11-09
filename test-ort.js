const { env } = require("@huggingface/transformers");
console.log("backends.onnx:", env.backends.onnx);
