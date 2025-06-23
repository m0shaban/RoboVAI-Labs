
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Mentor } from '../types';

interface TTSHook {
  speak: (messageId: string, text: string, lang: string, mentorGender?: Mentor['gender']) => Promise<void>; // Returns Promise
  cancel: () => void;
  isSpeaking: boolean;
  speakingMessageId: string | null;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  setSelectedVoice: (voiceURI: string | null) => void;
}

export const useTTS = (): TTSHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        if (synthRef.current) {
          const voices = synthRef.current.getVoices();
          const localVoices = voices.filter(voice => voice.localService);
          setAvailableVoices(localVoices.length > 0 ? localVoices : voices);
        }
      };

      loadVoices();
      if (synthRef.current && synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }

    } else {
      console.warn('Text-to-Speech not supported by this browser.');
    }

    return () => {
      if (synthRef.current) {
        if (synthRef.current.speaking) {
          synthRef.current.cancel();
        }
        synthRef.current.onvoiceschanged = null;
      }
      // utteranceRef.current is managed per speak call, its listeners are cleaned up there.
    };
  }, []);


  const cancel = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel(); 
      // The onend/onerror of the cancelled utterance will handle state and promise.
    } else {
      // If not speaking, but state might be stale ensure it's clean.
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  }, []);

  const setSelectedVoice = useCallback((voiceURI: string | null) => {
    setSelectedVoiceURI(voiceURI);
  }, []);

  const speak = useCallback((messageId: string, text: string, lang: string, mentorGender?: Mentor['gender']): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current || !text.trim()) {
        // Ensure state is clean if we bail early, though cancel() should handle this.
        if (speakingMessageId === messageId || !synthRef.current?.speaking) {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
        }
        resolve(); 
        return;
      }

      // Cancel any ongoing speech before starting a new one.
      // The onend/onerror of the cancelled utterance will fire and manage its promise & state.
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      
      const cleanedText = text
        .replace(/\*\*(.*?)\*\*/g, '$1') 
        .replace(/\*(.*?)\*/g, '$1')   
        .replace(/```[\s\S]*?```/g, '(Code block)') 
        .replace(/\[TOOL:.*?\]/gi, '') 
        .replace(/\[PROMPT_FOR_PIXEL_ART:.*?\]/gi, '')
        .replace(/\[QUEST:.*?\]/gi, '(New quest assigned)')
        .replace(/\[POINTS:.*?\]/gi, '')
        .replace(/<[^>]*>/g, '') 
        .trim();

      if (!cleanedText) {
          if (speakingMessageId === messageId || !synthRef.current?.speaking) {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
          }
          resolve(); 
          return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance; 
      utterance.lang = lang;

      let voiceToUse: SpeechSynthesisVoice | undefined = undefined;
      if (selectedVoiceURI) {
        voiceToUse = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      }
      if (!voiceToUse) {
        const languageVoices = availableVoices.filter(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
        if (mentorGender && languageVoices.length > 0) {
          const genderVoices = languageVoices.filter(v => {
            const nameLower = v.name.toLowerCase();
            if (mentorGender === 'female') return nameLower.includes('female') || nameLower.includes('woman') || nameLower.includes('girl') || nameLower.includes('zira') || nameLower.includes('eva');
            if (mentorGender === 'male') return nameLower.includes('male') || nameLower.includes('man') || nameLower.includes('boy') || nameLower.includes('david') || nameLower.includes('mark');
            return false; 
          });
          if (genderVoices.length > 0) voiceToUse = genderVoices.find(v => v.localService) || genderVoices[0];
        }
        if (!voiceToUse && languageVoices.length > 0) voiceToUse = languageVoices.find(v => v.default) || languageVoices.find(v => v.localService) || languageVoices[0];
      }
      if (!voiceToUse && (lang === 'ar-SA' || lang === 'ar')) voiceToUse = availableVoices.find(v => v.lang.startsWith('ar'));
      
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      } else {
        if (availableVoices.length > 0) console.warn(`TTS: No specific voice for lang: ${lang}, gender: ${mentorGender}. Using browser default. Selected URI: ${selectedVoiceURI}`);
        else console.warn(`TTS: Voice list not populated. Using browser default for ${lang}.`);
      }
      
      const cleanupAndResolve = () => {
        // Only update global speaking state if this messageId was the one designated as speaking.
        if (speakingMessageId === messageId) {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
        }
        // Detach listeners from this specific utterance
        utterance.onend = null;
        utterance.onerror = null;
        resolve();
      };

      const cleanupAndReject = (errorDetails: any) => {
         // Only update global speaking state if this messageId was the one designated as speaking.
        if (speakingMessageId === messageId) {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
        }
        // Detach listeners from this specific utterance
        utterance.onend = null;
        utterance.onerror = null;
        reject(errorDetails);
      };

      utterance.onend = cleanupAndResolve;

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        const specificError = event.error || "unknown TTS error";
        if (specificError === 'interrupted') {
          console.info(`TTS: Speech for message ID '${messageId}' was interrupted. This is often normal when starting new speech.`);
        } else {
          console.error(`TTS: Speech synthesis error for message ID '${messageId}'. Error: ${specificError}`);
        }
        cleanupAndReject(specificError); 
      };
      
      // Set global state to indicate this new speech is starting
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
      synthRef.current.speak(utterance);
    });
  }, [availableVoices, selectedVoiceURI, speakingMessageId]); // speakingMessageId dependency for correct state cleanup logic

  return { 
    speak, 
    cancel, 
    isSpeaking, 
    speakingMessageId,
    availableVoices,
    selectedVoiceURI,
    setSelectedVoice
  };
};
