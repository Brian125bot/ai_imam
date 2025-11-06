/**
 * @file geminiService.ts
 * This service module acts as a client to a secure backend proxy.
 * It is responsible for sending the user's prompt to the backend
 * and handling the response. The actual Gemini API interaction and key
 * management are handled server-side.
 */

import { Fatwa } from '../types';

/**
 * Generates a fatwa by sending a prompt to the secure backend API proxy.
 * 
 * @param prompt - The user's question for the fatwa.
 * @returns A Promise that resolves to a `Fatwa` object.
 * @throws An error if the API call fails or the response is not ok.
 */
export async function generateFatwa(prompt: string): Promise<Fatwa> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the server returned an error, it should be in the `error` property of the JSON response.
      const message = data.error || `The server responded with an error: ${response.status}`;
      throw new Error(message);
    }

    // The backend should have already validated the structure, but this is a safeguard.
    if (data.englishFatwa && data.arabicFatwa) {
        return data as Fatwa;
    } else {
        throw new Error("Received an invalid response structure from the server.");
    }
  } catch (error) {
    console.error("Error calling backend proxy:", error);
    
    // Handle network errors (e.g., failed to fetch) and re-throw a user-friendly message.
    if (error instanceof TypeError) {
        throw new Error("A network error occurred. Please check your internet connection and try again.");
    }
    
    // Re-throw the error message, which should be user-friendly as it's set by our server proxy.
    throw error;
  }
}