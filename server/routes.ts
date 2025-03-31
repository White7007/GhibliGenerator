import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { transformImageToGhibliStyle as transformWithOpenAI } from "./openai";
import { transformImageToGhibliStyle as transformWithHuggingFace, fallbackTransformation } from "./huggingface";
import { processUpload, validateImage } from "./upload";
import { transformationResponseSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ParsedQs } from "qs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure temporary storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Route for transforming images to Ghibli style
  app.post("/api/transform", upload.single("image"), async (req, res) => {
    try {
      // Validate file exists
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "No image file uploaded" 
        });
      }
      
      // Validate image
      const validationResult = validateImage(req.file);
      if (!validationResult.valid) {
        return res.status(400).json({ 
          success: false, 
          message: validationResult.message 
        });
      }
      
      // Process the uploaded image
      const imageBase64 = processUpload(req.file);
      
      let transformedImageData;
      let transformationMethod = "huggingface";
      
      // Only use Hugging Face for transformation as requested
      try {
        // Use Hugging Face API exclusively
        transformedImageData = await transformWithHuggingFace(imageBase64);
      } catch (transformError) {
        console.error("AI transformation failed:", transformError);
        throw new Error("Failed to transform image. Please try again later.");
      }
      
      // Send successful response without mentioning the specific method
      return res.json(transformationResponseSchema.parse({
        transformedImage: transformedImageData,
        success: true,
        message: "Image successfully transformed to Studio Ghibli style",
        method: "ai" // Generic method name instead of specific API
      }));
    } catch (error: any) {
      console.error("Error transforming image:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to transform image"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
