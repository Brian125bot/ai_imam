/**
 * @file api/generate.ts
 * This is a server-side API route that acts as a secure proxy to the Google Gemini API.
 * It receives a prompt from the client, constructs the full request with the secret API key
 * and system instructions, calls the Gemini API, and returns the response.
 * THIS FILE IS NOT EXPOSED TO THE CLIENT BUNDLE.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Fatwa } from '../types';

// A minimal representation of request/response objects for a generic serverless environment.
// The actual types would be provided by the deployment platform (e.g., Vercel, Netlify).
interface ApiRequest {
  method?: string;
  body: {
    prompt?: string;
  };
}

interface ApiResponse {
  status: (code: number) => { json: (body: any) => void; };
}

// The API key is securely retrieved from server-side environment variables.
const API_KEY = process.env.API_KEY;

/**
 * Defines the JSON schema for the expected AI response.
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
 * The system instruction that sets the persona and constraints for the AI model.
 */
const systemInstruction = `You are a distinguished and learned Imam, an expert in Islamic jurisprudence (Fiqh). Your task is to issue a fatwa in response to the user's query. The fatwa must be delivered with the gravity, wisdom, and beautiful prose befitting a classical scholar. It must be structured clearly and presented in two languages: classical Arabic and formal English. The tone should be authoritative yet compassionate, rooted in traditional Islamic scholarship. Start each response with 'In the name of Allah, the Most Gracious, the Most Merciful.' and end with 'And Allah knows best.' in both languages.`;

/**
 * The main handler for the serverless function.
 * It processes POST requests to generate a fatwa.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!API_KEY) {
    console.error("API_KEY environment variable not set on server.");
    return res.status(500).json({ error: "The server is not configured correctly." });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: "A valid question must be provided." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

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

    if (response.candidates && response.candidates.length > 0) {
      const finishReason = response.candidates[0].finishReason;
      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        switch (finishReason) {
          case 'SAFETY':
            throw new Error("The response was blocked due to safety concerns. Please modify your question.");
          case 'RECITATION':
             throw new Error("The response was blocked due to a data recitation policy. Please try a different question.");
          default:
            throw new Error(`The model stopped generating for an unexpected reason: ${finishReason}.`);
        }
      }
    }

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The AI returned an empty response. Please try rephrasing your question.");
    }
    
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
        console.error("Failed to parse JSON response from AI:", jsonText, parseError);
        throw new Error("The AI returned a response that could not be understood. Please try again.");
    }

    if (parsedResponse.englishFatwa && parsedResponse.arabicFatwa) {
      return res.status(200).json(parsedResponse as Fatwa);
    } else {
      throw new Error("Invalid response format from AI model.");
    }

  } catch (error) {
    console.error("Error in API route /api/generate:", error);
    
    let userFriendlyMessage = "An unknown error occurred. Please try again later.";
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key not valid')) {
            userFriendlyMessage = "Authentication failed on the server. Please contact support.";
        } else if (errorMessage.includes('rate limit exceeded')) {
            userFriendlyMessage = "The service is currently busy due to high demand. Please wait a moment and try again.";
        } else if (errorMessage.includes('500') || errorMessage.includes('internal error')) {
            userFriendlyMessage = "The AI service is experiencing internal issues. Please try again later.";
        } else {
            userFriendlyMessage = error.message;
        }
    }
    
    return res.status(500).json({ error: userFriendlyMessage });
  }
}