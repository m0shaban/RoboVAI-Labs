
export enum SenderType {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface ChatMessageSource {
  uri?: string;
  title?: string;
}
export interface ChatMessage {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: Date;
  mentorId?: string;
  image?: string; // For AI generated images
  codeBlock?: string;
  toolOutput?: any;
  isLoading?: boolean;
  isError?: boolean;
  attachedFile?: { // For user-uploaded files
    name: string;
    type: string;
    size: number;
    dataUrl?: string; // For images, to display in bubble
  };
  sources?: ChatMessageSource[]; // For displaying sources from Google Search
}

export interface Mentor {
  id: string;
  name: string;
  specialization: string;
  avatarUrl: string; // Will be ignored by components, BrainIcon will be used instead
  systemPrompt: string;
  greetingMessage: string;
  supportsSearch?: boolean; 
  gender?: 'male' | 'female' | 'neutral'; // Added gender field
}

export enum LearningStyle {
  VISUAL = 'Visual',
  AUDITORY = 'Auditory',
  READ_WRITE = 'Read/Write',
  KINESTHETIC = 'Kinesthetic',
}

export interface UserProfile {
  id: string;
  name: string;
  gender?: 'male' | 'female' | ''; // Updated gender type to include empty string for "not selected"
  skillLevels: Record<string, number>; 
  learningStyle?: LearningStyle;
  personalityTraits?: string[];
  progress: {
    completedModules: string[];
    points: number;
    badges: string[];
    currentQuests: Record<string, string>; 
  };
}

// Part types for Google GenAI API communication
export interface TextPart {
  text: string;
  inlineData?: never;
}
export interface InlineDataPart {
  text?: never;
  inlineData: {
    mimeType: string;
    data: string; // Base64-encoded bytes.
  };
}
export type Part = TextPart | InlineDataPart;


// Simplified API response for UI service needs.
export interface FormattedApiResponse {
  text: string;
  error?: string;
  sources?: ChatMessageSource[]; // For Google Search grounding
}