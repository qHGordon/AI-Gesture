import { GoogleGenAI, Type } from "@google/genai";

// We assume process.env.API_KEY is available via build system or env
// Since we are in a browser-only demo environment without a backend proxy, 
// strictly speaking this exposes the key if not careful. 
// For this generated code, we use the standard pattern provided in the instructions.

export const generateShape = async (prompt: string): Promise<number[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set REACT_APP_GEMINI_API_KEY or similar.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    You are a 3D geometry generator. 
    User will provide a description of a shape or object.
    You must return a JSON object containing a flat array of 3D coordinates representing a point cloud of that shape.
    The array should be named 'points'.
    Format: [x1, y1, z1, x2, y2, z2, ...]
    
    Constraints:
    - Generate approximately 2000 to 3000 points.
    - Coordinates should be normalized roughly between -4.0 and 4.0.
    - Focus on the surface of the shape.
    - If the user asks for something abstract, be creative.
    - Be efficient.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                points: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                }
            }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);
    if (!data.points || !Array.isArray(data.points)) {
        throw new Error("Invalid format received from Gemini");
    }

    return data.points;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
