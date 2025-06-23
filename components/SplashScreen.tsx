import React, { useState, FormEvent, useCallback } from 'react';
import { BrainIcon } from './icons/BrainIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { UserCircleIcon } from './icons/UserCircleIcon'; 
import type { SplashScreenData } from '../App'; 
import { LearningStyle } from '../types';

interface SplashScreenProps {
  onEnterApp: (data: SplashScreenData) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnterApp }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>(''); 
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(LearningStyle.VISUAL);
  const [initialSkillLevel, setInitialSkillLevel] = useState<number>(1);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    onEnterApp({
      name,
      gender,
      learningStyle,
      initialSkillLevel,
    });
  }, [name, gender, learningStyle, initialSkillLevel, onEnterApp]);

  const learningStyleOptions = Object.values(LearningStyle);
  const skillLevelOptions = [
    { value: 1, label: 'Beginner (Just starting)' },
    { value: 2, label: 'Novice (Some basic knowledge)' },
    { value: 3, label: 'Intermediate (Comfortable with fundamentals)' },
    { value: 4, label: 'Advanced (Solid understanding)' },
    { value: 5, label: 'Expert (Deep knowledge)' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-950 p-4 sm:p-6 md:p-8 text-white font-sans overflow-y-auto">
      <form 
        onSubmit={handleSubmit} 
        className="relative w-full max-w-xl xs:max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl xs:rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center overflow-hidden bg-futuristic-grid my-8"
      >
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-sky-500/10 rounded-full filter blur-3xl opacity-60 animate-pulse-fast"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 rounded-full filter blur-3xl opacity-60 animate-pulse-fast animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <BrainIcon className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mb-6 sm:mb-8 text-sky-400 filter drop-shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-subtle-pulse" />

          <h1 className="text-5xl xs:text-6xl sm:text-7xl md:text-[6rem] font-bold font-display mb-4 sm:mb-5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 shimmer-text">
              RoboVAI Labs
            </span>
          </h1>

          <p className="text-xl xs:text-2xl sm:text-3xl md:text-4xl text-neutral-300 mb-6 sm:mb-8 font-display text-shadow-sm-light">
            Your Gateway to Intelligent Learning
          </p>
          <p className="text-lg xs:text-lg sm:text-xl text-neutral-400 mb-8 sm:mb-10 max-w-md sm:max-w-lg md:max-w-xl">
            Personalize your journey to unlock your potential.
          </p>

          <div className="mb-8 sm:mb-10">
            <UserCircleIcon className="w-24 h-24 sm:w-28 sm:h-28 text-sky-300/70 p-3 bg-sky-500/10 rounded-full border-2 border-sky-500/30" />
            <p className="text-neutral-400 text-sm mt-2">Default User Icon</p>
          </div>


          {/* Form Fields */}
          <div className="w-full max-w-lg md:max-w-xl space-y-6 sm:space-y-8 text-left mb-10 sm:mb-12">
            <div>
              <label htmlFor="userName" className="block text-lg sm:text-xl font-medium text-neutral-200 mb-2.5 sm:mb-3">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="userName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full p-4 sm:p-5 text-lg sm:text-xl bg-neutral-800/70 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner focus:animate-breathing-glow"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-lg sm:text-xl font-medium text-neutral-200 mb-2.5 sm:mb-3">
                Gender (Optional)
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                className="form-select w-full p-4 sm:p-5 text-lg sm:text-xl bg-neutral-800/70 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner"
              >
                <option value="">Select Gender (Optional)</option>
                <option value="male">Male (ذكر)</option>
                <option value="female">Female (أنثى)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="learningStyle" className="block text-lg sm:text-xl font-medium text-neutral-200 mb-2.5 sm:mb-3">
                Preferred Learning Style
              </label>
              <select
                id="learningStyle"
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value as LearningStyle)}
                className="form-select w-full p-4 sm:p-5 text-lg sm:text-xl bg-neutral-800/70 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner"
              >
                {learningStyleOptions.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="initialSkillLevel" className="block text-lg sm:text-xl font-medium text-neutral-200 mb-2.5 sm:mb-3">
                Initial Skill Level (General)
              </label>
              <select
                id="initialSkillLevel"
                value={initialSkillLevel}
                onChange={(e) => setInitialSkillLevel(parseInt(e.target.value))}
                className="form-select w-full p-4 sm:p-5 text-lg sm:text-xl bg-neutral-800/70 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner"
              >
                {skillLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="group relative inline-flex items-center justify-center px-10 py-5 sm:px-12 md:px-14 sm:py-6 md:py-7 text-lg xs:text-xl sm:text-2xl font-medium text-white bg-sky-600/80 rounded-xl sm:rounded-2xl border-2 border-sky-500/50 shadow-lg
                       hover:bg-sky-500/90 hover:shadow-sky-400/50 focus:outline-none focus:ring-4 focus:ring-sky-500/60 focus:ring-opacity-70
                       transition-all duration-300 ease-in-out transform hover:scale-105 md:hover:scale-110 active:scale-100 active:animate-button-press-anim overflow-hidden animate-futuristic-glow hover:animate-none
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:bg-sky-600/70 disabled:hover:shadow-lg"
            aria-label="Start Smart Learning"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-sky-500/15 to-cyan-600/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
            <RocketLaunchIcon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 mr-2.5 sm:mr-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
            <span className="relative z-10">Start Smart Learning</span>
          </button>
        </div>
      </form>
      <footer className="relative bottom-4 xs:bottom-6 text-center w-full text-neutral-500 text-sm sm:text-base mt-auto pb-4">
        <p>&copy; {new Date().getFullYear()} RoboVAI Labs. All rights reserved.</p>
      </footer>
    </div>
  );
};