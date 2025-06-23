import React, { useRef, useEffect, useState } from 'react';
import type { Mentor, UserProfile, ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PaperclipIcon } from './icons/PaperclipIcon'; 
import { MicrophoneIcon } from './icons/MicrophoneIcon'; 
import { XCircleIcon } from './icons/XCircleIcon'; 
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon'; 
import { RobotIcon } from './icons/RobotIcon'; // For interactive voice mode button

interface ChatInterfaceProps {
  mentor: Mentor;
  userProfile: UserProfile | null;
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  error: string | null;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitMessage: () => Promise<void>;
  handleClearChatHistory: () => void;
  
  selectedFile: { name: string; type: string; size: number } | null;
  handleFileSelect: (file: File | null) => void;
  clearSelectedFile: () => void;

  isRecording: boolean;
  isProcessingAudio: boolean;
  startRecording: () => void;
  stopRecording: () => void;

  // TTS props
  speak: (messageId: string, text: string, lang: string, mentorGender?: Mentor['gender']) => Promise<void>;
  cancelTTS: () => void;
  isTTSSpeaking: boolean;
  ttsSpeakingMessageId: string | null;
  availableTTSVoices: SpeechSynthesisVoice[];
  selectedTTSVoiceURI: string | null;
  setSelectedTTSVoice: (voiceURI: string | null) => void;

