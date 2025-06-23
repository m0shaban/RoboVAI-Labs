
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage, Mentor, UserProfile, ChatMessageSource } from '../types';
import type { Part } from '@google/genai'; 
import { SenderType } from '../types';
import { apiService } from '../services/ApiService'; 
import { v4 as uuidv4 } from 'uuid';

const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';

const loadChatHistory = (): Record<string, ChatMessage[]> => {
  try {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      Object.keys(parsedHistory).forEach(mentorId => {
        parsedHistory[mentorId] = parsedHistory[mentorId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      });
      return parsedHistory;
    }
  } catch (error) {
    console.error("Error loading chat history from localStorage:", error);
  }
  return {};
};

const saveChatHistory = (history: Record<string, ChatMessage[]>) => {
  try {
    const serializableHistory: Record<string, any[]> = {};
    Object.keys(history).forEach(mentorId => {
      serializableHistory[mentorId] = history[mentorId].map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
    });
    localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(serializableHistory));
  } catch (error) {
    console.error("Error saving chat history to localStorage:", error);
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.onerror = (error) => reject(error);
  });
};

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Text cleaning function (similar to MessageBubble, can be centralized later)
const cleanTextForTTSGlobal = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') 
    .replace(/\*(.*?)\*/g, '$1')   
    .replace(/```[\s\S]*?```/g, '(Code block)') 
    .replace(/\[TOOL:.*?\]/gi, '') 
    .replace(/\[PROMPT_FOR_PIXEL_ART:.*?\]/gi, '')
    .replace(/\[QUEST:.*?\]/gi, '(New quest assigned)')
    .replace(/\[POINTS:.*?\]/gi, '')
    .replace(/<[^>]*>/g, '') 
    .trim();
};


