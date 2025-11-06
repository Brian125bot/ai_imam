/**
 * @file geminiService.ts
 * This service module encapsulates all interactions with the Google Gemini API.
 * It is responsible for initializing the AI client, defining the request structure
 * (including the model, system instructions, and response schema), and handling
 * the API call to generate a fatwa.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Fatwa } from '../types';

// The API key is securely retrieved from environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // Fail-fast approach: If the API key is missing, the application cannot function.
  throw new Error("API_KEY environment variable not set");
}

// Initialize the GoogleGenAI client with the API key.
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Defines the JSON schema for the expected AI response.
 * This instructs the Gemini model to return a structured JSON object
 * that conforms to our `Fatwa` type, ensuring predictable and safe data handling.
 */
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

/**
 * The system instruction is a crucial part of the prompt that sets the persona,
 * context, and constraints for the AI model. It directs the AI to act as a
 * learned Imam and to structure its response in a specific, bilingual format.
 */
const systemInstruction = `You are a distinguished and learned Imam, an expert in Islamic jurisprudence (Fiqh). Your task is to issue a fatwa in response to the user's query. The fatwa must be delivered with the gravity, wisdom, and beautiful prose befitting a classical scholar. It must be structured clearly and presented in two languages: classical Arabic and formal English. The tone should be authoritative yet compassionate, rooted in traditional Islamic scholarship. Start each response with 'In the name of Allah, the Most Gracious, the Most Merciful.' and end with 'And Allah knows best.' in both languages.`;

/**
 * Generates a fatwa by sending a prompt to the Gemini Pro model.
 * It enforces a specific JSON output using a schema and system instruction.
 * 
 * @param prompt - The user's question for the fatwa.
 * @returns A Promise that resolves to a `Fatwa` object.
 * @throws An error if the API call fails or the response format is invalid.
 */
export async function generateFatwa(prompt: string): Promise<Fatwa> {
  try {
    const response = await ai.models.generateContent({
      // Using gemini-2.5-pro for its advanced reasoning and language capabilities.
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        // Enforce a JSON response to easily parse the output.
        responseMimeType: "application/json",
        responseSchema: fatwaSchema,
        // A lower temperature (0.5) encourages more focused and deterministic responses,
        // suitable for a scholarly tone.
        temperature: 0.5,
      },
    });

    // Extract, trim, and parse the JSON response text.
    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    // Validate the parsed object to ensure it matches the expected structure.
    if (parsedResponse.englishFatwa && parsedResponse.arabicFatwa) {
      return parsedResponse as Fatwa;
    } else {
      // This error is thrown if the AI returns valid JSON but with missing fields.
      throw new Error("Invalid response format from AI model.");
    }
  } catch (error) {
    console.error("Error generating fatwa:", error);
    // Rethrow a user-friendly error to be displayed in the UI.
    throw new Error("Failed to generate fatwa. The model may be unable to respond to this query.");
  }
}
