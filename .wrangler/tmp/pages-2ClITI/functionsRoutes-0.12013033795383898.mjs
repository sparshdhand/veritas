import { onRequestPost as __api_forensics_image_ocr_ts_onRequestPost } from "/Users/sparsh/.gemini/projects/AI Detection School project/functions/api/forensics/image-ocr.ts"

export const routes = [
    {
      routePath: "/api/forensics/image-ocr",
      mountPath: "/api/forensics",
      method: "POST",
      middlewares: [],
      modules: [__api_forensics_image_ocr_ts_onRequestPost],
    },
  ]