import React, { useState, useEffect } from 'react';
import { LearningStyle } from '../types';
import { BrainIcon } from './icons/BrainIcon';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; skillLevel: number; learningStyle: LearningStyle }) => void;
  currentSubject: string;
  currentProfileName?: string | null; 
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({ isOpen, onClose, onSubmit, currentSubject, currentProfileName }) => {
  const [userName, setUserName] = useState('');
  const [skillLevel, setSkillLevel] = useState<number>(1);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(LearningStyle.VISUAL);

  useEffect(() => {
    if (isOpen && currentProfileName) {
      setUserName(currentProfileName);
    } else if (isOpen && !currentProfileName) {
      setUserName(''); 
    }
    setSkillLevel(1); 
    setLearningStyle(LearningStyle.VISUAL);
  }, [isOpen, currentProfileName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: userName.trim() || "Learner", skillLevel, learningStyle });
  };

  const learningStyleOptions = Object.values(LearningStyle);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 z-50 transition-opacity duration-300 ease-in-out animate-modal-fade-in">
      <div className="bg-neutral-800/80 backdrop-blur-xl border-2 border-white/15 p-8 xs:p-10 sm:p-12 md:p-14 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl transform transition-all duration-300 ease-in-out scale-100 text-neutral-100">
        <div className="flex items-center mb-7 sm:mb-9">
          <BrainIcon className="w-12 h-12 sm:w-14 md:w-16 text-sky-400 mr-4 sm:mr-5 filter drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-400 font-display">Personalize Your Learning</h2>
        </div>
        <p className="text-neutral-300 mb-8 sm:mb-10 text-lg sm:text-xl md:text-2xl">
          Help us tailor your experience. This allows your AI mentors to better adapt to your needs.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div>
            <label htmlFor="userNameModal" className="block text-lg sm:text-xl font-medium text-neutral-200 mb-2.5 sm:mb-3">
              Your Name:
            </label>
            <input
              type="text"
              id="userNameModal"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-4 sm:p-5 text-lg sm:text-xl bg-neutral-700/60 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner focus:animate-breathing-glow"
            />
          </div>
          <div>
            <label htmlFor="skillLevelModal" className="block text-lg sm:text-xl font-medium text-neutral-200 mb-2.5 sm:mb-3">
              Experience in <strong className="text-sky-400">{currentSubject}</strong>:
            </label>
            <select
              id="skillLevelModal"
              value={skillLevel}
              onChange={(e) => setSkillLevel(parseInt(e.target.value))}
              className="form-select w-full p-4 sm:p-5 text-lg sm:text-xl bg-neutral-700/60 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner"
            >
              <option value={1}>Beginner (Just starting)</option>
              <option value={2}>Novice (Some basic knowledge)</option>
              <option value={3}>Intermediate (Comfortable with fundamentals)</option>
              <option value={4}>Advanced (Solid understanding)</option>
              <option value={5}>Expert (Deep knowledge)</option>
            </select>
          </div>
          <div>
            <label className="block text-lg sm:text-xl font-medium text-neutral-200 mb-3 sm:mb-4">Preferred learning style:</label>
            <div className="space-y-4 sm:space-y-5">
              {learningStyleOptions.map((style) => (
                <label key={style} className="flex items-center p-4 sm:p-5 bg-neutral-700/40 border-2 border-neutral-600/60 rounded-lg hover:bg-neutral-700/60 transition-colors cursor-pointer has-[:checked]:bg-sky-600/30 has-[:checked]:border-sky-500/50">
                  <input
                    type="radio"
                    name="learningStyle"
                    value={style}
                    checked={learningStyle === style}
                    onChange={() => setLearningStyle(style)}
                    className="form-checkbox h-5 w-5 sm:h-6 sm:h-6 text-sky-500 border-neutral-500 focus:ring-sky-400 bg-neutral-700/80"
                  />
                  <span className="ml-4 sm:ml-5 text-lg sm:text-xl text-neutral-200">{style}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col xs:flex-row justify-end space-y-4 xs:space-y-0 xs:space-x-5 sm:space-x-6 pt-5 sm:pt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full xs:w-auto px-7 sm:px-9 py-3.5 sm:py-4 text-lg sm:text-xl font-medium text-neutral-300 bg-neutral-700/70 hover:bg-neutral-600/90 rounded-lg focus:outline-none focus:ring-3 focus:ring-neutral-500/80 transition-colors border-2 border-neutral-600/90 active:animate-button-press-anim"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="w-full xs:w-auto px-7 sm:px-9 py-3.5 sm:py-4 text-lg sm:text-xl font-medium text-white bg-sky-600/90 hover:bg-sky-500 rounded-lg focus:outline-none focus:ring-3 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-neutral-800/80 transition-colors border-2 border-sky-500/80 shadow-md hover:shadow-sky-500/40 active:animate-button-press-anim"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
