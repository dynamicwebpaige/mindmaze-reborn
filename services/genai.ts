import { GoogleGenAI, Modality } from "@google/genai";
import { RoomType, NPC, Gender } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Cache images to avoid re-generating the same room type too often, saving time/tokens
const imageCache: Record<string, string> = {};

// Circuit breakers for rate limiting
let isImageQuotaExceeded = false;
let isTextQuotaExceeded = false;

export const generateRoomImage = async (type: RoomType, npc?: NPC): Promise<string> => {
  // Create a unique key for caching that includes the NPC role if present
  const cacheKey = npc ? `${type}_${npc.role}` : type;

  // Aggressive caching: If we have it, use it.
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  // If we already know we're out of quota, skip the API call immediately
  if (isImageQuotaExceeded) {
    console.warn("Image quota previously exceeded. Using fallback.");
    return getFallbackImage(type);
  }

  let prompt = `
    A first-person view of a ${type} inside a medieval castle.
    Style: 90s educational video game, slightly grainy but high definition, immersive, 3D render.
    Lighting: Torchlight, moody shadows.
    Details: Stone walls, period-accurate furniture, maybe a tapestry.
    No text, no interface elements.
    Perspective: Central corridor or open room.
  `;

  if (npc) {
    prompt += `
      In the middle distance, standing clearly in the room, is a ${npc.role}. 
      They are looking towards the viewer. 
      The character should look realistic, medieval, and integrated into the scene, not a cartoon.
      Historical costume appropriate for a ${npc.role}.
    `;
  }

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
      },
    });

    if (!response.generatedImages?.[0]?.image?.imageBytes) {
        throw new Error("No image data returned");
    }

    const base64 = response.generatedImages[0].image.imageBytes;
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    imageCache[cacheKey] = dataUrl;
    return dataUrl;
  } catch (error: any) {
    console.error("Failed to generate room image:", error);
    
    // Detect Quota Error (429)
    const errorStr = JSON.stringify(error);
    if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
        isImageQuotaExceeded = true;
        console.warn("Image generation quota exceeded. Switching to fallback mode.");
    }

    return getFallbackImage(type);
  }
};

function getFallbackImage(type: string): string {
    // Use a deterministic seed so the same room type always gets the same fallback image
    // This feels less "broken" than random images
    const seed = type.replace(/\s/g, '');
    return `https://picsum.photos/seed/${seed}/800/600?grayscale&blur=2`;
}

// Deprecated but kept to avoid breaking imports if referenced elsewhere
export const generateCharacterImage = async (role: string): Promise<string> => {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${role}`; 
};

export const generateLore = async (role: string): Promise<string> => {
  if (isTextQuotaExceeded) {
      return "The spirits are silent... (Quota Exceeded)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a ${role} in the mysterious castle of MindMaze. Give the player a short, cryptic hint or piece of lore about the castle's history or the maze's nature. Keep it under 2 sentences. Use archaic, medieval phrasing.`,
    });
    return response.text || "The shadows whisper secrets I cannot repeat.";
  } catch (e: any) {
    console.error("Lore gen failed", e);
    const errorStr = JSON.stringify(e);
    if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED")) {
        isTextQuotaExceeded = true;
    }
    return "I have nothing to say to you, traveler.";
  }
};

export const generateSpeech = async (text: string, gender?: Gender): Promise<string | undefined> => {
  if (isTextQuotaExceeded) return undefined;

  try {
    // Select voice based on gender
    // 'Fenrir' is male, 'Kore' is female
    const voiceName = gender === 'male' ? 'Fenrir' : 'Kore';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
        },
      },
    });
    // Return the raw base64 string
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e: any) {
    console.error("Speech gen failed", e);
    const errorStr = JSON.stringify(e);
    if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED")) {
        isTextQuotaExceeded = true;
    }
    return undefined;
  }
};
