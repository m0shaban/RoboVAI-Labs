
# RoboVAI Labs - Intelligent Learning Platform

## 1. Overview

RoboVAI Labs is an interactive, AI-powered learning platform designed to provide a personalized and engaging educational experience. Users can chat with a diverse roster of AI mentors, each specializing in different subjects, from programming and physics to literature and history. The application features interactive tools like a code editor and a pixel art generator, user profile management with progress tracking, and adaptive learning based on user-inputted skill levels and learning styles. It incorporates Text-to-Speech (TTS) for AI responses and Speech-to-Text (STT) for user input, enhancing accessibility and interaction.

## 2. Core Functionality

*   **AI-Powered Chat**: Engage in dynamic conversations with various AI mentors. Each mentor has a unique personality, specialization, and system prompt to guide their responses.
*   **Mentor Selection**: Choose from a wide array of mentors, each an expert in their domain (e.g., Ada Lovelace for programming, Albert Insight for physics).
*   **Interactive Tools**:
    *   **Code Editor**: Write and execute JavaScript code directly within the application, receiving feedback from AI mentors.
    *   **Pixel Art Generator**: Generate pixel art images based on text prompts using Google's Imagen model.
    *   **Smart Physics Lab (Conceptual)**: A placeholder for discussing interactive physics simulations, allowing mentors to explain concepts related to virtual experiments.
*   **User Profiles & Personalization**:
    *   **Splash Screen Setup**: New users can set their name, gender (optional), preferred learning style, and initial general skill level.
    *   **Assessment Modal**: Users can update their name and specify their skill level for the current mentor's specialization and their preferred learning style at any time.
    *   **Learning Style Adaptation**: Mentors are informed of the user's learning style (Visual, Auditory, Read/Write, Kinesthetic) to tailor explanations.
    *   **Skill Level Adaptation**: Mentors adjust the complexity of their responses and tasks based on the user's self-assessed skill level (1-5).
*   **Progress Tracking**:
    *   **Points System**: Mentors can award points for successfully completed tasks or correct answers.
    *   **Quests**: Mentors can assign tasks or quests, which are displayed in the interactive tool panel.
    *   **User Dashboard**: View earned points, collected badges (future feature), current quests, and basic profile information.
*   **Rich Media Interaction**:
    *   **Text-to-Speech (TTS)**: AI mentor responses can be read aloud.
        *   **Voice Selection**: Users can choose from available system voices or use a default voice automatically selected based on mentor language/gender.
        *   **Autoplay**: Option to automatically play AI responses.
        *   **Interactive Voice Mode**: A hands-free mode where the AI listens after it finishes speaking, creating a continuous voice conversation.
    *   **Speech-to-Text (STT)**: Users can speak their messages, which are transcribed into text.
    *   **File Attachments**: Users can attach images (PNG, JPEG, WEBP, GIF) and various text-based files (TXT, MD, JSON, CSV, JS, PY, HTML, CSS, PDF) to their messages. Images are displayed in chat bubbles; text file content is sent to the AI.
*   **Persistence**:
    *   User profiles are saved in `localStorage`.
    *   Chat history for each mentor is saved in `localStorage`.
*   **Responsive Design**: The application is designed to be usable across various screen sizes, from mobile to desktop.
*   **Error Handling**:
    *   Displays messages for missing or invalid API keys.
    *   Shows chat-related errors from the API.

## 3. Key Features Detailed

