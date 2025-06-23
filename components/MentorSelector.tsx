
import React from 'react';
import type { Mentor } from '../types';
import { BrainIcon } from './icons/BrainIcon';
import { CyberProfileIcon } from './icons/CyberProfileIcon'; 
import { InterfaceConfigIcon } from './icons/InterfaceConfigIcon'; 
import { CodeIcon } from './icons/CodeIcon';
import { BookIcon } from './icons/BookIcon';
import { StarIcon } from './icons/StarIcon';
import { AtomIcon } from './icons/AtomIcon';
import { FlaskIcon } from './icons/FlaskIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { QuillIcon } from './icons/QuillIcon';
import { ScrollIcon } from './icons/ScrollIcon';
import { DnaIcon } from './icons/DnaIcon';
import { MathIcon } from './icons/MathIcon';
import { ChatBubbleThoughtIcon } from './icons/ChatBubbleThoughtIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CircuitBoardIcon } from './icons/CircuitBoardIcon';
import { TelescopeIcon } from './icons/TelescopeIcon';
import { EyeIcon } from './icons/EyeIcon';
// RoboCubIcon removed

interface MentorSelectorProps {
  mentors: Mentor[];
  selectedMentor?: Mentor;
  onSelectMentor: (mentor: Mentor) => void;
  onShowDashboard: () => void;
  onShowAssessment: () => void;
  activeView: string;
}

export const getMentorIconComponent = (mentorId: string): React.FC<React.SVGProps<SVGSVGElement>> => {
  switch (mentorId) {
    // case 'codey-the-cub' removed
    case 'ada-lovelace':
      return CodeIcon;
    // case 'arabic-tutor': // Removed
    //   return BookIcon;
    case 'cosmo-navigator':
      return StarIcon;
    case 'albert-insight':
      return AtomIcon;
    case 'maria-query':
      return FlaskIcon;
    case 'leo-artificer':
      return LightbulbIcon;
    case 'william-shakesword':
      return QuillIcon;
    case 'cleo-chronicle':
      return ScrollIcon;
    case 'dr-darwin-gene':
      return DnaIcon;
    case 'pythagoras-ratio':
    case 'al-khwarizmi':
      return MathIcon;
    case 'socrates-ponder':
      return ChatBubbleThoughtIcon;
    case 'amadeus-melody':
      return MusicNoteIcon;
    case 'adam-wealth':
      return ChartBarIcon;
    case 'alan-turing-enigma':
      return CircuitBoardIcon;
    case 'stella-gazer':
      return TelescopeIcon;
    case 'al-biruni': 
      return BrainIcon; 
    case 'ibn-sina': 
      return BookIcon; 
    case 'ibn-al-haytham':
      return EyeIcon;
    case 'jabir-ibn-hayyan':
      return FlaskIcon;
    default:
      return BrainIcon;
  }
};

export const MentorSelector: React.FC<MentorSelectorProps> = ({
  mentors,
  selectedMentor,
  onSelectMentor,
  onShowDashboard,
  onShowAssessment,
  activeView
}) => {

  return (
    <aside className="w-[28rem] xs:w-[32rem] sm:w-[36rem] md:w-[42rem] bg-neutral-900/50 backdrop-blur-xl border-r border-white/10 text-neutral-100 p-8 sm:p-10 md:p-12 flex flex-col h-full shadow-2xl">
      <div>
        <div className="flex items-center mb-10 sm:mb-12 md:mb-14">
          <BrainIcon className="w-14 h-14 sm:w-16 md:w-20 text-sky-400 mr-5 sm:mr-6 filter drop-shadow-[0_0_10px_rgba(56,189,248,0.4)] animate-data-pulse flex-shrink-0" />
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-400">Mentors</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 sm:pr-5 -mr-4 sm:-mr-5 mb-8 md:mb-12">
        <nav className="space-y-4 sm:space-y-5">
          {mentors.map((mentor) => {
            const IconComponent = getMentorIconComponent(mentor.id);
            return (
              <button
                key={mentor.id}
                onClick={() => onSelectMentor(mentor)}
                className={`flex items-center w-full p-5 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl text-left transition-all duration-200 group transform hover:scale-[1.02] scanline-hover-effect
                  ${selectedMentor?.id === mentor.id && activeView === 'chat'
                    ? 'bg-sky-600/70 text-white shadow-lg border-2 border-sky-500/50 backdrop-blur-sm animate-breathing-glow'
                    : 'bg-neutral-800/40 hover:bg-neutral-700/60 text-neutral-200 hover:text-white border-2 border-transparent hover:border-neutral-600/50'
                  }`}
                aria-pressed={selectedMentor?.id === mentor.id && activeView === 'chat'}
                aria-label={`Select mentor: ${mentor.name}, specializing in ${mentor.specialization}`}
              >
                <IconComponent 
                  className={`w-16 h-16 sm:w-18 md:w-20 p-3 text-neutral-300 bg-neutral-700/50 rounded-full mr-5 sm:mr-6 flex-shrink-0 border-4 transition-all duration-300 
                    ${selectedMentor?.id === mentor.id && activeView === 'chat' 
                      ? 'border-sky-300 ring-4 sm:ring-5 ring-sky-400 shadow-md text-sky-200 bg-sky-500/30' 
                      : 'border-neutral-600/50 group-hover:border-sky-500/70 group-hover:ring-2 group-hover:ring-sky-500/50 group-hover:text-sky-300'
                    }`}
                />
                <div className="overflow-hidden">
                  <span className="font-semibold block text-lg sm:text-xl md:text-2xl truncate">{mentor.name}</span>
                  <span className="text-base sm:text-lg text-neutral-400 block group-hover:text-neutral-300 transition-colors truncate">
                    {mentor.specialization}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-8 md:pt-12 border-t border-white/10">
         <h3 className="text-lg font-semibold text-neutral-500 uppercase tracking-wider mb-6 md:mb-8">Tools & Profile</h3>
         <nav className="space-y-4 sm:space-y-5">
            <button
              onClick={onShowDashboard}
              className={`flex items-center w-full p-5 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl text-left transition-all duration-200 group transform hover:scale-[1.02] scanline-hover-effect
                ${activeView === 'dashboard'
                  ? 'bg-sky-600/70 text-white shadow-lg border-2 border-sky-500/50 backdrop-blur-sm animate-breathing-glow'
                  : 'bg-neutral-800/40 hover:bg-neutral-700/60 text-neutral-200 hover:text-white border-2 border-transparent hover:border-neutral-600/50'
                }`}
              aria-pressed={activeView === 'dashboard'}
              aria-label="Show my dashboard"
            >
              <CyberProfileIcon className="w-10 h-10 sm:w-11 sm:h-11 mr-5 sm:mr-6 flex-shrink-0 text-sky-400 group-hover:text-sky-300 transition-colors" />
              <span className="font-medium text-lg sm:text-xl">My Dashboard</span>
            </button>
            <button
              onClick={onShowAssessment}
              className="flex items-center w-full p-5 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl text-left transition-all duration-200 group transform hover:scale-[1.02] scanline-hover-effect bg-neutral-800/40 hover:bg-neutral-700/60 text-neutral-200 hover:text-white border-2 border-transparent hover:border-neutral-600/50"
              aria-label="Open learning profile assessment"
            >
              <InterfaceConfigIcon className="w-10 h-10 sm:w-11 sm:h-11 mr-5 sm:mr-6 flex-shrink-0 text-sky-400 group-hover:text-sky-300 transition-colors" />
              <span className="font-medium text-lg sm:text-xl">Learning Profile</span>
            </button>
         </nav>
      </div>
    </aside>
  );
};
