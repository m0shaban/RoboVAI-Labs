
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { MentorSelector, getMentorIconComponent } from './components/MentorSelector'; // Added getMentorIconComponent
import { IntegratedToolPanel } from './components/IntegratedToolPanel';
import { AssessmentModal } from './components/AssessmentModal';
import { UserDashboard } from './components/UserDashboard';
import { SplashScreen } from './components/SplashScreen';
import { InteractiveAvatarPanel, AvatarState } from './components/InteractiveAvatarPanel'; 
import { MENTORS, DEFAULT_MENTOR_ID } from './constants';
import type { Mentor, UserProfile, LearningStyle } from './types';
import { QuillIcon } from './components/icons/QuillIcon';
import { BrainIcon } from './components/icons/BrainIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { apiService } from './services/ApiService';
import { useChat } from './hooks/useChat';
import { useTTS } from './hooks/useTTS'; 

enum AppView {
  CHAT = 'chat',
  DASHBOARD = 'dashboard',
}

export interface SplashScreenData {
  name: string;
  gender: 'male' | 'female' | ''; 
  learningStyle: LearningStyle;
  initialSkillLevel: number;
}

const App: React.FC = () => {
  const [currentMentor, setCurrentMentor] = useState<Mentor>(
    () => MENTORS.find(m => m.id === DEFAULT_MENTOR_ID) || MENTORS[0]
  );
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'ok' | 'missing'>('checking');
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [apiKeyGlobalError, setApiKeyGlobalError] = useState<string | null>(null);
  const [showSplashScreen, setShowSplashScreen] = useState(true); 
  
  const [currentQuest, setCurrentQuest] = useState<string | null>(null); 
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<string | null>(null);
  const [initialPixelArtPrompt, setInitialPixelArtPrompt] = useState<string | null>(null);

  // New states for TTS Autoplay and Interactive Voice Mode
  const [isTTSAutoplayEnabled, setIsTTSAutoplayEnabled] = useState(false);
  const [isInteractiveVoiceModeActive, setIsInteractiveVoiceModeActive] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const prevIsTTSSpeakingRef = useRef(false);


  const handleSetInteractiveTool = useCallback((tool: string | null) => {
    setActiveInteractiveTool(tool);
    if (tool !== 'pixel-art-generator') { 
        setInitialPixelArtPrompt(null);
    }
  }, []);

  const handleSetInitialPixelArtPrompt = useCallback((prompt: string | null) => {
    setInitialPixelArtPrompt(prompt);
  }, []);
  
  const handleSetCurrentQuest = useCallback((quest: string | null) => {
    setCurrentQuest(quest);
  }, []);

  const handleUserProgressUpdate = useCallback((pointsToAdd: number) => {
    setUserProfile(prevProfile => {
      if (!prevProfile) return null;
      const newPoints = (prevProfile.progress?.points || 0) + pointsToAdd;
      const updatedProfile = {
        ...prevProfile,
        progress: {
          ...prevProfile.progress,
          points: newPoints,
        },
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      console.log(`User points updated by ${pointsToAdd}. New total: ${newPoints}`);
      return updatedProfile;
    });
  }, []);
  
  const { 
    speak, 
    cancel, 
    isSpeaking, 
    speakingMessageId,
    availableVoices,      
    selectedVoiceURI,   
    setSelectedVoice    
  } = useTTS(); 

  const {
    messages,
    inputValue,
    isLoading: isChatLoading, // Renamed to avoid conflict
    error: chatError,
    handleInputChange,
    handleSubmitMessage,
    handleCodeExecutionFeedback,
    handlePixelArtNotification,
    handleClearChatHistory,
    selectedFile,
    handleFileSelect,
    clearSelectedFile,
    isRecording,
    isProcessingAudio,
    startRecording,
    stopRecording,
  } = useChat(
    currentMentor, 
    userProfile,
    handleSetInteractiveTool,
    handleSetInitialPixelArtPrompt,
    handleSetCurrentQuest,
    handleUserProgressUpdate,
    isTTSAutoplayEnabled, // Pass autoplay state
    isInteractiveVoiceModeActive, // Pass interactive mode state
    speak // Pass speak function for autoplay and interactive mode
  );


  useEffect(() => {
    const key = process.env.API_KEY;
    if (key && key.trim() !== "") {
      setApiKeyStatus('ok');
    } else {
      setApiKeyStatus('missing');
    }

    const handleAuthFailure = (errorMessage: string) => {
      setApiKeyGlobalError(errorMessage);
    };
    apiService.setOnAuthFailure(handleAuthFailure);

    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
      setShowSplashScreen(false); 
    } else {
      setShowSplashScreen(true); 
    }
    
    return () => {
      apiService.setOnAuthFailure(() => {});
      cancel(); 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (isSpeaking) {
      // This cancel was originally for mentor change.
      // We might need more nuanced cancellation if autoplay/interactive mode is on.
      // For now, mentor change will still cancel TTS.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMentor]);

  // Manage Avatar State
  useEffect(() => {
    if (isInteractiveVoiceModeActive) {
      if (isRecording) {
        setAvatarState('listening');
      } else if (isProcessingAudio) {
        setAvatarState('userProcessing');
      } else if (isChatLoading) { // AI is "thinking"
        setAvatarState('aiProcessing');
      } else if (isSpeaking) {
        setAvatarState('speaking');
      } else {
        // If idle in interactive mode, usually means it's waiting to start listening
        // or has just finished speaking. The re-loop logic handles starting listening.
        setAvatarState('idle'); 
      }
    } else {
      setAvatarState('idle');
    }
  }, [isInteractiveVoiceModeActive, isRecording, isProcessingAudio, isChatLoading, isSpeaking]);

  // Auto-loop for Interactive Voice Mode: Start listening after AI finishes speaking
  useEffect(() => {
    if (
      isInteractiveVoiceModeActive &&
      !isSpeaking && // TTS just finished
      prevIsTTSSpeakingRef.current && // And it was previously speaking
      !isRecording &&
      !isProcessingAudio &&
      !isChatLoading // And not in any other state that implies activity
    ) {
      startRecording();
    }
    prevIsTTSSpeakingRef.current = isSpeaking;
  }, [isSpeaking, isInteractiveVoiceModeActive, isRecording, isProcessingAudio, isChatLoading, startRecording]);


  const handleMentorSelect = useCallback((mentor: Mentor) => {
    setCurrentMentor(mentor);
    setActiveView(AppView.CHAT);
    setActiveInteractiveTool(null); 
    setInitialPixelArtPrompt(null);
    setCurrentQuest(null); 
    if (isSpeaking) cancel(); 
    if (isInteractiveVoiceModeActive) setIsInteractiveVoiceModeActive(false); // Exit interactive mode on mentor change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking, cancel, isInteractiveVoiceModeActive]);

  const handleAssessmentSubmit = useCallback((data: { name: string; skillLevel: number; learningStyle: LearningStyle }) => {
    setUserProfile(prevProfile => {
      const updatedProfile: UserProfile = {
        id: prevProfile?.id || 'user-' + Date.now().toString(36),
        name: data.name || prevProfile?.name || 'Learner', 
        gender: prevProfile?.gender,
        skillLevels: { 
          ...(prevProfile?.skillLevels || {}),
          [currentMentor?.specialization.toLowerCase() || 'general']: data.skillLevel 
        },
        learningStyle: data.learningStyle || prevProfile?.learningStyle,
        progress: prevProfile?.progress || { 
          completedModules: [],
          points: 0,
          badges: [],
          currentQuests: {},
        },
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setIsAssessmentModalOpen(false);
      return updatedProfile;
    });
  }, [currentMentor]);

  const handleEnterApp = useCallback((data: SplashScreenData) => {
    const existingProfile = userProfile; 
    const newProfileData: UserProfile = {
      id: existingProfile?.id || 'user-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: data.name || 'Learner',
      gender: data.gender || undefined, 
      learningStyle: data.learningStyle,
      skillLevels: {
        ...(existingProfile?.skillLevels || {}),
        'general': data.initialSkillLevel,
      },
      progress: existingProfile?.progress || {
        completedModules: [],
        points: 0,
        badges: [],
        currentQuests: {},
      },
    };
    setUserProfile(newProfileData);
    localStorage.setItem('userProfile', JSON.stringify(newProfileData));
    setShowSplashScreen(false);
  }, [userProfile]);

  const toggleTTSAutoplay = useCallback(() => {
    setIsTTSAutoplayEnabled(prev => !prev);
  }, []);

  const toggleInteractiveVoiceMode = useCallback(() => {
    setIsInteractiveVoiceModeActive(prev => {
      const newMode = !prev;
      if (newMode) {
        // Turning ON
        if (isSpeaking) cancel(); // Cancel any ongoing manual TTS
        startRecording();
      } else {
        // Turning OFF
        if (isRecording) stopRecording();
        if (isSpeaking) cancel();
      }
      return newMode;
    });
  }, [isRecording, isSpeaking, startRecording, stopRecording, cancel]);


  if (showSplashScreen && !userProfile) { 
    return <SplashScreen onEnterApp={handleEnterApp} />;
  }

  if (apiKeyStatus === 'checking' && !apiKeyGlobalError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-950 text-white p-8 xs:p-12">
        <SparklesIcon className="w-16 h-16 xs:w-20 xs:h-20 mr-6 text-sky-400 animate-smooth-spin" />
        <span className="text-3xl xs:text-4xl font-display">Checking API Key...</span>
      </div>
    );
  }
  
  if (apiKeyGlobalError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-950 text-white p-8 xs:p-12 text-center">
        <BrainIcon className="w-32 h-32 xs:w-40 xs:h-40 mb-10 xs:mb-12 text-red-500 animate-data-pulse" />
        <h1 className="text-5xl xs:text-6xl md:text-7xl font-bold mb-6 xs:mb-8 font-display text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">API Authentication Failed</h1>
        <p className="text-neutral-300 max-w-lg xs:max-w-xl mb-8 xs:mb-10 text-2xl xs:text-3xl">
          {apiKeyGlobalError}
        </p>
        <p className="text-lg xs:text-xl text-neutral-400 mt-5">
          Please verify that the <code>API_KEY</code> environment variable is correctly set up and that the key is active and has sufficient permissions/quota on the AI service platform (e.g., Google AI Studio).
        </p>
        <p className="text-lg xs:text-xl text-neutral-400 mt-5">
          The application cannot function correctly until this is resolved.
        </p>
      </div>
    );
  }

  if (apiKeyStatus === 'missing') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-950 text-white p-8 xs:p-12 text-center">
        <BrainIcon className="w-32 h-32 xs:w-40 xs:h-40 mb-10 xs:mb-12 text-orange-500 animate-data-pulse" />
        <h1 className="text-5xl xs:text-6xl md:text-7xl font-bold mb-6 xs:mb-8 font-display text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">API Key Missing</h1>
        <p className="text-neutral-300 max-w-lg xs:max-w-xl text-2xl xs:text-3xl">
          A valid <code>API_KEY</code> environment variable is required. Please ensure it's configured.
        </p>
         <p className="text-lg xs:text-xl text-neutral-400 mt-8">
          This application cannot function without an API key for the AI service.
        </p>
      </div>
    );
  }
  
  const MentorIconHeader = currentMentor && activeView === AppView.CHAT ? getMentorIconComponent(currentMentor.id) : null;

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-950 text-neutral-100">
      <MentorSelector
        mentors={MENTORS}
        selectedMentor={currentMentor}
        onSelectMentor={handleMentorSelect}
        onShowDashboard={() => setActiveView(AppView.DASHBOARD)}
        onShowAssessment={() => setIsAssessmentModalOpen(true)}
        activeView={activeView}
      />
      <main className="flex-1 flex flex-col overflow-hidden bg-white/5 backdrop-blur-xl md:rounded-l-[3rem] md:shadow-2xl md:border-l-4 md:border-white/10 relative">
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6 md:p-8 lg:p-10 shadow-lg">
          <div className="flex items-center">
             <QuillIcon className="w-12 h-12 md:w-16 md:h-16 text-sky-400 mr-4 md:mr-6 animate-subtle-pulse flex-shrink-0" />
            <div className="flex flex-col xs:flex-row xs:items-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-sky-500 font-display leading-tight">
                RoboVAI Labs
              </h1>
              {currentMentor && activeView === AppView.CHAT && (
                <div className="flex items-center text-lg sm:text-xl md:text-2xl font-normal text-neutral-400 xs:ml-3">
                  {MentorIconHeader && (
                    <MentorIconHeader className="w-7 h-7 sm:w-8 sm:h-8 mr-2 text-sky-300 opacity-80 flex-shrink-0" />
                  )}
                  <span className="truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[250px] md:max-w-xs lg:max-w-sm xl:max-w-md">
                    | Chat with {currentMentor.name}
                  </span>
                </div>
              )}
               {activeView === AppView.DASHBOARD && userProfile && (
                <span className="text-lg sm:text-xl md:text-2xl font-normal text-neutral-400 xs:ml-4 truncate max-w-[200px] xs:max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl">
                  | {userProfile.name}'s Dashboard
                </span>
              )}
               {activeView === AppView.DASHBOARD && !userProfile && (
                <span className="text-lg sm:text-xl md:text-2xl font-normal text-neutral-400 xs:ml-4">
                  | My Dashboard
                </span>
              )}
            </div>
          </div>
        </header>

        {activeView === AppView.CHAT && currentMentor && (
          <div className="flex-1 flex overflow-hidden">
            <ChatInterface 
              mentor={currentMentor} 
              userProfile={userProfile}
              messages={messages}
              inputValue={inputValue}
              isLoading={isChatLoading}
              error={chatError}
              handleInputChange={handleInputChange}
              handleSubmitMessage={handleSubmitMessage}
              handleClearChatHistory={handleClearChatHistory}
              selectedFile={selectedFile}
              handleFileSelect={handleFileSelect}
              clearSelectedFile={clearSelectedFile}
              isRecording={isRecording}
              isProcessingAudio={isProcessingAudio}
              startRecording={startRecording}
              stopRecording={stopRecording}
              // TTS props
              speak={speak}
              cancelTTS={cancel}
              isTTSSpeaking={isSpeaking}
              ttsSpeakingMessageId={speakingMessageId}
              availableTTSVoices={availableVoices} 
              selectedTTSVoiceURI={selectedVoiceURI} 
              setSelectedTTSVoice={setSelectedVoice} 
              // Autoplay and Interactive Mode Props
              isTTSAutoplayEnabled={isTTSAutoplayEnabled}
              toggleTTSAutoplay={toggleTTSAutoplay}
              isInteractiveVoiceModeActive={isInteractiveVoiceModeActive}
              toggleInteractiveVoiceMode={toggleInteractiveVoiceMode}
            />
            <IntegratedToolPanel 
              currentMentorId={currentMentor.id}
              activeTool={activeInteractiveTool} 
              currentQuest={currentQuest}
              initialPixelArtPrompt={initialPixelArtPrompt}
              onCodeExecuted={handleCodeExecutionFeedback}
              onPixelArtGenerated={handlePixelArtNotification}
            />
          </div>
        )}
        {activeView === AppView.DASHBOARD && (
          <UserDashboard userProfile={userProfile} />
        )}

        {isInteractiveVoiceModeActive && activeView === AppView.CHAT && (
          <InteractiveAvatarPanel 
            avatarState={avatarState} 
            onExit={() => setIsInteractiveVoiceModeActive(false)}
            onForceStopListening={stopRecording} 
          />
        )}
      </main>
      {isAssessmentModalOpen && (
        <AssessmentModal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          onSubmit={handleAssessmentSubmit}
          currentSubject={currentMentor?.specialization || "General Studies"}
          currentProfileName={userProfile?.name}
        />
      )}
    </div>
  );
};

export default App;