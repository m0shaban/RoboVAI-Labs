import React from 'react';
import { RobotIcon } from './icons/RobotIcon';
import { SparklesIcon } from './icons/SparklesIcon'; 
import { XCircleIcon } from './icons/XCircleIcon'; 
import { ArrowRightCircleIcon } from './icons/ArrowRightCircleIcon'; 

export type AvatarState = 'idle' | 'listening' | 'userProcessing' | 'aiProcessing' | 'speaking';

interface InteractiveAvatarPanelProps {
  avatarState: AvatarState;
  onExit: () => void;
  onForceStopListening?: () => void; 
}

export const InteractiveAvatarPanel: React.FC<InteractiveAvatarPanelProps> = ({ avatarState, onExit, onForceStopListening }) => {
  let statusText = "Initializing...";
  let robotIsListening = false;
  let robotIsSpeaking = false;

  switch (avatarState) {
    case 'idle':
      statusText = "Ready for voice interaction.";
      break;
    case 'listening':
      statusText = "Listening...";
      robotIsListening = true;
      break;
    case 'userProcessing':
      statusText = "Processing your audio...";
      break;
    case 'aiProcessing':
      statusText = "Mentor is thinking...";
      break;
    case 'speaking':
      statusText = "Mentor is speaking...";
      robotIsSpeaking = true;
      break;
  }

  const isProcessing = avatarState === 'userProcessing' || avatarState === 'aiProcessing';

  return (
    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-40 p-4 xs:p-6 text-neutral-100 animate-fadeInSlideUp">
      <div className="relative bg-gradient-to-br from-neutral-800/85 via-neutral-900/75 to-neutral-800/85 border-2 border-sky-500/50 shadow-2xl shadow-sky-500/25 rounded-[2rem] p-6 xs:p-10 sm:p-12 md:p-14 w-full max-w-lg sm:max-w-xl text-center">
        <button
          onClick={onExit}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 text-neutral-400 hover:text-sky-300 transition-colors duration-150 rounded-full hover:bg-sky-500/20 active:animate-button-press-anim"
          aria-label="Exit Interactive Voice Mode"
        >
          <XCircleIcon className="w-8 h-8 sm:w-9 sm:h-9" />
        </button>
        
        <div className={`mb-6 sm:mb-8 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center bg-sky-600/25 border-2 border-sky-500/70 shadow-xl`}>
          {isProcessing ? (
            <SparklesIcon className={`w-20 h-20 sm:w-24 sm:h-24 text-sky-300 animate-smooth-spin`} />
          ) : (
            <RobotIcon 
              className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-sky-200 transition-all duration-300`} 
              isListening={robotIsListening}
              isSpeaking={robotIsSpeaking}
            />
          )}
        </div>
        
        <p className="text-2xl sm:text-3xl md:text-4xl font-medium text-sky-100 mb-3 sm:mb-4 min-h-[2.8em] sm:min-h-[3em] flex items-center justify-center">
            {statusText}
        </p>
        
        {avatarState === 'listening' && (
          <>
            <div className="flex justify-center items-center space-x-2 my-4 sm:my-5 h-8"> 
              {[0.8, 1.3, 0.7, 1.2, 0.9, 1.4, 0.8].map((scale, i) => (
                <span 
                  key={i}
                  className="w-2 h-2 bg-sky-400 rounded-full animate-pulse-fast" 
                  style={{ animationDelay: `${i * 0.08}s`, transform: `scaleY(${scale}) translateY(${ (1-scale) * 3 }px)` }}
                ></span>
              ))}
            </div>
            {onForceStopListening && (
              <button
                onClick={onForceStopListening}
                className="mt-5 sm:mt-7 group flex items-center justify-center w-full max-w-xs mx-auto px-7 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-500 hover:from-sky-600 hover:via-cyan-600 hover:to-sky-600 text-white rounded-xl text-lg sm:text-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-sky-500/40 border-2 border-sky-400/80 transform active:scale-95 active:animate-button-press-anim"
                aria-label="Process my speech"
              >
                <ArrowRightCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                Process My Speech
              </button>
            )}
          </>
        )}
         {avatarState === 'speaking' && (
          <div className="flex justify-center items-end space-x-1.5 my-4 sm:my-5 h-10"> 
            {[0.6, 1, 0.7, 1.2, 0.8, 1.1, 0.7, 1.3, 0.9].map((h, i) => (
              <span 
                key={i}
                className="w-1.5 bg-sky-300 rounded-full animate-breathing-glow" 
                style={{ 
                  height: `${h*1.5}rem`, 
                  animationDuration: `${0.6 + i*0.04}s`,
                  animationDelay: `${i*0.04}s` 
                }}
              ></span>
            ))}
          </div>
        )}

        <p className="text-sm sm:text-base text-neutral-400 mt-5 sm:mt-6">
          {avatarState === 'listening' ? "Click 'Process My Speech' or pause to send." : avatarState === 'speaking' ? "Mentor is responding..." : "The AI is interacting."} 
        </p>
      </div>
    </div>
  );
};