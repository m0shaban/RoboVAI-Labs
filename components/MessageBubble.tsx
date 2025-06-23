import React from 'react';
import type { ChatMessage, Mentor, ChatMessageSource } from '../types'; // Added Mentor type
import { SenderType } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon'; 
import { getMentorIconComponent } from './MentorSelector';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon'; 
import { StopCircleIcon } from './icons/StopCircleIcon'; 
import { LinkIcon } from './icons/LinkIcon';

interface MessageBubbleProps {
  message: ChatMessage;
  mentorId?: string; 
  mentorGender?: Mentor['gender']; 
  speak: (messageId: string, text: string, lang: string, mentorGender?: Mentor['gender']) => void;
  cancelTTS: () => void;
  isTTSSpeaking: boolean; 
  ttsSpeakingMessageId: string | null; 
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  mentorId,
  mentorGender, 
  speak,
  cancelTTS,
  isTTSSpeaking,
  ttsSpeakingMessageId
 }) => {
  const isUser = message.sender === SenderType.USER;
  const isAI = message.sender === SenderType.AI;

  const bubbleBaseClasses = 'p-4 sm:p-5 rounded-[1.25rem] shadow-lg backdrop-blur-lg border text-xl sm:text-2xl'; // Increased base text and radius
  const aiBubbleClasses = `${bubbleBaseClasses} bg-sky-600/20 border-sky-500/30 text-neutral-100 self-start rounded-tl-none max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl`; 
  const userBubbleClasses = `${bubbleBaseClasses} bg-indigo-600/30 border-indigo-500/30 text-white self-end rounded-tr-none max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl`; 
  const systemBubbleClasses = 'bg-neutral-700/70 border-neutral-600/50 text-neutral-300 self-center text-lg italic rounded-xl p-3.5 shadow-md backdrop-blur-sm'; // Increased base text
  
  const bubbleClasses = isUser ? userBubbleClasses : isAI ? aiBubbleClasses : systemBubbleClasses;
  const alignClasses = isUser ? 'items-end' : 'items-start';
  
  const entryAnimationClass = "animate-bubble-fade-in-slide-up"; // Using animation defined in index.html via Tailwind config

  const cleanTextForTTS = (text: string) => {
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

  const handleTTSToggle = () => {
    if (isTTSSpeaking) {
      cancelTTS();
    } else {
      const lang = mentorId === 'william-shakesword' || mentorId === 'ada-lovelace' || mentorId === 'albert-insight' || mentorId === 'maria-query' || mentorId === 'leo-artificer' || mentorId === 'cleo-chronicle' || mentorId === 'dr-darwin-gene' || mentorId === 'pythagoras-ratio' || mentorId === 'socrates-ponder' || mentorId === 'amadeus-melody' || mentorId === 'adam-wealth' || mentorId === 'alan-turing-enigma' || mentorId === 'stella-gazer' ? 'en-US' : 'en-US';
      speak(message.id, cleanTextForTTS(message.text), lang, mentorGender);
    }
  };

  const formatText = (text: string) => {
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-sky-200">$1</strong>') 
      .replace(/\*(.*?)\*/g, '<em class="italic text-sky-300/90">$1</em>');
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    const textContainerClasses = `prose prose-xl prose-invert max-w-none`; // Increased prose size
    
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} className={textContainerClasses} />;
  };
  
  const renderTextWithCodeBlocks = (text: string) => {
    if (!text) return null; 
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const languageMatch = part.match(/^```(\w*)\n/);
        const language = languageMatch ? languageMatch[1] : '';
        const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
        return (
          <div key={index} className="my-3.5 rounded-lg overflow-hidden bg-neutral-900/80 border-2 border-sky-600/50 shadow-inner bg-futuristic-grid bg-opacity-50 backdrop-blur-sm">
            {language && (
              <div className="text-lg text-sky-300 bg-neutral-800/70 px-5 py-2.5 border-b-2 border-sky-600/50 font-mono">
                {language}
              </div>
            )}
            <pre className="p-5 overflow-x-auto text-lg sm:text-xl font-mono custom-scrollbar text-sky-100">
              <code className={`language-${language}`}>{code.trim()}</code>
            </pre>
          </div>
        );
      }
      const textElement = formatText(part);
      return textElement; 
    });
  };

  const MentorIcon = isAI && mentorId ? getMentorIconComponent(mentorId) : SparklesIcon;

  if (message.isLoading) {
    return (
       <div className={`flex ${alignClasses} space-x-4 sm:space-x-5 max-w-md sm:max-w-lg ${entryAnimationClass}`}>
        {isAI && <MentorIcon className="w-14 h-14 sm:w-16 sm:h-16 p-3 text-sky-300 bg-sky-500/30 rounded-full shadow-md border-2 border-sky-500/70 flex-shrink-0" />}
        <div className={`${aiBubbleClasses} flex items-center p-4 sm:p-5`}>
          <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8 text-sky-300 inline-block mr-3.5 animate-smooth-spin" />
          <span className={`text-lg sm:text-xl text-sky-200`}>Thinking...</span>
        </div>
      </div>
    );
  }
  
  if (message.isError) {
     const ErrorMentorIcon = isAI && mentorId ? getMentorIconComponent(mentorId) : SparklesIcon;
     return (
      <div className={`flex flex-col ${alignClasses} mb-3.5 ${entryAnimationClass}`}>
        <div className="flex items-center space-x-4 sm:space-x-5">
          {isAI && <ErrorMentorIcon className="w-14 h-14 sm:w-16 sm:h-16 p-3 text-red-300 bg-red-500/30 rounded-full shadow-md border-2 border-red-500/70 flex-shrink-0" />}
          <div className={`${bubbleClasses} bg-red-500/30 border-red-400/50 text-red-200 text-lg sm:text-xl`}>
             <ErrorMentorIcon className="w-7 h-7 sm:w-8 sm:h-8 inline-block mr-3.5 text-red-300" />
             {message.text}
          </div>
          {isUser && <UserIcon className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-3.5 bg-indigo-500/40 text-indigo-100 border-2 border-indigo-400/70 flex-shrink-0" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${alignClasses} mb-3.5 group ${entryAnimationClass}`}>
      <div className="flex items-end space-x-4 sm:space-x-5">
        {isAI && <MentorIcon className="w-14 h-14 sm:w-16 sm:h-16 p-3 text-sky-200 bg-sky-500/30 rounded-full shadow-md border-2 border-sky-500/70 flex-shrink-0 self-start mt-1.5" />}
        <div className={`${bubbleClasses} ${message.sender === SenderType.SYSTEM && message.image ? 'p-3 sm:p-3.5' : ''}`}>
          {renderTextWithCodeBlocks(message.text)}
          {message.image && ( 
            <div className="mt-3.5 p-2 sm:p-2.5 bg-black/40 rounded-lg border-2 border-sky-600/50">
              <img 
                src={message.image} 
                alt="Generated Art from AI" 
                className="max-w-full h-auto rounded object-contain max-h-64 sm:max-h-80 md:max-h-96"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const errorP = document.createElement('p');
                  errorP.textContent = 'Error loading AI image.';
                  errorP.className = 'text-red-400 text-sm italic p-2';
                  target.parentElement?.appendChild(errorP);
                }}
              />
            </div>
          )}
          {message.attachedFile && (
            <div className="mt-3.5 p-2.5 bg-black/40 rounded-lg border-2 border-indigo-600/50">
              {message.attachedFile.dataUrl ? (
                <img 
                  src={message.attachedFile.dataUrl} 
                  alt={`Uploaded: ${message.attachedFile.name}`}
                  className="max-w-full h-auto rounded object-contain max-h-64 sm:max-h-80 md:max-h-96"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorP = document.createElement('p');
                    errorP.textContent = 'Error loading uploaded image.';
                    errorP.className = 'text-red-400 text-sm italic p-2';
                    target.parentElement?.appendChild(errorP);
                  }}
                />
              ) : (
                <div className="flex items-center text-neutral-300">
                  <PaperclipIcon className="w-5 h-5 mr-2 text-indigo-300"/>
                  <span className="text-base sm:text-lg">{message.attachedFile.name} ({(message.attachedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}
           {isAI && message.sources && message.sources.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-sky-500/30">
              <h4 className="text-base font-semibold text-sky-200 mb-1.5">Sources:</h4>
              <ul className="space-y-1">
                {message.sources.map((source, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sky-300 hover:text-sky-100 hover:underline transition-colors break-all"
                      title={source.uri}
                    >
                      <LinkIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {isUser && <UserIcon className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-3.5 bg-indigo-500/40 text-indigo-100 border-2 border-indigo-400/70 flex-shrink-0 self-start mt-1.5" />}
      </div>
      <div className={`flex items-center mt-2.5 sm:mt-3 ${isUser ? 'justify-end mr-[4.75rem] sm:mr-[5.25rem]' : 'justify-start ml-[4.75rem] sm:ml-[5.25rem]'}`}> {/* Adjusted margin for icon size */}
        <p className={`text-base text-neutral-500 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {isAI && message.text && (
          <button
            onClick={handleTTSToggle}
            className={`p-2 rounded-full transition-colors duration-150 
                        ${isTTSSpeaking ? 'bg-sky-500/40 hover:bg-sky-500/60' : 'hover:bg-neutral-700/70'}`}
            aria-label={isTTSSpeaking ? 'Stop speech' : 'Play speech'}
            title={isTTSSpeaking ? 'Stop speech' : 'Play speech'}
          >
            {isTTSSpeaking ? (
              <StopCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-sky-300" />
            ) : (
              <SpeakerWaveIcon className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-400 hover:text-sky-300 transition-colors" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
export default MessageBubble;