*   **Dynamic Mentor System**: Mentors are defined in `constants.ts` with unique IDs, names, specializations, system prompts, greeting messages, and optional gender and search support flags.
*   **Contextual System Prompts**: Mentor system prompts are dynamically updated with the user's name, learning style, and skill level for more personalized interactions.
*   **Interactive Avatar Panel**: Provides visual feedback during Interactive Voice Mode, showing states like listening, processing, and speaking.
*   **API Key Management**: The application relies on a `process.env.API_KEY` environment variable. It checks for the key's presence and displays appropriate messages if it's missing or if authentication fails. **The application does not provide a UI for users to enter the API key.**
*   **Google Search Grounding**: Certain mentors (e.g., Cosmo Navigator) can use Google Search to answer questions about recent events or provide up-to-date information. Search results' sources are displayed in the chat.
*   **Tool Invocation via Tags**: Mentors use specific tags (e.g., `[TOOL:code-editor]`, `[PROMPT_FOR_PIXEL_ART:your prompt]`, `[QUEST:description]`, `[POINTS:number]`) in their responses to trigger UI changes or actions in the application.
*   **Modular Icon System**: SVG icons are used throughout the application, with a helper function `getMentorIconComponent` to dynamically select mentor icons.
*   **Tailwind CSS Customization**: Includes custom colors, fonts, breakpoints, and animations defined in `index.html` to create a unique futuristic aesthetic.

## 4. Technologies Used

*   **Frontend Library**: React 19 (using Hooks)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (configured directly in `index.html`)
*   **AI Services**:
    *   **Google Gemini API (`@google/genai`)**:
        *   Chat: `gemini-2.5-flash-preview-04-17` model.
        *   Image Generation: `imagen-3.0-generate-002` model.
*   **Browser APIs**:
    *   **Web Speech API**:
        *   `SpeechSynthesis` (for Text-to-Speech)
        *   `MediaRecorder` & `getUserMedia` (for Speech-to-Text audio capture)
    *   **`localStorage`**: For storing user profiles and chat history.
    *   **`FileReader`**: For processing file attachments.
*   **Module Loading**: ES Modules with an import map in `index.html`, utilizing `esm.sh` for CDN delivery of packages like React, `@google/genai`, and `uuid`.
*   **Unique IDs**: `uuid` library for generating unique IDs for messages.

## 5. Project Structure

```
.
├── index.html               # Main HTML entry point, Tailwind config, fonts, import map
├── index.tsx                # React application root
├── App.tsx                  # Main application component, state management, view routing
├── metadata.json            # Application name and permissions (camera, microphone)
├── README.md                # This file
├── components/              # UI components
│   ├── AssessmentModal.tsx      # Modal for learning profile assessment
│   ├── ChatInterface.tsx      # Core chat UI, input handling, TTS/STT controls
│   ├── IntegratedToolPanel.tsx  # Panel for Code Editor, Pixel Art, Quests
│   ├── InteractiveAvatarPanel.tsx # UI for interactive voice mode
│   ├── MentorSelector.tsx     # Sidebar for selecting mentors & navigation
│   ├── MessageBubble.tsx      # Renders individual chat messages
│   ├── SplashScreen.tsx       # Initial user setup screen
│   ├── UserDashboard.tsx      # Displays user progress and profile info
│   └── icons/                 # SVG icon components (e.g., BrainIcon.tsx, SendIcon.tsx)
├── hooks/                   # Custom React Hooks
│   ├── useChat.ts             # Manages chat state, API calls, STT, message processing
│   ├── useTTS.ts              # Manages Text-to-Speech functionality
├── services/                # API service integrations
│   ├── ApiService.ts          # Handles all communication with Google Gemini & Imagen APIs
├── types.ts                 # TypeScript type definitions for the application
└── constants.ts             # Global constants, mentor definitions, API model names
```

## 6. Setup and Running

### Prerequisites

*   A modern web browser with support for:
    *   ES Modules
    *   Web Speech API (SpeechSynthesis, MediaRecorder)
    *   `localStorage`
*   An internet connection (for fetching dependencies from `esm.sh` and for API calls).

### API Key Configuration

