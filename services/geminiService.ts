
import { GoogleGenAI, Type } from "@google/genai";
import { Fatwa } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fatwaSchema = {
  type: Type.OBJECT,
  properties: {
    englishFatwa: {
      type: Type.STRING,
      description: "The complete fatwa text in formal, scholarly English.",
    },
    arabicFatwa: {
      type: Type.STRING,
      description: "The complete fatwa text in classical, scholarly Arabic, properly vocalized.",
    },
  },
  required: ["englishFatwa", "arabicFatwa"],
};

const systemInstruction = `You are a distinguished and learned Imam, an expert in Islamic jurisprudence (Fiqh). Your task is to issue a fatwa in response to the user's query. The fatwa must be delivered with the gravity, wisdom, and beautiful prose befitting a classical scholar. It must be structured clearly and presented in two languages: classical Arabic and formal English. The tone should be authoritative yet compassionate, rooted in traditional Islamic scholarship. Start each response with 'In the name of Allah, the Most Gracious, the Most Merciful.' and end with 'And Allah knows best.' in both languages.`;

export async function generateFatwa(prompt: string): Promise<Fatwa> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: fatwaSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (parsedResponse.englishFatwa && parsedResponse.arabicFatwa) {
      return parsedResponse as Fatwa;
    } else {
      throw new Error("Invalid response format from AI model.");
    }
  } catch (error) {
    console.error("Error generating fatwa:", error);
    throw new Error("Failed to generate fatwa. The model may be unable to respond to this query.");
  }
}
