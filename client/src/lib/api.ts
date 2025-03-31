import { apiRequest } from "./queryClient";
import { transformationResponseSchema, type TransformationResponse } from "@shared/schema";

/**
 * Transforms an image to Studio Ghibli style using Hugging Face API
 * @param file The image file to transform
 * @returns The transformation response with the transformed image
 */
export async function transformImage(file: File): Promise<TransformationResponse> {
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append("image", file);
    
    // Send the request to the server
    const response = await fetch("/api/transform", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Server error");
    }
    
    // Parse and return the server response
    const data = await response.json();
    return transformationResponseSchema.parse(data);
  } catch (error: any) {
    console.error("Error transforming image:", error);
    throw new Error(error.message || "Failed to transform image");
  }
}
