
import { GoogleGenAI } from '@google/genai';
import type { Chat, GenerateContentResponse, Part, Tool, Content, GroundingChunk } from '@google/genai';
import type { FormattedApiResponse, ChatMessageSource } from '../types';
import { GEMINI_CHAT_MODEL, IMAGEN_MODEL_NAME } from "../constants";

const API_KEY = process.env.API_KEY;

let googleAIClient: GoogleGenAI | null = null;

if (API_KEY) {
  try {
    googleAIClient = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
    googleAIClient = null;
  }
} else {
  console.error("API_KEY environment variable is not set. ApiService will not function for chat or image generation.");
}

interface ChatSession {
  chat: Chat;
}

class ApiService {
  private activeChats: Map<string, ChatSession> = new Map();
  private activeChatSystemInstructions: Map<string, string | undefined> = new Map();
  private activeChatSearchSupport: Map<string, boolean | undefined> = new Map();
  private onAuthFailureCallback: ((errorMessage: string) => void) | null = null;

  public setOnAuthFailure(callback: (errorMessage: string) => void): void {
    this.onAuthFailureCallback = callback;
  }

  private getChatSession(sessionId: string, systemInstructionText?: string, enableSearch?: boolean): ChatSession {
    if (!googleAIClient) {
      throw new Error("Google AI client not initialized. API_KEY might be missing or invalid.");
    }

    const existingSession = this.activeChats.get(sessionId);
    const instructionUsedForExisting = this.activeChatSystemInstructions.get(sessionId);
    const searchSupportForExisting = this.activeChatSearchSupport.get(sessionId);

    if (existingSession && 
        (instructionUsedForExisting !== systemInstructionText || searchSupportForExisting !== enableSearch)) {
      this.activeChats.delete(sessionId);
      this.activeChatSystemInstructions.delete(sessionId);
      this.activeChatSearchSupport.delete(sessionId);
      // Fall through to create a new session
    }
    
    if (!this.activeChats.has(sessionId)) {
      const chatCreateOpts: {
        model: string;
        config?: { systemInstruction?: Content; tools?: Tool[] };
        history?: Content[]; 
      } = { 
        model: GEMINI_CHAT_MODEL,
        config: {
          systemInstruction: systemInstructionText ? { role: 'system', parts: [{ text: systemInstructionText }] } : undefined,
          tools: enableSearch ? [{ googleSearch: {} }] : undefined,
        },
      };
      const newChat = googleAIClient.chats.create(chatCreateOpts);
      const newSession: ChatSession = {
        chat: newChat,
      };
      this.activeChats.set(sessionId, newSession);
      this.activeChatSystemInstructions.set(sessionId, systemInstructionText);
      this.activeChatSearchSupport.set(sessionId, enableSearch);
    }
    
    return this.activeChats.get(sessionId)!;
  }

  private handleApiError(error: any, context: 'chat' | 'image'): string {
    let errorMessage = `Sorry, I encountered an error during ${context}. Please try again.`;
    
    if (error && typeof error.message === 'string') { // More robust check for error.message
        const errMessageLower = error.message.toLowerCase();
        if (errMessageLower.includes('api key not valid') || errMessageLower.includes('permission denied') || errMessageLower.includes('authentication failed') || errMessageLower.includes('api_key_invalid')) {
             errorMessage = `Authentication Failed for ${context === 'chat' ? 'Chat (Gemini)' : 'Image Generation (Imagen)'}: Your API key is invalid or lacks permissions. Please check the API_KEY environment variable and your Google Cloud project settings.`;
            if (this.onAuthFailureCallback) {
                this.onAuthFailureCallback(errorMessage);
            }
        } else if (errMessageLower.includes('quota') || errMessageLower.includes('resource has been exhausted')) {
            errorMessage = `You've exceeded your API quota for ${context === 'chat' ? 'Gemini' : 'Imagen'}. Please check your Google Cloud billing and quota limits.`;
        } else if (errMessageLower.includes('fetchfailed') || errMessageLower.includes('network error')) {
            errorMessage = `A network error occurred while trying to connect to the ${context === 'chat' ? 'Gemini' : 'Imagen'} service. Please check your internet connection.`;
        } else if (errMessageLower.includes('model not found')) {
             errorMessage = `The specified model for ${context} was not found. Ensure '${context === 'chat' ? GEMINI_CHAT_MODEL : IMAGEN_MODEL_NAME}' is correct and available.`;
        } else if (errMessageLower.includes("inline data") && errMessageLower.includes("base64")){
             errorMessage = `There was an issue with the uploaded file data. It might not be correctly base64 encoded or the MIME type is mismatched.`;
        }
        else {
            errorMessage = `An error occurred with ${context === 'chat' ? 'Gemini' : 'Imagen'}: ${error.message}`;
        }
    } else if (error && typeof error.toString === 'function' && error.toString().includes('[GoogleGenerativeAI Error]')) {
        errorMessage = `A Google AI Service error occurred: ${error.toString()}`;
         if (this.onAuthFailureCallback && error.toString().toLowerCase().includes('api key not valid')) {
            this.onAuthFailureCallback(errorMessage);
        }
    }
    console.error(`Error with ${context}:`, error); // Log the original error object
    return errorMessage;
  }

