/**
 * @file geminiService.ts
 * This service module is responsible for all interactions with the Google Gemini API.
 * It constructs the request with the necessary system instructions and response schema,
 * sends it to the AI model, and handles the response, including detailed error handling.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Fatwa } from '../types';

/**
 * Defines the JSON schema for the expected AI response.
 * This ensures the model returns data in a predictable and structured format.
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
 * This is crucial for guiding the AI to produce the desired tone, style, and structure.
 */
const systemInstruction = `You are a distinguished and learned Imam, an expert in Islamic jurisprudence (Fiqh). Your task is to issue a fatwa in response to the user's query. The fatwa must be delivered with the gravity, wisdom, and beautiful prose befitting a classical scholar. It must be structured clearly and presented in two languages: classical Arabic and formal English. The tone should be authoritative yet compassionate, rooted in traditional Islamic scholarship. Start each response with 'In the name of Allah, the Most Gracious, the Most Merciful.' and end with 'And Allah knows best.' in both languages.`;

/**
 * Generates a fatwa by calling the Google Gemini API.
 * 
 * @param prompt - The user's question for the fatwa.
 * @returns A Promise that resolves to a `Fatwa` object.
 * @throws An error with a user-friendly message if the API call fails for any reason.
 */
export async function generateFatwa(prompt: string): Promise<Fatwa> {
  // The API key is retrieved from environment variables.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing. Please ensure it is configured correctly.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });

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

    // Handle cases where the model stops generating for specific reasons (e.g., safety).
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
    
    // Parse the JSON string from the AI response.
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
        console.error("Failed to parse JSON response from AI:", jsonText, parseError);
        throw new Error("The AI returned a response that could not be understood. Please try again.");
    }
    
    // Validate the parsed response structure.
    if (parsedResponse.englishFatwa && parsedResponse.arabicFatwa) {
      return parsedResponse as Fatwa;
    } else {
      throw new Error("Invalid response format from the AI model. Please check the schema and prompt.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // Provide more specific, user-friendly error messages.
    let userFriendlyMessage = "An unknown error occurred. Please try again later.";
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key not valid')) {
            userFriendlyMessage = "The provided API key is invalid. Please check your configuration.";
        } else if (errorMessage.includes('rate limit exceeded')) {
            userFriendlyMessage = "The service is currently busy due to high demand. Please wait a moment and try again.";
        } else if (errorMessage.includes('500') || errorMessage.includes('internal error')) {
            userFriendlyMessage = "The AI service is experiencing internal issues. Please try again later.";
        } else if (error instanceof TypeError) {
             userFriendlyMessage = "A network error occurred. Please check your internet connection and try again.";
        }
        else {
            // Use the error message from the try block if it's one of our custom ones.
            userFriendlyMessage = error.message;
        }
    }
    
    throw new Error(userFriendlyMessage);
  }
}