**Crucial**: This application requires a valid Google Generative AI API key.
The API key **must** be provided as an environment variable named `API_KEY`.
It is assumed that the execution environment (e.g., Google's Project IDX, a custom server setup) makes this environment variable available to the frontend JavaScript code as `process.env.API_KEY`.

**The application will not function correctly without a valid and properly configured API key.** It does not include any UI for users to input or manage the API key.

### Running the Application

1.  **Ensure `API_KEY` is set**: Verify that the `API_KEY` environment variable is accessible in the environment where you intend to run the application.
2.  **Serve `index.html`**:
    *   **Local Development**: Use a local development server that can serve static files and correctly handle ES module resolution if not fully managed by browser import maps for all local paths. A simple server like `live-server` (npm package) or Python's `http.server` can be used.
        ```bash
        # Example using live-server (if installed: npm install -g live-server)
        live-server .
        ```
    *   **Deployment**: Deploy the entire project folder to a static web hosting service.
3.  **Open in Browser**: Navigate to `index.html` (or the URL provided by your local server/hosting service) in your web browser.

## 7. Environment Variables

*   `API_KEY` (Required): Your Google Generative AI API key. This key is used for both the Gemini chat model and the Imagen image generation model.

## 8. API Usage

*   **Chat**: Uses the Gemini API (`gemini-2.5-flash-preview-04-17` model) via `ApiService.ts`. Supports text, image, and audio inputs (audio is transcribed first or sent as a part to be understood by the model if it supports it). Streaming responses are used to display text as it's generated.
*   **Image Generation**: Uses the Imagen API (`imagen-3.0-generate-002` model) via `ApiService.ts` to generate pixel art.
*   **Google Search Grounding**: The `ApiService` supports enabling Google Search for chat sessions, which is utilized by mentors flagged with `supportsSearch: true`. Grounding metadata (sources) is extracted and displayed.

## 9. Key UI/UX Aspects

*   **Theme**: A modern, futuristic, "cyber/tech" aesthetic is achieved through a dark color palette (primarily blues, neutrals, and cyans), custom fonts (`Inter`, `Lexend`, `Tajawal`), and subtle animations.
*   **Responsiveness**: The layout adapts to different screen sizes using Tailwind CSS's responsive prefixes and custom breakpoints.
*   **Animations**: Various animations are used for visual feedback and engagement (e.g., button presses, message bubble entry, loading spinners, glowing effects). These are defined in `tailwind.config` within `index.html`.
*   **Custom Styling**:
    *   **Scrollbars**: Custom-styled scrollbars for a consistent look.
    *   **Form Elements**: Custom styles for checkboxes and select dropdowns.
    *   **Text Shadows**: Applied for better text legibility and depth.
*   **Accessibility (Considerations)**:
    *   ARIA attributes (`aria-label`, `aria-pressed`) are used on interactive elements.
    *   Focus states are styled for better visibility.
    *   Semantic HTML is used where appropriate.
    *   TTS and STT features improve accessibility for some users.

## 10. State Management

*   **Component State (`useState`, `useReducer` implied)**: Primarily managed within `App.tsx` and individual components/hooks.
*   **Custom Hooks**: Logic for chat (`useChat`) and TTS (`useTTS`) is encapsulated in custom hooks for better organization and reusability.
*   **`localStorage`**: Used for persisting:
    *   The user's profile (`userProfile`).
    *   Chat history for each mentor (`chatHistory`).

## 11. Notes and Known Issues

*   **TTS Voice Availability**: The quality and availability of TTS voices (including different languages and genders) depend entirely on the user's browser and operating system. The application lists available voices but cannot add new ones.
*   **STT Accuracy**: Speech-to-text accuracy is dependent on the browser's implementation, microphone quality, and ambient noise.
*   **API Costs**: Use of the Google Gemini and Imagen APIs may incur costs depending on usage and your Google Cloud billing setup.
*   **File Size Limits**: While basic checks are in place for uploaded file size in `ChatInterface.tsx` (10MB), large files or a high volume of file uploads might impact performance or API limits. Text content from files is truncated if very large before sending to the AI.

---

This README aims to provide a comprehensive guide to the RoboVAI Labs application.