  // Autoplay and Interactive Mode Props
  isTTSAutoplayEnabled: boolean;
  toggleTTSAutoplay: () => void;
  isInteractiveVoiceModeActive: boolean;
  toggleInteractiveVoiceMode: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  mentor, 
  messages,
  inputValue,
  isLoading,
  error,
  handleInputChange,
  handleSubmitMessage,      
  handleClearChatHistory,
  selectedFile,
  handleFileSelect,
  clearSelectedFile,
  isRecording,
  isProcessingAudio,
  startRecording,
  stopRecording,
  speak,
  cancelTTS,
  isTTSSpeaking,
  ttsSpeakingMessageId,
  availableTTSVoices,
  selectedTTSVoiceURI,
  setSelectedTTSVoice,
  isTTSAutoplayEnabled,
  toggleTTSAutoplay,
  isInteractiveVoiceModeActive,
  toggleInteractiveVoiceMode,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!isInteractiveVoiceModeActive) { 
      inputRef.current?.focus();
    }
  }, [mentor, isInteractiveVoiceModeActive]);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isTTSSpeaking) cancelTTS(); 
    await handleSubmitMessage();
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; 
      const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      const ALLOWED_TEXT_TYPES = ['text/plain', 'text/markdown', 'application/json', 'text/csv', 'text/javascript', 'application/x-python-code', 'text/html', 'text/css', 'application/pdf'];

      if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024*1024)}MB.`);
        event.target.value = ''; 
        return;
      }
      
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isText = ALLOWED_TEXT_TYPES.includes(file.type) || file.name.endsWith('.py') || file.name.endsWith('.js');

      if (isImage || isText) {
        handleFileSelect(file);
      } else {
         handleFileSelect(file); 
      }
    }
    event.target.value = ''; 
  };

  const handleMicClick = () => {
    if (isTTSSpeaking) cancelTTS(); 
    if (isRecording) {
      stopRecording();
    } else {
      if (!isInteractiveVoiceModeActive) startRecording(); 
    }
  };

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTTSVoice(event.target.value === "auto" ? null : event.target.value);
  };

  const canSendMessage = !isLoading && !isProcessingAudio && (inputValue.trim() !== '' || selectedFile !== null);

  return (
    <div className="flex flex-col flex-1 h-full bg-transparent p-4 xs:p-6 sm:p-8">
      <div className="flex-1 overflow-y-auto mb-4 sm:mb-5 space-y-4 sm:space-y-5 pr-2 xs:pr-3 custom-scrollbar">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            mentorId={msg.mentorId || mentor.id}
            mentorGender={mentor.gender} 
            speak={speak}
            cancelTTS={cancelTTS}
            isTTSSpeaking={isTTSSpeaking && ttsSpeakingMessageId === msg.id}
            ttsSpeakingMessageId={ttsSpeakingMessageId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && (
         <div className="bg-red-600/25 border border-red-500/60 text-red-200 p-4 sm:p-4 mb-4 sm:mb-4 rounded-lg text-base sm:text-lg shadow-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Options Bar */}
      <div className="flex flex-col xs:flex-row items-center justify-between mb-3 sm:mb-4 space-y-3 xs:space-y-0 xs:flex-wrap gap-3">
        <div className="flex items-center w-full xs:w-auto">
          <SpeakerWaveIcon className="w-5 h-5 mr-2 text-neutral-400 flex-shrink-0" />
          <select
            value={selectedTTSVoiceURI || "auto"}
            onChange={handleVoiceChange}
            disabled={availableTTSVoices.length === 0 || isInteractiveVoiceModeActive}
            className="form-select text-sm text-neutral-200 bg-neutral-800/70 border-2 border-neutral-600/80 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full xs:w-auto max-w-[150px] xs:max-w-[200px] truncate disabled:opacity-50 transition-colors"
            aria-label="Select text-to-speech voice"
            title="Select text-to-speech voice"
          >
            <option value="auto">Default Voice</option>
            {availableTTSVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {`${voice.name.substring(0,20)}... (${voice.lang})`}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center text-sm text-neutral-200 cursor-pointer w-full xs:w-auto py-1.5">
          <input
            type="checkbox"
            checked={isTTSAutoplayEnabled}
            onChange={toggleTTSAutoplay}
            disabled={isInteractiveVoiceModeActive}
            className="form-checkbox mr-2.5 text-sky-500 bg-neutral-800 border-neutral-600 rounded focus:ring-sky-400 focus:ring-offset-0 disabled:opacity-50"
          />
          <span>Autoplay AI responses</span>
        </label>
        
        <button
            onClick={toggleInteractiveVoiceMode}
            className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 border-2 w-full xs:w-auto justify-center group transform active:animate-button-press-anim
                        ${isInteractiveVoiceModeActive 
                            ? 'bg-sky-500 hover:bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-500/30' 
                            : 'bg-neutral-700/80 hover:bg-neutral-600/90 text-neutral-200 hover:text-sky-200 border-neutral-600 hover:border-sky-500/70'}`}
            aria-label={isInteractiveVoiceModeActive ? "Stop Interactive Voice" : "Start Interactive Voice"}
            title={isInteractiveVoiceModeActive ? "Stop Interactive Voice" : "Start Interactive Voice"}
            disabled={isLoading || isProcessingAudio}
        >
            <RobotIcon className={`w-5 h-5 mr-2 group-hover:scale-110 transition-transform ${isInteractiveVoiceModeActive ? "animate-pulse-fast text-sky-100" : "text-sky-400 group-hover:text-sky-300"}`} />
            {isInteractiveVoiceModeActive ? "Voice Active" : "Interactive Voice"}
        </button>

        <button
            onClick={() => {
              if (isTTSSpeaking) cancelTTS();
              handleClearChatHistory();
            }}
            className="flex items-center px-4 py-2.5 text-sm text-neutral-300 hover:text-red-300 bg-neutral-700/80 hover:bg-neutral-600/90 rounded-lg transition-colors duration-150 border-2 border-neutral-600 hover:border-red-500/70 w-full xs:w-auto justify-center group transform active:animate-button-press-anim"
            aria-label="Clear chat history for this mentor"
            title="Clear chat history"
            disabled={isLoading || isRecording || isProcessingAudio || isInteractiveVoiceModeActive}
        >
            <TrashIcon className="w-5 h-5 mr-1.5 group-hover:text-red-400 transition-colors" />
            Clear Chat
        </button>
      </div>
       <span className="text-xs text-neutral-500 mb-3 sm:mb-4 text-center sm:text-left">
          Chat history is saved locally. Files are processed for this message only.
      </span>


      {selectedFile && !isInteractiveVoiceModeActive && (
        <div className="mb-3 sm:mb-4 p-3 bg-neutral-700/80 rounded-lg flex items-center justify-between text-neutral-100 text-base border-2 border-neutral-600/90 shadow-md">
          <div className="flex items-center overflow-hidden">
            <PaperclipIcon className="w-5 h-5 mr-2 flex-shrink-0 text-sky-300" />
            <span className="truncate font-medium" title={selectedFile.name}>{selectedFile.name}</span>
            <span className="ml-2 text-neutral-400 text-sm whitespace-nowrap">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button 
            onClick={clearSelectedFile} 
            className="p-1.5 rounded-full hover:bg-neutral-600/70 transition-colors active:animate-button-press-anim"
            aria-label="Remove selected file"
            disabled={isLoading || isRecording || isProcessingAudio}
          >
            <XCircleIcon className="w-5 h-5 text-neutral-400 hover:text-red-400 transition-colors"/>
          </button>
        </div>
      )}

      <form onSubmit={onFormSubmit} className="flex items-center border-t-2 border-white/10 pt-5 sm:pt-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp, image/gif, text/plain, text/markdown, application/json, text/csv, .js, .py, .html, .css, application/pdf"
          disabled={isInteractiveVoiceModeActive}
        />
        <button
          type="button"
          onClick={handlePaperclipClick}
          className="mr-2 sm:mr-3 p-3.5 sm:p-4 bg-neutral-700/70 text-sky-300 rounded-xl sm:rounded-[1rem] hover:bg-neutral-600/90 focus:outline-none focus:ring-2 focus:ring-sky-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 border-2 border-neutral-600/90 active:animate-button-press-anim shadow-sm hover:shadow-md"
          disabled={isLoading || isRecording || isProcessingAudio || isInteractiveVoiceModeActive}
          aria-label="Attach file"
        >
          <PaperclipIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
        <button
          type="button"
          onClick={handleMicClick}
          className={`mr-2 sm:mr-3 p-3.5 sm:p-4 rounded-xl sm:rounded-[1rem] focus:outline-none focus:ring-2 focus:ring-sky-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 border-2 active:animate-button-press-anim shadow-sm hover:shadow-md
            ${isRecording ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-500/60 animate-border-pulse' : 'bg-neutral-700/70 hover:bg-neutral-600/90 text-sky-300 border-neutral-600/90'}
            ${isInteractiveVoiceModeActive ? 'opacity-40 cursor-not-allowed !bg-neutral-700/50 !border-neutral-600/70 !text-neutral-500' : ''} `} 
          disabled={isLoading || isProcessingAudio || isInteractiveVoiceModeActive} 
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          <MicrophoneIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={ isInteractiveVoiceModeActive ? "Interactive voice mode active..." : (isRecording ? "Listening..." : (isProcessingAudio ? "Processing audio..." : `Message ${mentor.name}...`))}
          className="flex-1 p-4 sm:p-5 text-xl sm:text-2xl bg-neutral-800/70 border-2 border-neutral-600/80 rounded-xl sm:rounded-[1rem] focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner focus:animate-breathing-glow disabled:bg-neutral-800/50 disabled:placeholder-neutral-600"
          disabled={isLoading || isRecording || isProcessingAudio || isInteractiveVoiceModeActive}
        />
        <button
          type="submit"
          className="ml-3 sm:ml-4 p-4 sm:p-5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl sm:rounded-[1rem] focus:outline-none focus:ring-3 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-sky-500/40 border-2 border-sky-500/70 transform hover:scale-105 active:scale-100 active:animate-button-press-anim"
          disabled={!canSendMessage || isRecording || isInteractiveVoiceModeActive} 
          aria-label={isLoading ? "Sending message" : "Send message"}
        >
          {isLoading || isProcessingAudio ? (
            <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8 animate-smooth-spin" />
          ) : (
            <SendIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          )}
        </button>
      </form>
    </div>
  );
};