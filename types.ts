/**
 * @file This file contains the TypeScript type definitions for the application.
 * Centralizing types helps ensure data consistency and improves code readability.
 */

/**
 * Represents the structured response for a single fatwa from the AI model.
 * It contains the ruling in both English and Arabic.
 */
export interface Fatwa {
  /** The complete text of the fatwa in formal, scholarly English. */
  englishFatwa: string;

  /** The complete text of the fatwa in classical, scholarly Arabic, with proper vocalization. */
  arabicFatwa: string;
}
