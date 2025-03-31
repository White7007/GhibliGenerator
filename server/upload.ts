import { type File } from "multer";

/**
 * Validates an uploaded image file
 * @param file The uploaded file
 * @returns Validation result with validity and message
 */
export function validateImage(file: File): { valid: boolean; message?: string } {
  // Check file type
  const allowedMimeTypes = ["image/jpeg", "image/png"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      message: "Invalid file type. Only JPG and PNG images are supported.",
    };
  }

  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      message: "File size exceeds the 2MB limit.",
    };
  }

  return { valid: true };
}

/**
 * Processes an uploaded file and converts it to base64
 * @param file The uploaded file
 * @returns Base64-encoded image data
 */
export function processUpload(file: File): string {
  // Convert file buffer to base64
  return Buffer.from(file.buffer).toString("base64");
}
