import React from 'react';

interface RobotIconProps extends React.SVGProps<SVGSVGElement> {
  isListening?: boolean;
  isSpeaking?: boolean;
}

export const RobotIcon: React.FC<RobotIconProps> = ({ isListening, isSpeaking, className, ...props }) => {
  
  let headClasses = "transition-colors duration-300";
  let eyeClasses = "transition-colors duration-300";
  let mouthClasses = "transition-transform duration-200 stroke-sky-400";
  let antennaLightClasses = "transition-all duration-300";

  if (isListening) {
    headClasses += " fill-sky-600/50 stroke-sky-400";
    eyeClasses += " fill-sky-200 animate-pulse-fast"; // Eyes pulse when listening
    antennaLightClasses += " fill-sky-300 animate-pulse-fast";
    mouthClasses += " opacity-80";
  } else if (isSpeaking) {
    headClasses += " fill-sky-500/60 stroke-sky-300 animate-breathing-glow"; 
    eyeClasses += " fill-yellow-300"; 
    mouthClasses += " animate-robot-mouth-speak"; 
    antennaLightClasses += " fill-yellow-400 animate-pulse"; 
  } else { // Idle
    headClasses += " fill-sky-700/60 stroke-sky-500";
    eyeClasses += " fill-sky-400";
    antennaLightClasses += " fill-sky-500";
  }


  return (
    <>
      {/* Style tag removed, animation defined in index.html via Tailwind config and applied with utility class */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.75"  // Thinner stroke for a more refined look
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className} 
        {...props}
      >
        {/* Antenna base */}
        <line x1="12" y1="3.5" x2="12" y2="1.5" className="stroke-sky-500/80" />
        {/* Antenna light */}
        <circle cx="12" cy="1" r="1" className={antennaLightClasses} stroke="none"/>
        
        {/* Head */}
        <rect x="5" y="3" width="14" height="11" rx="3" ry="3" className={headClasses} /> 
        
        {/* Eyes */}
        <circle cx="9" cy="7.5" r="1.3" className={eyeClasses} stroke="none" />
        <circle cx="15" cy="7.5" r="1.3" className={eyeClasses} stroke="none" />
        
        {/* Mouth line */}
        <line x1="8.5" y1="11" x2="15.5" y2="11" className={mouthClasses} strokeWidth="0.75"/> 
        
        {/* Neck */}
        <rect x="10" y="13.5" width="4" height="2" rx="0.75" className="fill-sky-700/70 stroke-sky-600/80" />
        
        {/* Body */}
        <rect x="3" y="15" width="18" height="7" rx="2.5" ry="2.5" className="fill-sky-800/70 stroke-sky-600/80" />

        {/* Shoulder details - optional */}
        <circle cx="4.5" cy="16.5" r="0.75" className="fill-sky-600/60 stroke-sky-500/80" />
        <circle cx="19.5" cy="16.5" r="0.75" className="fill-sky-600/60 stroke-sky-500/80" />
      </svg>
    </>
  );
};