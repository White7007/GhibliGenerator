import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/**
 * Transforms an image to Studio Ghibli art style using DALL-E 3
 * @param imageBase64 Base64-encoded image data
 * @returns Base64-encoded transformed image
 */
export async function transformImageToGhibliStyle(imageBase64: string): Promise<string> {
  try {
    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY || !openai) {
      throw new Error('OpenAI API key not provided');
    }
    
    // First, analyze the image to understand its content
    const analysisResponse = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image in detail. Describe the main subjects, colors, setting, and overall composition. I want to transform it into Studio Ghibli art style."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    const imageAnalysis = analysisResponse.choices[0].message.content;

    // Now, generate a Ghibli-style transformation using DALL-E 3
    const prompt = `Create a Studio Ghibli style artwork based on this image. Use the iconic Ghibli aesthetic with soft, watercolor-like textures, vibrant colors, and dreamlike quality. Include these elements from the original image: ${imageAnalysis}. Make it look authentically like it came from a Hayao Miyazaki film.`;

    const generationResponse = await openai!.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });

    // Return the base64-encoded image
    return generationResponse.data[0].b64_json || "";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to transform image: ${error.message}`);
  }
}
