
import React, { SVGProps } from 'react';
import type { UserProfile } from '../types';
import { BrainIcon } from './icons/BrainIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { QuillIcon } from './icons/QuillIcon';

interface UserDashboardProps {
  userProfile: UserProfile | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SVGProps<SVGSVGElement>>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-neutral-800/50 backdrop-blur-lg border-2 border-white/10 p-8 sm:p-12 rounded-xl shadow-xl hover:shadow-sky-500/20 transition-all duration-300 transform hover:-translate-y-1.5">
    <div className="flex items-center text-sky-400 mb-5 sm:mb-6">
      {React.cloneElement(icon, { className: "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" })}
      <h3 className="ml-5 sm:ml-6 text-2xl sm:text-3xl font-semibold text-neutral-200">{title}</h3>
    </div>
    <p className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-400">{value}</p>
  </div>
);

export const UserDashboard: React.FC<UserDashboardProps> = ({ userProfile }) => {
  if (!userProfile) {
    return (
      <div className="flex-1 p-8 sm:p-12 md:p-16 bg-transparent flex flex-col items-center justify-center text-center">
        <BrainIcon className="w-32 h-32 sm:w-40 sm:h-40 text-neutral-600 mb-8 sm:mb-10" />
        <h2 className="text-5xl sm:text-6xl font-semibold text-neutral-300 mb-5 sm:mb-6 font-display">No Profile Data Yet</h2>
        <p className="text-neutral-400 max-w-lg sm:max-w-xl text-2xl sm:text-3xl">
          Complete your learning profile assessment or start a chat with a mentor to begin your journey and see your progress here.
        </p>
      </div>
    );
  }

  const { name, skillLevels, learningStyle, progress } = userProfile;
  const mainSkill = Object.keys(skillLevels)[0] || 'General';
  const mainSkillLevel = skillLevels[mainSkill] || 0;

  return (
    <div className="flex-1 p-8 sm:p-12 md:p-14 lg:p-16 bg-transparent overflow-y-auto custom-scrollbar">
      <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-400 to-sky-300 font-display mb-12 sm:mb-14 md:mb-16">Welcome back, {name}!</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-14 sm:mb-16">
        <StatCard title="Points Earned" value={progress.points} icon={<SparklesIcon />} />
        <StatCard title="Badges Collected" value={progress.badges.length} icon={<QuillIcon />} />
        <StatCard title={`${mainSkill} Skill Level`} value={mainSkillLevel} icon={<BrainIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14">
        <div className="bg-neutral-800/50 backdrop-blur-lg border-2 border-white/10 p-8 sm:p-12 rounded-xl shadow-xl">
          <h3 className="text-4xl sm:text-5xl font-semibold text-neutral-100 mb-7 sm:mb-8 font-display">Current Quests</h3>
          {Object.keys(progress.currentQuests).length > 0 ? (
            <ul className="space-y-6 sm:space-y-7">
              {Object.entries(progress.currentQuests).map(([subject, quest]) => (
                <li key={subject} className="p-6 sm:p-8 bg-neutral-700/60 rounded-lg border-2 border-neutral-600/70 shadow-md">
                  <span className="font-semibold text-sky-400 text-xl sm:text-2xl">{subject}:</span> 
                  <p className="text-neutral-300 mt-2.5 text-xl sm:text-2xl">{quest}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-400 text-xl sm:text-2xl">No active quests. Your mentors will guide you!</p>
          )}
        </div>

        <div className="bg-neutral-800/50 backdrop-blur-lg border-2 border-white/10 p-8 sm:p-12 rounded-xl shadow-xl">
          <h3 className="text-4xl sm:text-5xl font-semibold text-neutral-100 mb-7 sm:mb-8 font-display">Learning Profile</h3>
          <div className="space-y-5 sm:space-y-6 text-neutral-300 text-xl sm:text-2xl">
            <p><span className="font-medium text-neutral-100">Preferred Style:</span> {learningStyle || 'Not set'}</p>
            <p><span className="font-medium text-neutral-100">Completed Modules:</span> {progress.completedModules.length}</p>
            {/* More profile details can go here */}
          </div>
        </div>
      </div>

       <div className="mt-16 sm:mt-20 text-center">
        <p className="text-neutral-500 text-lg sm:text-xl">More dashboard features coming soon to enhance your RoboVAI Labs experience!</p>
      </div>
    </div>
  );
};