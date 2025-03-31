/**
 * Utility for transforming images to Studio Ghibli style using canvas and filters
 * This client-side implementation creates a Ghibli-like aesthetic without OpenAI
 * 
 * Enhanced version with face preservation and improved color mapping
 */

// Define specific Ghibli color palette - carefully selected from Ghibli films
const GHIBLI_PALETTE = {
  SKY_BLUE: [133, 212, 255],      // Typical Ghibli sky
  LIGHT_BLUE: [190, 230, 255],    // Lighter sky tones
  GRASS_GREEN: [120, 190, 100],   // Vibrant but soft grass
  FOREST_GREEN: [60, 130, 70],    // Darker forest tones
  SUNSET_ORANGE: [255, 150, 80],  // Warm sunset colors
  RICH_BROWN: [150, 100, 60],     // Earth tones
  CREAM: [255, 250, 230],         // Soft background
  PASTEL_PINK: [255, 220, 230],   // Character features
  SKIN_TONE: [255, 221, 205],     // Typical Ghibli character skin
  SOFT_PURPLE: [215, 195, 240],   // Magical elements
  DEEP_BLUE: [70, 130, 190],      // Water and deep shadows
  WARM_YELLOW: [255, 225, 110],   // Warm highlights
  DARK_OUTLINE: [60, 50, 45],     // Line work
};

/**
 * Helper function to check if a color is close to a target color
 */
function isCloseTo(color: number[], target: number[], threshold: number): boolean {
  const distance = Math.sqrt(
    Math.pow(color[0] - target[0], 2) +
    Math.pow(color[1] - target[1], 2) +
    Math.pow(color[2] - target[2], 2)
  );
  return distance < threshold;
}

/**
 * Applies a simple Gaussian blur to the canvas
 */
function applyGaussianBlur(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, radius: number): void {
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = "none";
}

/**
 * Helper function to create watercolor brush strokes on a canvas
 * for a more Ghibli-like aesthetic
 */
function addWatercolorEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Save context state
  ctx.save();
  
  // Set low opacity for subtle effect
  ctx.globalAlpha = 0.04;
  ctx.globalCompositeOperation = "overlay";
  
  // Create random brush strokes
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 80 + 20;
    
    // Randomize colors slightly based on Ghibli palette
    const paletteColors = Object.values(GHIBLI_PALETTE);
    const randomColor = paletteColors[Math.floor(Math.random() * paletteColors.length)];
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${randomColor[0]}, ${randomColor[1]}, ${randomColor[2]}, 0.05)`;
    ctx.fill();
  }
  
  // Restore context state
  ctx.restore();
}

/**
 * Improved hand-drawn effect that preserves facial details
 * @param ctx Canvas context
 * @param width Image width
 * @param height Image height
 * @param faceRegions Map of pixels that are part of faces
 */
function addHandDrawnEffectWithFacePreservation(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  faceRegions: boolean[]
): void {
  ctx.save();
  
  // Get the current image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Create a canvas for edge detection
  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = width;
  edgeCanvas.height = height;
  const edgeCtx = edgeCanvas.getContext('2d', { willReadFrequently: true });
  
  if (edgeCtx) {
    // Apply edge detection in a way that respects facial features
    const edgeData = new Uint8ClampedArray(data.length);
    
    // Detect edges but with special handling for face regions
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pixelIndex = y * width + x;
        const idx = pixelIndex * 4;
        
        // Check if this is part of a face
        const isFace = faceRegions[pixelIndex];
        
        // If it's a face, apply very subtle edge detection
        // Otherwise, apply stronger edge detection
        const threshold = isFace ? 50 : 30; // Higher threshold for faces = fewer lines
        
        // Calculate gradients (using all color channels for better detection)
        const gxR = 
          data[idx - 4 - width * 4] + 2 * data[idx - width * 4] + data[idx + 4 - width * 4] -
          data[idx - 4 + width * 4] - 2 * data[idx + width * 4] - data[idx + 4 + width * 4];
        
        const gyR = 
          data[idx - 4 - width * 4] + 2 * data[idx - 4] + data[idx - 4 + width * 4] -
          data[idx + 4 - width * 4] - 2 * data[idx + 4] - data[idx + 4 + width * 4];
        
        // Use green channel too for better edge detection
        const gxG = 
          data[idx - 4 - width * 4 + 1] + 2 * data[idx - width * 4 + 1] + data[idx + 4 - width * 4 + 1] -
          data[idx - 4 + width * 4 + 1] - 2 * data[idx + width * 4 + 1] - data[idx + 4 + width * 4 + 1];
        
        const gyG = 
          data[idx - 4 - width * 4 + 1] + 2 * data[idx - 4 + 1] + data[idx - 4 + width * 4 + 1] -
          data[idx + 4 - width * 4 + 1] - 2 * data[idx + 4 + 1] - data[idx + 4 + width * 4 + 1];
        
        // Use all channels for magnitude calculation
        const gx = (gxR + gxG) / 2;
        const gy = (gyR + gyG) / 2;
        
        // Calculate gradient magnitude
        const mag = Math.sqrt(gx * gx + gy * gy);
        
        // Decide if this is an edge based on the threshold and face status
        let edgeIntensity;
        
        if (isFace) {
          // For faces, only draw very strong edges and with less opacity
          edgeIntensity = mag > threshold ? 50 : 255;
        } else {
          // For non-faces, standard edge detection
          edgeIntensity = mag > threshold ? 0 : 255;
        }
        
        // Set edge pixel
        edgeData[idx] = edgeIntensity;
        edgeData[idx + 1] = edgeIntensity;
        edgeData[idx + 2] = edgeIntensity;
        edgeData[idx + 3] = isFace ? 100 : 255; // Lower alpha for facial edges
      }
    }
    
    // Apply a light Gaussian blur to the edge data to soften lines
    const edgeImageData = new ImageData(edgeData, width, height);
    edgeCtx.putImageData(edgeImageData, 0, 0);
    
    // Apply a very light blur to smooth the edges
    edgeCtx.filter = "blur(0.3px)";
    edgeCtx.drawImage(edgeCanvas, 0, 0);
    edgeCtx.filter = "none";
    
    // Draw the edge detected image with appropriate opacity
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.12; // Lower opacity for more subtle effect
    ctx.drawImage(edgeCanvas, 0, 0);
    
    // Add some linework with the right color
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = `rgba(${GHIBLI_PALETTE.DARK_OUTLINE[0]}, ${GHIBLI_PALETTE.DARK_OUTLINE[1]}, ${GHIBLI_PALETTE.DARK_OUTLINE[2]}, 0.1)`;
    ctx.fillRect(0, 0, width, height);
  }
  
  ctx.restore();
}

/**
 * Original hand-drawn effect function (kept for compatibility)
 */
function addHandDrawnEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  
  // Get the edge detection data
  const imageData = ctx.getImageData(0, 0, width, height);
  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = width;
  edgeCanvas.height = height;
  const edgeCtx = edgeCanvas.getContext('2d');
  
  if (edgeCtx) {
    // Apply a basic edge detection
    const edgeData = detectEdges(imageData.data, width, height);
    
    // Create a new ImageData object
    const newImageData = new ImageData(new Uint8ClampedArray(edgeData), width, height);
    edgeCtx.putImageData(newImageData, 0, 0);
    
    // Draw the edge detected image on top with low opacity
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.15;
    ctx.drawImage(edgeCanvas, 0, 0);
  }
  
  ctx.restore();
}

/**
 * Basic edge detection for hand-drawn line effect
 */
function detectEdges(pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(pixels.length);
  
  // Simple Sobel edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate simple gradient (just using green channel for efficiency)
      const gx = 
        pixels[idx - 4 - width * 4 + 1] + 2 * pixels[idx - width * 4 + 1] + pixels[idx + 4 - width * 4 + 1] -
        pixels[idx - 4 + width * 4 + 1] - 2 * pixels[idx + width * 4 + 1] - pixels[idx + 4 + width * 4 + 1];
      
      const gy = 
        pixels[idx - 4 - width * 4 + 1] + 2 * pixels[idx - 4 + 1] + pixels[idx - 4 + width * 4 + 1] -
        pixels[idx + 4 - width * 4 + 1] - 2 * pixels[idx + 4 + 1] - pixels[idx + 4 + width * 4 + 1];
      
      // Calculate gradient magnitude
      const mag = Math.sqrt(gx * gx + gy * gy);
      
      // Apply threshold for edge detection
      const threshold = 30;
      const edgeIntensity = mag > threshold ? 0 : 255;
      
      // Set edge pixel
      output[idx] = edgeIntensity;
      output[idx + 1] = edgeIntensity;
      output[idx + 2] = edgeIntensity;
      output[idx + 3] = pixels[idx + 3];
    }
  }
  
  return output;
}

/**
 * Attempts simple skin tone detection to identify possible face regions
 * This helps us preserve facial details while applying Ghibli styling
 * @param data Image data array
 * @param width Image width
 * @param height Image height
 * @returns Map of likely face regions
 */
function detectPossibleFaceRegions(data: Uint8ClampedArray, width: number, height: number): boolean[] {
  const faceRegions = new Array(data.length / 4).fill(false);
  
  // Simple skin tone detection
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Common skin tone detection heuristics
      // Check if pixel is in the skin tone range (simplified)
      if (
        r > 95 && g > 40 && b > 20 &&        // Lower bounds
        r > g && r > b &&                     // Red component is highest
        Math.abs(r - g) > 15 &&               // Difference between red and green
        r - g > 15 && r - b > 15 &&           // Red dominant
        (Math.max(r, g, b) - Math.min(r, g, b)) > 15 && // Good saturation
        isCloseTo([r, g, b], GHIBLI_PALETTE.SKIN_TONE, 60) // Close to Ghibli skin tone
      ) {
        faceRegions[y * width + x] = true;
        
        // Expand the region slightly to ensure we catch all facial features
        for (let ny = Math.max(0, y - 5); ny < Math.min(height, y + 5); ny++) {
          for (let nx = Math.max(0, x - 5); nx < Math.min(width, x + 5); nx++) {
            faceRegions[ny * width + nx] = true;
          }
        }
      }
    }
  }
  
  return faceRegions;
}

/**
 * Transforms an image to a Ghibli-like style using canvas operations
 * @param imageUrl URL of the image to transform
 * @returns Promise resolving to the transformed image data URL
 */
export async function transformToGhibliStyle(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        // Create canvas for processing
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        // Create a separate canvas for the original image
        const originalCanvas = document.createElement("canvas");
        const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });
        
        if (!originalCtx) {
          reject(new Error("Failed to get original canvas context"));
          return;
        }
        
        // Set canvas dimensions
        const MAX_SIZE = 1200; // Limit max dimensions for performance
        let width = img.width;
        let height = img.height;
        
        // Scale down large images
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        originalCanvas.width = width;
        originalCanvas.height = height;
        
        // Draw original image to both canvases
        ctx.drawImage(img, 0, 0, width, height);
        originalCtx.drawImage(img, 0, 0, width, height);
        
        // Get original image data for face detection and detail preservation
        const originalImageData = originalCtx.getImageData(0, 0, width, height);
        const originalData = originalImageData.data;
        
        // Detect possible face regions for detail preservation
        const faceRegions = detectPossibleFaceRegions(originalData, width, height);
        
        // First, apply a very light blur for non-face regions
        // Store the original pixels
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
          
          // Apply blur to main canvas
          ctx.filter = `blur(0.7px)`;
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = "none";
        }
        
        // Get image data for pixel manipulation
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Apply Ghibli-like color adjustments
        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4;
          const isFacePixel = faceRegions[pixelIndex];
          
          // Enhance saturation for vibrant Ghibli colors
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate luminance
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Boost saturation and adjust colors for Ghibli-like palette
          let nr = r;
          let ng = g;
          let nb = b;
          
          // If this is a face pixel, use more subtle adjustments
          const saturationFactor = isFacePixel ? 1.1 : 1.3;
          
          nr = Math.min(255, luminance + saturationFactor * (r - luminance));
          ng = Math.min(255, luminance + saturationFactor * (g - luminance));
          nb = Math.min(255, luminance + saturationFactor * (b - luminance));
          
          // Sky color adjustments - common in Ghibli films
          if (isCloseTo([r, g, b], GHIBLI_PALETTE.SKY_BLUE, 70) || isCloseTo([r, g, b], GHIBLI_PALETTE.LIGHT_BLUE, 70)) {
            // Sky blue to the distinctive Ghibli blue
            nb = Math.min(255, b * 1.1);
            ng = Math.min(255, g * 1.05);
            
            // Shift colors closer to the Ghibli palette
            const blueShift = 0.15;
            nr = Math.min(255, nr * (1 - blueShift) + GHIBLI_PALETTE.SKY_BLUE[0] * blueShift);
            ng = Math.min(255, ng * (1 - blueShift) + GHIBLI_PALETTE.SKY_BLUE[1] * blueShift);
            nb = Math.min(255, nb * (1 - blueShift) + GHIBLI_PALETTE.SKY_BLUE[2] * blueShift);
          }
          
          // Enhance greens (grass, trees)
          if (isCloseTo([r, g, b], GHIBLI_PALETTE.GRASS_GREEN, 70) || 
              isCloseTo([r, g, b], GHIBLI_PALETTE.FOREST_GREEN, 70)) {
            
            // Shift toward Ghibli greens
            const greenShift = 0.2;
            const greenTarget = g > 160 ? GHIBLI_PALETTE.GRASS_GREEN : GHIBLI_PALETTE.FOREST_GREEN;
            
            nr = Math.min(255, nr * (1 - greenShift) + greenTarget[0] * greenShift);
            ng = Math.min(255, ng * (1 - greenShift) + greenTarget[1] * greenShift);
            nb = Math.min(255, nb * (1 - greenShift) + greenTarget[2] * greenShift);
          }
          
          // Warm up sunset/orange tones
          if (isCloseTo([r, g, b], GHIBLI_PALETTE.SUNSET_ORANGE, 80)) {
            const orangeShift = 0.15;
            nr = Math.min(255, nr * (1 - orangeShift) + GHIBLI_PALETTE.SUNSET_ORANGE[0] * orangeShift);
            ng = Math.min(255, ng * (1 - orangeShift) + GHIBLI_PALETTE.SUNSET_ORANGE[1] * orangeShift);
            nb = Math.min(255, nb * (1 - orangeShift) + GHIBLI_PALETTE.SUNSET_ORANGE[2] * orangeShift);
          }
          
          // Skin tones - preserve details but shift slightly to Ghibli style
          if (isFacePixel) {
            const skinShift = 0.08; // Very subtle for faces
            nr = Math.min(255, nr * (1 - skinShift) + GHIBLI_PALETTE.SKIN_TONE[0] * skinShift);
            ng = Math.min(255, ng * (1 - skinShift) + GHIBLI_PALETTE.SKIN_TONE[1] * skinShift);
            nb = Math.min(255, nb * (1 - skinShift) + GHIBLI_PALETTE.SKIN_TONE[2] * skinShift);
            
            // Extra detail preservation for face pixels
            // Blend back some of the original details
            const detailBlend = 0.4;
            nr = nr * (1 - detailBlend) + originalData[i] * detailBlend;
            ng = ng * (1 - detailBlend) + originalData[i + 1] * detailBlend;
            nb = nb * (1 - detailBlend) + originalData[i + 2] * detailBlend;
          }
          
          // Earth tones (browns)
          if (isCloseTo([r, g, b], GHIBLI_PALETTE.RICH_BROWN, 60)) {
            const brownShift = 0.15;
            nr = Math.min(255, nr * (1 - brownShift) + GHIBLI_PALETTE.RICH_BROWN[0] * brownShift);
            ng = Math.min(255, ng * (1 - brownShift) + GHIBLI_PALETTE.RICH_BROWN[1] * brownShift);
            nb = Math.min(255, nb * (1 - brownShift) + GHIBLI_PALETTE.RICH_BROWN[2] * brownShift);
          }
          
          // Warm highlights typical in Ghibli
          if (luminance > 200 && !isFacePixel) {
            const highlightShift = 0.1;
            nr = Math.min(255, nr * (1 - highlightShift) + GHIBLI_PALETTE.WARM_YELLOW[0] * highlightShift);
            ng = Math.min(255, ng * (1 - highlightShift) + GHIBLI_PALETTE.WARM_YELLOW[1] * highlightShift);
          }
          
          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
        }
        
        // Put processed image data back to canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Add Ghibli-style warm overlay - more subtle now
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = "rgba(255, 253, 240, 0.15)"; // Warm overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle watercolor texture
        // Less intense now to preserve details
        ctx.globalCompositeOperation = "overlay";
        addWatercolorEffect(ctx, width, height);
        
        ctx.globalCompositeOperation = "source-over";
        
        // Apply soft vignette (common in Ghibli films) - more subtle
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.4, // Increased to make vignette more subtle
          canvas.width / 2,
          canvas.height / 2,
          canvas.width
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.12)");
        
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Reset composite operation
        ctx.globalCompositeOperation = "source-over";
        
        // Add refined hand-drawn line effect
        // Only apply to non-face regions to preserve facial details
        addHandDrawnEffectWithFacePreservation(ctx, width, height, faceRegions);
        
        // Convert canvas to data URL and resolve
        const transformedImageUrl = canvas.toDataURL("image/jpeg", 0.95); // Higher quality
        resolve(transformedImageUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    img.src = imageUrl;
  });
}