export const useChat = (
  mentor: Mentor, 
  userProfile: UserProfile | null,
  onSetInteractiveTool: (tool: string | null) => void,
  onSetInitialPixelArtPrompt: (prompt: string | null) => void,
  onSetCurrentQuest: (quest: string | null) => void,
  onUserProgressUpdate: (points: number) => void,
  // New props for TTS Autoplay and Interactive Mode
  isTTSAutoplayEnabled: boolean,
  isInteractiveVoiceModeActive: boolean,
  speakTTS: (messageId: string, text: string, lang: string, mentorGender?: Mentor['gender']) => Promise<void>
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileDisplayInfo, setSelectedFileDisplayInfo] = useState<{ name: string; type: string; size: number } | null>(null);


  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Refs to keep track of latest prop values for async operations
  const isInteractiveVoiceModeActiveRef = useRef(isInteractiveVoiceModeActive);
  useEffect(() => {
    isInteractiveVoiceModeActiveRef.current = isInteractiveVoiceModeActive;
  }, [isInteractiveVoiceModeActive]);

  useEffect(() => {
    apiService.resetChatSession(mentor.id);
    const allHistory = loadChatHistory();
    const mentorHistory = allHistory[mentor.id];

    if (mentorHistory && mentorHistory.length > 0) {
      setMessages(mentorHistory);
    } else {
      setMessages([
        {
          id: uuidv4(),
          text: mentor.greetingMessage,
          sender: SenderType.AI,
          timestamp: new Date(),
          mentorId: mentor.id,
        },
      ]);
    }
    setError(null);
    setInputValue('');
    setSelectedFile(null);
    setSelectedFileDisplayInfo(null);
    setIsRecording(false);
    setIsProcessingAudio(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    onSetInteractiveTool(null); 
    onSetInitialPixelArtPrompt(null);
    onSetCurrentQuest(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentor]); 

  useEffect(() => {
    if (mentor && messages.length > 0) {
      const allHistory = loadChatHistory();
      allHistory[mentor.id] = messages;
      saveChatHistory(allHistory);
    }
  }, [messages, mentor]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setSelectedFileDisplayInfo({ name: file.name, type: file.type, size: file.size });
    } else {
      setSelectedFileDisplayInfo(null);
    }
  }, []);

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setSelectedFileDisplayInfo(null);
  }, []);

  const startRecording = async () => {
    if (isRecording || isProcessingAudio) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      audioChunksRef.current = [];
      const mimeTypes = [
        'audio/webm; codecs=opus',
        'audio/ogg; codecs=opus',
        'audio/mp4', 
        'audio/webm', 
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      
      if (!supportedMimeType) {
          console.error("No suitable audio MIME type found for MediaRecorder.");
          setError("Your browser doesn't support a suitable audio recording format.");
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
          return;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsProcessingAudio(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
        try {
          const audioFile = new File([audioBlob], "audio_recording" + (supportedMimeType.includes('webm') ? ".webm" : ".ogg"), { type: supportedMimeType });
          const base64Audio = await fileToBase64(audioFile);
          await handleSubmitMessage(base64Audio, supportedMimeType); 
        } catch (audioError) {
          console.error("Error processing audio:", audioError);
          setError("Failed to process recorded audio.");
        } finally {
          setIsProcessingAudio(false);
          stream.getTracks().forEach(track => track.stop()); 
        }
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not start recording. Ensure microphone permission is granted.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };


  const parseTag = (text: string, tagName: string): string | null => {
    const regex = new RegExp(`\\[${tagName}:([\\s\\S]+?)\\]`, 'i');
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : null;
  };
  
  const parsePointsFromMessage = (text: string): number | null => {
    const pointsRegex = /\[POINTS:(\d+)\]/i;
    const match = text.match(pointsRegex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const addMessageToList = useCallback((message: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const sendSystemMessageToAI = useCallback(async (systemMessageContent: Part[]) => {
    setIsLoading(true);
    setError(null);

    let systemPromptText = mentor.systemPrompt;
    if (userProfile) {
        systemPromptText = systemPromptText.replace('{userName}', userProfile.name);
        systemPromptText = systemPromptText.replace('{learningStyle}', userProfile.learningStyle || 'any');
        const skillKey = mentor.specialization.toLowerCase();
        const skillLevel = userProfile.skillLevels?.[skillKey] || 1; 
        systemPromptText = systemPromptText.replace('{skillLevel}', skillLevel.toString());
    } else {
        systemPromptText = systemPromptText.replace('{userName}', 'Learner');
        systemPromptText = systemPromptText.replace('{learningStyle}', 'any');
        systemPromptText = systemPromptText.replace('{skillLevel}', '1');
    }
    
    let fullResponseText = "";
    let aiMessageId = uuidv4();
    let firstChunkReceived = false;
    let accumulatedSources: ChatMessageSource[] = [];
    let finalAiMessageFromStream: ChatMessage | null = null;


    for await (const chunk of apiService.sendMessageStream(
      mentor.id, 
      systemMessageContent, 
      systemPromptText, 
      mentor.supportsSearch
    )) {
      if (chunk.error) {
        setError(chunk.error);
        addMessageToList({
            id: uuidv4(),
            text: chunk.error,
            sender: SenderType.AI,
            timestamp: new Date(),
            mentorId: mentor.id,
            isError: true,
         });
        setIsLoading(false);
        return;
      }
      
      if (chunk.text === null || typeof chunk.text === 'undefined') {
        if (chunk.sources && chunk.sources.length > 0) { // Handle chunks with only sources
            const newSources = chunk.sources.filter(s => s.uri && !accumulatedSources.find(as => as.uri === s.uri));
            if (newSources.length > 0) accumulatedSources.push(...newSources);
            if (finalAiMessageFromStream) { // Update existing message with sources if it exists
                 setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === aiMessageId
                            ? { ...msg, sources: [...(msg.sources || []), ...newSources].filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i) } // Deduplicate
                            : msg
                    )
                );
            }
        }
        continue;
      }
      
      fullResponseText += chunk.text;
      if (chunk.sources && chunk.sources.length > 0) {
        const newSources = chunk.sources.filter(s => s.uri && !accumulatedSources.find(as => as.uri === s.uri));
        if (newSources.length > 0) accumulatedSources.push(...newSources);
      }


      if (!firstChunkReceived && chunk.text.trim() !== "") {
          finalAiMessageFromStream = {
            id: aiMessageId,
            text: fullResponseText,
            sender: SenderType.AI,
            timestamp: new Date(),
            mentorId: mentor.id,
            isLoading: true, 
            sources: accumulatedSources.length > 0 ? [...accumulatedSources] : undefined,
          };
          addMessageToList(finalAiMessageFromStream);
          firstChunkReceived = true;
      } else if (firstChunkReceived) {
          setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                  msg.id === aiMessageId
                      ? { ...msg, text: fullResponseText, sources: accumulatedSources.length > 0 ? [...accumulatedSources].filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i) : msg.sources } // Deduplicate
                      : msg
              )
          );
           if(finalAiMessageFromStream) {
             finalAiMessageFromStream.text = fullResponseText;
             finalAiMessageFromStream.sources = accumulatedSources.length > 0 ? [...accumulatedSources] : undefined;
           }
      }
    }
    
    if (!firstChunkReceived && fullResponseText.trim() === "" && !error) {
       console.warn("Stream ended without any text data for system message AI response.");
        finalAiMessageFromStream = {
            id: aiMessageId, 
            text: accumulatedSources.length > 0 ? "" : "[No response from mentor]", // Show sources even if no text
            sender: SenderType.AI,
            timestamp: new Date(),
            mentorId: mentor.id,
            isError: false, 
            isLoading: false,
            sources: accumulatedSources.length > 0 ? accumulatedSources : undefined,
        };
        addMessageToList(finalAiMessageFromStream);
    } else if (finalAiMessageFromStream) {
         setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: fullResponseText, isLoading: false, sources: accumulatedSources.length > 0 ? accumulatedSources.filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i) : msg.sources } : msg
            )
          );
    }
    
    const awardedPoints = parsePointsFromMessage(fullResponseText);
    if (awardedPoints !== null) {
      onUserProgressUpdate(awardedPoints);
    }
    const newQuest = parseTag(fullResponseText, 'QUEST');
    if (newQuest) {
        onSetCurrentQuest(newQuest);
    }

    // TTS Autoplay / Interactive Mode TTS for system-triggered AI responses
    const finalMessageForTTS = messages.find(m => m.id === aiMessageId) || finalAiMessageFromStream;
    if (finalMessageForTTS && !finalMessageForTTS.isLoading && finalMessageForTTS.text) {
        if (isTTSAutoplayEnabled && !isInteractiveVoiceModeActiveRef.current) { 
            const cleanedText = cleanTextForTTSGlobal(finalMessageForTTS.text);
            if (cleanedText) {
                speakTTS(finalMessageForTTS.id, cleanedText, mentor.id.startsWith('arabic') ? 'ar-SA' : 'en-US', mentor.gender).catch(e => console.error("Autoplay TTS failed", e));
            }
        } else if (isInteractiveVoiceModeActiveRef.current) {
            const cleanedText = cleanTextForTTSGlobal(finalMessageForTTS.text);
            if (cleanedText) {
                speakTTS(finalMessageForTTS.id, cleanedText, mentor.id.startsWith('arabic') ? 'ar-SA' : 'en-US', mentor.gender).catch(e => console.error("Interactive mode TTS failed", e));
            }
        }
    }
    setIsLoading(false);
  }, [mentor, userProfile, onUserProgressUpdate, onSetCurrentQuest, addMessageToList, setMessages, setIsLoading, setError, isTTSAutoplayEnabled, speakTTS]);


  const handleCodeExecutionFeedback = useCallback(async (code: string, output: string, hasError: boolean) => {
    const systemMessageText = `User executed code:\n\`\`\`javascript\n${code}\n\`\`\`\n${hasError ? 'Error' : 'Output'}:\n${output}`;
    
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      text: systemMessageText,
      sender: SenderType.SYSTEM,
      timestamp: new Date(),
    };
    addMessageToList(systemMessage);

    if (!hasError) {
      onUserProgressUpdate(2); 
    }
    await sendSystemMessageToAI([{text: systemMessageText}]);
  }, [sendSystemMessageToAI, onUserProgressUpdate, addMessageToList]);

  const handlePixelArtNotification = useCallback(async (promptUsed: string, imageUrl: string) => {
    const systemMessageForChatText = `User generated pixel art with prompt "${promptUsed}". The image is shown below.`;
    
    const systemMessageForChat: ChatMessage = {
      id: uuidv4(),
      text: systemMessageForChatText,
      sender: SenderType.SYSTEM, 
      timestamp: new Date(),
      image: imageUrl, 
    };
    addMessageToList(systemMessageForChat);

    onUserProgressUpdate(3); 
    
    const systemContentForAI = `User generated pixel art with prompt "${promptUsed}". The image was displayed to them. Please comment on their creation or ask about it.`;
    await sendSystemMessageToAI([{text: systemContentForAI}]);
  }, [sendSystemMessageToAI, onUserProgressUpdate, addMessageToList]);


  const handleSubmitMessage = useCallback(async (audioDataB64?: string, audioMimeType?: string) => {
    const currentInput = inputValue;
    const currentFile = selectedFile;

    if (!currentInput.trim() && !currentFile && !audioDataB64) return;

    setIsLoading(true);
    setError(null);

    const userMessageId = uuidv4();
    let userMessageText = currentInput.trim(); 
    let attachedFileInfo: ChatMessage['attachedFile'] | undefined = undefined;

    const messageParts: Part[] = []; 

    if (userMessageText) {
      messageParts.push({ text: userMessageText });
    }

    if (currentFile) {
      try {
        const isImage = currentFile.type.startsWith('image/');
        const isInterpretableText = ['text/plain', 'text/markdown', 'application/json', 'text/csv', 'text/javascript', 'application/x-python-code', 'text/html', 'text/css'].includes(currentFile.type) 
                                    || currentFile.name.endsWith('.py') || currentFile.name.endsWith('.js') || currentFile.name.endsWith('.c') || currentFile.name.endsWith('.cpp')  || currentFile.name.endsWith('.java');
        
        let fileContentB64: string;
        let displayDataUrl: string | undefined = undefined;

        if (isImage) {
          fileContentB64 = await fileToBase64(currentFile);
          displayDataUrl = `data:${currentFile.type};base64,${fileContentB64}`;
          messageParts.push({ inlineData: { mimeType: currentFile.type, data: fileContentB64 } });
        } else if (isInterpretableText) {
          const textContent = await readTextFile(currentFile);
          const MAX_TEXT_LENGTH = 20000; 
          const truncatedContent = textContent.length > MAX_TEXT_LENGTH ? textContent.substring(0, MAX_TEXT_LENGTH) + "\n[Content truncated]" : textContent;
          
          let fileDescription = `The user attached a file named "${currentFile.name}" (type: ${currentFile.type}). Its content is:\n\`\`\`${currentFile.name.split('.').pop() || 'text'}\n${truncatedContent}\n\`\`\``;
          
          if(messageParts.length > 0 && typeof messageParts[0].text === 'string') {
            messageParts[0].text += `\n\n${fileDescription}`; 
          } else {
            messageParts.unshift({ text: fileDescription }); 
          }
           if (!userMessageText) userMessageText = `File: ${currentFile.name}`;
        } else {
          const fileNameText = `User has attached a file named: "${currentFile.name}" (Type: ${currentFile.type}). I (the AI) cannot see the content of this specific file type directly. Please ask the user for relevant information if needed.`;
          if (messageParts.length > 0 && typeof messageParts[0].text === 'string') {
            messageParts[0].text += `\n${fileNameText}`;
          } else {
            messageParts.unshift({ text: fileNameText });
          }
          if (!userMessageText) userMessageText = `Attached file: ${currentFile.name}`;
        }
        
        attachedFileInfo = { 
          name: currentFile.name, 
          type: currentFile.type, 
          size: currentFile.size,
          dataUrl: displayDataUrl 
        };

      } catch (fileError) {
        console.error("Error processing file:", fileError);
        setError("Failed to process the selected file.");
        setIsLoading(false);
        return;
      }
    }
    
    if (audioDataB64 && audioMimeType) {
      messageParts.push({ inlineData: { mimeType: audioMimeType, data: audioDataB64 } });
      if (!userMessageText && !currentFile) { 
          userMessageText = "[Audio Message]"; 
      } else if (userMessageText && messageParts.some(p => typeof p.text === 'string')) {
          const textPartIndex = messageParts.findIndex(p => typeof p.text === 'string');
          if (textPartIndex !== -1) {
            messageParts[textPartIndex].text += " [Audio was also sent]";
          }
      }
    }
    
    const hasInlineData = messageParts.some(p => p.inlineData);
    const hasTextData = messageParts.some(p => typeof p.text === 'string' && p.text.trim() !== "");

    if (hasInlineData && !hasTextData && messageParts.length > 0) {
      // If there's an image/audio but no text, Gemini needs an empty text part for multimodal.
      const textPartExists = messageParts.some(p => typeof p.text === 'string');
      if (!textPartExists) {
        messageParts.unshift({ text: "" });
      }
    }
    
    if (messageParts.length === 0) {
        console.warn("handleSubmitMessage called with no content messageParts.");
        setIsLoading(false);
        return;
    }

    const userMessage: ChatMessage = {
      id: userMessageId,
      text: userMessageText || (currentFile ? `File: ${currentFile.name}` : "[Audio Message]"), 
      sender: SenderType.USER,
      timestamp: new Date(),
      attachedFile: attachedFileInfo,
    };
    addMessageToList(userMessage);

    setInputValue('');
    setSelectedFile(null);
    setSelectedFileDisplayInfo(null);
    
    try {
      let systemPromptText = mentor.systemPrompt;
       if (userProfile) {
        systemPromptText = systemPromptText.replace('{userName}', userProfile.name);
        systemPromptText = systemPromptText.replace('{learningStyle}', userProfile.learningStyle || 'any');
        const skillKey = mentor.specialization.toLowerCase();
        const skillLevel = userProfile.skillLevels?.[skillKey] || 1; 
        systemPromptText = systemPromptText.replace('{skillLevel}', skillLevel.toString());
      } else {
        systemPromptText = systemPromptText.replace('{userName}', 'Learner');
        systemPromptText = systemPromptText.replace('{learningStyle}', 'any');
        systemPromptText = systemPromptText.replace('{skillLevel}', '1');
      }
      
      let fullResponseText = "";
      let aiMessageId = uuidv4();
      let firstChunkReceived = false;
      let finalAiMessageFromStream: ChatMessage | null = null;
      let accumulatedSources: ChatMessageSource[] = [];


      for await (const chunk of apiService.sendMessageStream(
        mentor.id, 
        messageParts, 
        systemPromptText,
        mentor.supportsSearch
      )) {
        if (chunk.error) {
          setError(chunk.error);
          addMessageToList({
              id: uuidv4(),
              text: chunk.error,
              sender: SenderType.AI,
              timestamp: new Date(),
              mentorId: mentor.id,
              isError: true,
           });
          setIsLoading(false);
          return;
        }
        
        if (chunk.text === null || typeof chunk.text === 'undefined') {
             if (chunk.sources && chunk.sources.length > 0) { // Handle chunks with only sources
                const newSources = chunk.sources.filter(s => s.uri && !accumulatedSources.find(as => as.uri === s.uri));
                if (newSources.length > 0) accumulatedSources.push(...newSources);

                if (finalAiMessageFromStream) { // Update existing message with sources
                     setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.id === aiMessageId
                                ? { ...msg, sources: [...(msg.sources || []), ...newSources].filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i) }
                                : msg
                        )
                    );
                }
            }
            continue;
        }
        
        fullResponseText += chunk.text;
        if (chunk.sources && chunk.sources.length > 0) {
            const newSources = chunk.sources.filter(s => s.uri && !accumulatedSources.find(as => as.uri === s.uri));
            if (newSources.length > 0) accumulatedSources.push(...newSources);
        }


        if (!firstChunkReceived && chunk.text.trim() !== "") {
            finalAiMessageFromStream = {
                id: aiMessageId,
                text: fullResponseText,
                sender: SenderType.AI,
                timestamp: new Date(),
                mentorId: mentor.id,
                isLoading: true,
                sources: accumulatedSources.length > 0 ? [...accumulatedSources] : undefined,
            };
            addMessageToList(finalAiMessageFromStream);
            firstChunkReceived = true;
        } else if (firstChunkReceived) {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === aiMessageId
                        ? { ...msg, text: fullResponseText, sources: accumulatedSources.length > 0 ? [...accumulatedSources].filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i) : msg.sources }
                        : msg
                )
            );
            if (finalAiMessageFromStream) {
                finalAiMessageFromStream.text = fullResponseText;
                finalAiMessageFromStream.sources = accumulatedSources.length > 0 ? [...accumulatedSources] : undefined;
            }
        }
      }
      
      if (!firstChunkReceived && (fullResponseText.trim() === "") && !error) {
        finalAiMessageFromStream = {
            id: aiMessageId, 
            text: accumulatedSources.length > 0 ? "" : "[No response from mentor]",
            sender: SenderType.AI,
            timestamp: new Date(),
            mentorId: mentor.id,
            isError: false, 
            isLoading: false, 
            sources: accumulatedSources.length > 0 ? accumulatedSources : undefined,
        };
        addMessageToList(finalAiMessageFromStream);
      } else if (finalAiMessageFromStream) {
         setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: fullResponseText, isLoading: false, sources: accumulatedSources.length > 0 ? accumulatedSources.filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i) : msg.sources } : msg
            )
          );
          finalAiMessageFromStream.text = fullResponseText;
          finalAiMessageFromStream.isLoading = false;
          finalAiMessageFromStream.sources = accumulatedSources.length > 0 ? accumulatedSources : undefined;
      }


      const activeTool = parseTag(fullResponseText, 'TOOL');
      if (activeTool) onSetInteractiveTool(activeTool);

      const initialPixelArtPrompt = parseTag(fullResponseText, 'PROMPT_FOR_PIXEL_ART');
      if (initialPixelArtPrompt) onSetInitialPixelArtPrompt(initialPixelArtPrompt);

      const newQuest = parseTag(fullResponseText, 'QUEST');
      if (newQuest) onSetCurrentQuest(newQuest);
      
      const awardedPoints = parsePointsFromMessage(fullResponseText);
      if (awardedPoints !== null) onUserProgressUpdate(awardedPoints);

      // TTS Autoplay or Interactive Mode TTS
      const finalMessageForTTS = messages.find(m => m.id === aiMessageId) || finalAiMessageFromStream; // Prefer state version
      if (finalMessageForTTS && !finalMessageForTTS.isLoading && finalMessageForTTS.text) {
          const cleanedText = cleanTextForTTSGlobal(finalMessageForTTS.text);
          if (cleanedText) {
              const lang = mentor.id.startsWith('arabic') ? 'ar-SA' : 'en-US'; // Basic language check
              if (isInteractiveVoiceModeActiveRef.current) {
                  speakTTS(finalMessageForTTS.id, cleanedText, lang, mentor.gender)
                    .catch(e => console.error("Interactive mode TTS failed", e));
              } else if (isTTSAutoplayEnabled) {
                  speakTTS(finalMessageForTTS.id, cleanedText, lang, mentor.gender)
                    .catch(e => console.error("Autoplay TTS failed", e));
              }
          }
      }


    } catch (e) {
      console.error("Failed to send message via useChat:", e);
      const errorText = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorText);
       addMessageToList({
          id: uuidv4(),
          text: errorText,
          sender: SenderType.AI,
          timestamp: new Date(),
          mentorId: mentor.id,
          isError: true,
       });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, selectedFile, mentor, userProfile, onSetInteractiveTool, onSetInitialPixelArtPrompt, onSetCurrentQuest, onUserProgressUpdate, addMessageToList, sendSystemMessageToAI, setIsLoading, setError, setInputValue, setSelectedFile, setSelectedFileDisplayInfo, setMessages, isTTSAutoplayEnabled, speakTTS ]);

  const handleClearChatHistory = useCallback(() => {
    if (window.confirm(`Are you sure you want to clear the chat history with ${mentor.name}? This action cannot be undone.`)) {
      const allHistory = loadChatHistory();
      delete allHistory[mentor.id];
      saveChatHistory(allHistory);

      setMessages([
        {
          id: uuidv4(),
          text: mentor.greetingMessage,
          sender: SenderType.AI,
          timestamp: new Date(),
          mentorId: mentor.id,
        },
      ]);
      apiService.resetChatSession(mentor.id);
      setError(null);
      setInputValue('');
      setSelectedFile(null);
      setSelectedFileDisplayInfo(null);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  }, [mentor, setMessages, setError, setInputValue, setSelectedFile, setSelectedFileDisplayInfo, setIsRecording]);

  return {
    messages,
    inputValue,
    isLoading,
    error,
    handleInputChange,
    handleSubmitMessage,
    handleCodeExecutionFeedback,
    handlePixelArtNotification,
    handleClearChatHistory,
    selectedFile: selectedFileDisplayInfo, 
    handleFileSelect,
    clearSelectedFile,
    isRecording,
    isProcessingAudio,
    startRecording,
    stopRecording,
  };
};