  private formatGroundingChunks(groundingChunks?: GroundingChunk[]): ChatMessageSource[] | undefined {
    if (!groundingChunks || groundingChunks.length === 0) {
      return undefined;
    }
    return groundingChunks
      .filter(gc => gc.web || gc.retrievedContext) // Ensure there's either web or retrievedContext
      .map(gc => ({
        uri: gc.web?.uri || gc.retrievedContext?.uri,
        title: gc.web?.title || gc.retrievedContext?.title || gc.web?.uri || gc.retrievedContext?.uri, // Fallback title to URI if empty
      }))
      .filter(source => source.uri); // Ensure URI is present
  }
  

  async sendMessage(
    sessionId: string, 
    messageParts: Part[], 
    systemInstruction?: string,
    enableSearch?: boolean,
  ): Promise<FormattedApiResponse> {
    if (!googleAIClient) {
      const initError = "Google AI client not initialized. API Key might be missing.";
       if (this.onAuthFailureCallback && !API_KEY) { 
           this.onAuthFailureCallback("API Key Missing: The API_KEY environment variable is not set.");
       } else if (this.onAuthFailureCallback && API_KEY && !googleAIClient) { 
            this.onAuthFailureCallback("Google Client Initialization Failed: Could not connect. Check API Key or network.");
       }
      return { text: "", error: initError };
    }

    try {
      const session = this.getChatSession(sessionId, systemInstruction, enableSearch);
      
      const response: GenerateContentResponse = await session.chat.sendMessage({
        message: messageParts,
      });
      
      const sources = this.formatGroundingChunks(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

      return { text: response.text, sources };

    } catch (error: any) {
      const errorMessage = this.handleApiError(error, 'chat');
      return { text: "", error: errorMessage };
    }
  }

  async *sendMessageStream(
    sessionId: string,
    messageParts: Part[], 
    systemInstructionText?: string,
    enableSearch?: boolean,
  ): AsyncGenerator<FormattedApiResponse, void, undefined> {
    if (!googleAIClient) {
      const initError = "Google AI client not initialized. API Key might be missing.";
      if (this.onAuthFailureCallback && !API_KEY) {
           this.onAuthFailureCallback("API Key Missing: The API_KEY environment variable is not set.");
       } else if (this.onAuthFailureCallback && API_KEY && !googleAIClient) {
            this.onAuthFailureCallback("Google Client Initialization Failed: Could not connect. Check API Key or network.");
       }
      yield { text: "", error: initError };
      return;
    }

    try {
      const session = this.getChatSession(sessionId, systemInstructionText, enableSearch);
      
      const stream = await session.chat.sendMessageStream({
        message: messageParts,
      });
      
      for await (const chunk of stream) { // chunk is GenerateContentResponse
        const textContent = chunk.text; // Access text directly
        const sources = this.formatGroundingChunks(chunk.candidates?.[0]?.groundingMetadata?.groundingChunks);
        
        const formattedResponse: FormattedApiResponse = { text: textContent || "" };
        if (sources && sources.length > 0) {
            formattedResponse.sources = sources;
        }

        if (formattedResponse.text || (formattedResponse.sources && formattedResponse.sources.length > 0)) {
             yield formattedResponse;
        }
      }

    } catch (error: any) {
      const errorMessage = this.handleApiError(error, 'chat');
      yield { text: "", error: errorMessage };
    }
  }
  
  resetChatSession(sessionId: string): void {
    this.activeChats.delete(sessionId);
    this.activeChatSystemInstructions.delete(sessionId);
    this.activeChatSearchSupport.delete(sessionId);
  }

  async generatePixelArtFromImagen(userPrompt: string): Promise<{ imageUrl?: string; error?: string }> {
    if (!googleAIClient) {
      const initError = "Image Generation API Key not configured or Google AI client not initialized.";
      if (this.onAuthFailureCallback && !API_KEY) {
           this.onAuthFailureCallback("API Key Missing: The API_KEY environment variable is not set (required for Image Generation).");
       } else if (this.onAuthFailureCallback && API_KEY && !googleAIClient) {
            this.onAuthFailureCallback("Google Client Initialization Failed: Could not connect to Image Generation service. Check API Key or network.");
       }
      return { error: initError };
    }

    const finalPrompt = `Pixel art style, 16-bit, detailed, vibrant colors, of: ${userPrompt}`;

    try {
      const response = await googleAIClient.models.generateImages({
        model: IMAGEN_MODEL_NAME,
        prompt: finalPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
      });

      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        return { imageUrl };
      } else {
        console.warn("Imagen response missing generatedImages or imageBytes:", response);
        return { error: "No image data was returned by Imagen. The prompt might have been disallowed or an unknown issue occurred." };
      }
    } catch (error: any) {
      const errorMessage = this.handleApiError(error, 'image');
      return { error: errorMessage };
    }
  }
}

export const apiService = new ApiService();