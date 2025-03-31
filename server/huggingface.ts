import { HfInference } from '@huggingface/inference';

// Create a Hugging Face Inference instance with the API token (only if key is available)
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const hf = HUGGINGFACE_API_KEY ? new HfInference(HUGGINGFACE_API_KEY) : null;

// These models transform images to anime/illustration style, which is similar to Studio Ghibli
// Primary model
const ANIME_STYLE_MODEL = 'cagliostrolab/animagine-xl-3.0';
// Fallback models if the primary one doesn't work
const FALLBACK_MODELS = [
  'Ojimi/anime-pastel-dream',
  'prompthero/openjourney',
  'stablediffusionapi/realistic-vision-v51'
];

/**
 * Transforms an image to Studio Ghibli style using Hugging Face's image-to-image models
 * @param imageBase64 Base64-encoded image data (without prefix)
 * @returns Base64-encoded transformed image
 */
export async function transformImageToGhibliStyle(imageBase64: string): Promise<string> {
  try {
    // Check if the Hugging Face API key is available
    if (!HUGGINGFACE_API_KEY || !hf) {
      throw new Error('Hugging Face API key not provided');
    }
    
    console.log('Transforming image with Hugging Face...');

    // Convert base64 to binary data for the API
    const binaryData = Buffer.from(imageBase64, 'base64');
    
    // First try the primary model
    try {
      // Use the text-to-image pipeline since it's more widely supported
      const result = await hf.textToImage({
        model: ANIME_STYLE_MODEL,
        inputs: 'Convert this photograph into Studio Ghibli animation style. Use soft pastel colors, hand-drawn look, and the iconic Ghibli aesthetic. Make it dreamlike and magical.',
        parameters: {
          negative_prompt: 'low quality, blurry, distorted, deformed, ugly, low resolution',
          image: binaryData,
          guidance_scale: 7.5,
        }
      });
      
      // Convert blob to base64
      const buffer = await result.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      console.log('Image transformation with Hugging Face primary model successful');
      return base64;
    } catch (primaryError) {
      console.warn('Primary model failed, trying fallback models...', primaryError);
      
      // Try fallback models one by one
      for (const model of FALLBACK_MODELS) {
        try {
          console.log(`Trying fallback model: ${model}`);
          const result = await hf.imageToImage({
            model: model,
            inputs: binaryData,
            parameters: {
              prompt: 'Studio Ghibli style animation, Hayao Miyazaki style, beautiful detailed illustration, hand-drawn animation, pastel colors, soft lighting',
              negative_prompt: 'low quality, blurry, distorted, deformed',
            }
          });
          
          // Convert blob to base64
          const buffer = await result.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          
          console.log(`Image transformation with fallback model ${model} successful`);
          return base64;
        } catch (fallbackError) {
          console.warn(`Fallback model ${model} failed:`, fallbackError);
          // Continue to the next fallback model
        }
      }
      
      // If we get here, all fallback models failed
      throw new Error('All Hugging Face models failed to transform the image');
    }
  } catch (error) {
    console.error('Error transforming image with Hugging Face:', error);
    throw new Error('Failed to transform image with Hugging Face: ' + (error as Error).message);
  }
}

/**
 * Fallback method that uses client-side processing when API fails
 * This uses transformToGhibliStyle from client/src/lib/imageTransformer.ts
 * @param imageBase64 Base64-encoded image data
 * @returns Base64-encoded transformed image
 */
export async function fallbackTransformation(imageBase64: string): Promise<string> {
  // This is a stub that will be handled client-side
  console.log('API transformation failed, falling back to client-side processing');
  return imageBase64; // We'll replace this with client-side processing
}