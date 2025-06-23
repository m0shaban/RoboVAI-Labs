import React, { useState, useEffect, useRef }from 'react';
import { CircuitBoardIcon } from './icons/CircuitBoardIcon'; 
import { TargetIcon } from './icons/TargetIcon'; 
import { PixelArtIcon } from './icons/PixelArtIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlayIcon } from './icons/PlayIcon';
import { LabFlaskIcon } from './icons/LabFlaskIcon'; 
import { apiService } from '../services/ApiService';

interface IntegratedToolPanelProps {
  currentMentorId: string; 
  activeTool?: string | null; 
  currentQuest?: string | null; 
  onCodeExecuted?: (code: string, output: string, hasError: boolean) => void;
  initialPixelArtPrompt?: string | null; 
  onPixelArtGenerated?: (prompt: string, imageUrl: string) => void; 
}

export const IntegratedToolPanel: React.FC<IntegratedToolPanelProps> = ({ 
  currentMentorId,
  activeTool, 
  currentQuest, 
  onCodeExecuted,
  initialPixelArtPrompt, 
  onPixelArtGenerated    
}) => {
  const [pixelArtPrompt, setPixelArtPrompt] = useState<string>("");
  const [generatedPixelArtUrl, setGeneratedPixelArtUrl] = useState<string | null>(null);
  const [isGeneratingPixelArt, setIsGeneratingPixelArt] = useState<boolean>(false);
  const [pixelArtError, setPixelArtError] = useState<string | null>(null);

  const [codeInputValue, setCodeInputValue] = useState<string>("");
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);
  const [codeExecutionHadError, setCodeExecutionHadError] = useState<boolean>(false);

  const displayTool = activeTool;

  const showCodeEditor = displayTool === 'code-editor';
  const showPixelArtGenerator = displayTool === 'pixel-art-generator';
  const showPhysicsLab = displayTool === 'smart-physics-lab';
  const showStandbyMessage = !displayTool;


  useEffect(() => {
    if (initialPixelArtPrompt) {
      setPixelArtPrompt(initialPixelArtPrompt);
    }
  }, [initialPixelArtPrompt]);
  
  useEffect(() => {
    if (displayTool !== 'pixel-art-generator') {
        setGeneratedPixelArtUrl(null);
        setPixelArtError(null);
        if (!initialPixelArtPrompt) { 
            setPixelArtPrompt("");
        }
    }
    if (displayTool !== 'code-editor') {
        setExecutionOutput(null);
        setCodeExecutionHadError(false);
        // setCodeInputValue(""); 
    }
  }, [displayTool, initialPixelArtPrompt]);


  const handleGeneratePixelArt = async () => {
    if (!pixelArtPrompt.trim()) {
      setPixelArtError("Please enter a prompt for the pixel art.");
      return;
    }
    setIsGeneratingPixelArt(true);
    setPixelArtError(null);
    setGeneratedPixelArtUrl(null);

    const result = await apiService.generatePixelArtFromImagen(pixelArtPrompt);

    if (result.imageUrl) {
      setGeneratedPixelArtUrl(result.imageUrl);
      if (onPixelArtGenerated) {
        onPixelArtGenerated(pixelArtPrompt, result.imageUrl);
      }
    } else {
      setPixelArtError(result.error || "Failed to generate pixel art.");
    }
    setIsGeneratingPixelArt(false);
  };

  const executeJavaScriptCode = (code: string) => {
    setIsCodeRunning(true);
    setCodeExecutionHadError(false);
    let outputText = "";
    let didErrorOccur = false;
    
    let capturedLogs: string[] = [];
    const originalConsoleLog = console.log;
    
    console.log = (...args: any[]) => {
      capturedLogs.push(args.map(arg => {
        try {
          return typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2);
        } catch (e) {
          return '[Unserializable object]';
        }
      }).join(' '));
    };

    try {
      const result = new Function(code)();
      
      outputText = capturedLogs.join('\n');
      if (result !== undefined) {
        let resultString;
        try {
          resultString = JSON.stringify(result, null, 2);
        } catch (e) {
          resultString = '[Unserializable return value]';
        }
        outputText += (outputText ? '\n\n' : '') + `Function returned: ${resultString}`;
      }
      outputText = outputText.trim() || "Code executed successfully. No explicit output or return value.";
    } catch (error: any) {
      didErrorOccur = true;
      let displayMessage = "";
      let displayStack = "";

      if (error instanceof Error) {
        displayMessage = `${error.name || 'Error'}: ${error.message}`;
        
        if (error.stack) {
          const stackLines = error.stack.split('\n');
          let processedStackLines = [...stackLines]; 

          if (processedStackLines.length > 0) {
            const firstStackLineTrimmed = processedStackLines[0].trim();
            const displayMessageTrimmed = displayMessage.trim();
            const errorMessageTrimmed = error.message.trim();
            const errorNameAndMessageTrimmed = error.name ? `${error.name}: ${error.message}`.trim() : '';

            if (firstStackLineTrimmed === displayMessageTrimmed || 
                firstStackLineTrimmed === errorMessageTrimmed ||
                (errorNameAndMessageTrimmed && firstStackLineTrimmed === errorNameAndMessageTrimmed)) {
              processedStackLines.shift();
            }
          }
          
          const filteredStackLines = processedStackLines.filter(
            (line: string) => {
              const trimmedLine = line.trim();
              if (trimmedLine === '') return false;
              if (trimmedLine.startsWith('at handleRunCode') || 
                  trimmedLine.startsWith('at executeJavaScriptCode') ||
                  trimmedLine.startsWith('at new Function') || 
                  trimmedLine.startsWith('at Function (') || 
                  trimmedLine.includes('(https://esm.sh/react-dom') || 
                  trimmedLine.includes('data:application/javascript;base64')
                 ) {
                return false;
              }
              return true;
            }
          ).map(line => { 
            const evalMatch = line.match(/at (?:eval|Object\.eval)? ?(?:\[as.*?\])? ?\(.*(?:<anonymous>|eval code|Function code|blob:).*?:(\d+):(\d+)\)/);
            if (evalMatch) {
              return `  at user script (line ${evalMatch[1]}, column ${evalMatch[2]})`;
            }
            return line.trim().replace(/^\s*at\s*/, '  '); 
          });
          
          if (filteredStackLines.length > 0) {
            displayStack = filteredStackLines.slice(0, 3).join('\n'); 
          }
        }
      } else {
        try {
          displayMessage = `Error: ${JSON.stringify(error)}`;
        } catch {
          displayMessage = "An unknown, non-Error object was thrown.";
        }
      }

      outputText = displayMessage;
      if (displayStack) {
        outputText += `\n${displayStack}`;
      }

      if (capturedLogs.length > 0) {
        outputText = `Console output before error:\n${capturedLogs.join('\n')}\n\n${outputText}`;
      }
    } finally {
      console.log = originalConsoleLog; 
      setIsCodeRunning(false);
      setExecutionOutput(outputText);
      setCodeExecutionHadError(didErrorOccur);
      if (onCodeExecuted) {
        onCodeExecuted(code, outputText, didErrorOccur);
      }
    }
  };

  const handleRunCodeFromEditor = () => {
    executeJavaScriptCode(codeInputValue);
  };

  const commonButtonClasses = "w-full flex items-center justify-center px-6 py-3.5 text-lg md:text-xl font-medium text-white rounded-lg focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all duration-200 border-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed active:animate-button-press-anim";

  return (
    <aside className="hidden md:block md:w-1/2 lg:w-2/5 xl:w-1/3 bg-neutral-800/40 backdrop-blur-lg border-l-2 border-white/15 p-8 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar text-neutral-200">
      <div className="flex items-center mb-10 lg:mb-12">
        <CircuitBoardIcon className="w-10 h-10 md:w-12 lg:w-14 text-secondary-400 mr-5 md:mr-6 animate-subtle-pulse flex-shrink-0" />
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-sky-400 font-display">Interactive Tools</h3>
      </div>

      {showPhysicsLab && (
        <div className="mb-12 md:mb-14">
          <div className="flex items-center mb-5 md:mb-6">
            <LabFlaskIcon className="w-9 h-9 md:w-10 text-purple-400 mr-3.5 animate-subtle-pulse flex-shrink-0" />
            <h4 className="font-medium text-neutral-100 text-xl md:text-2xl">Smart Physics Lab (Conceptual)</h4>
          </div>
          <div className="bg-neutral-700/50 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-lg border-2 border-neutral-600/60 bg-futuristic-grid bg-opacity-30 space-y-5">
            <p className="text-lg md:text-xl text-neutral-300">
              Explore the concept of an interactive Physics Lab powered by AI. Imagine realistic 3D simulations and virtual experiments with circuits, motion, and optics.
            </p>
            <p className="text-base md:text-lg text-neutral-400">
              Mentors can discuss how such a tool could enhance your understanding of physics. You can ask them about specific simulations or how AI could guide you through complex experiments.
            </p>
            <p className="text-sm text-neutral-500 italic">
              Note: This tool is currently a conceptual placeholder for discussion and not a functional simulation environment.
            </p>
          </div>
        </div>
      )}
      
      {showPixelArtGenerator && (
        <div className="mb-12 md:mb-14">
          <div className="flex items-center mb-5 md:mb-6">
            <PixelArtIcon className="w-9 h-9 md:w-10 text-green-400 mr-3.5 animate-subtle-pulse flex-shrink-0" />
            <h4 className="font-medium text-neutral-100 text-xl md:text-2xl">Pixel Art Generator</h4>
          </div>
          <div className="bg-neutral-700/50 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-lg border-2 border-neutral-600/60 bg-futuristic-grid bg-opacity-30 space-y-6">
            <input
              type="text"
              value={pixelArtPrompt}
              onChange={(e) => setPixelArtPrompt(e.target.value)}
              placeholder="E.g., 'a futuristic city skyline'"
              className="w-full p-4 sm:p-5 text-lg sm:text-xl bg-neutral-800/70 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner focus:animate-breathing-glow"
              disabled={isGeneratingPixelArt}
            />
            <button
              onClick={handleGeneratePixelArt}
              disabled={isGeneratingPixelArt || !pixelArtPrompt.trim()}
              className={`${commonButtonClasses} bg-green-600/90 hover:bg-green-500 border-green-500/80 focus:ring-green-400 hover:shadow-green-500/40`}
            >
              {isGeneratingPixelArt ? (
                <>
                  <SparklesIcon className="w-7 h-7 mr-3 animate-smooth-spin" />
                  Generating...
                </>
              ) : (
                 <>
                  <PixelArtIcon className="w-7 h-7 mr-3" />
                  Create Pixel Art
                </>
              )}
            </button>
            {pixelArtError && (
              <p className="text-lg text-red-300 bg-red-900/40 p-4 rounded-md border-2 border-red-500/60">{pixelArtError}</p>
            )}
            {generatedPixelArtUrl && !pixelArtError && (
              <div className="mt-6 p-3 bg-black/40 rounded-lg border-2 border-sky-500/40 flex flex-col items-center space-y-3">
                <img 
                  src={generatedPixelArtUrl} 
                  alt={`Generated pixel art for prompt: ${pixelArtPrompt}`} 
                  className="max-w-full h-auto rounded-md shadow-lg object-contain max-h-80 sm:max-h-96"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'; 
                    setPixelArtError("Failed to display the generated image. The image data might be corrupted or unsupported.");
                  }}
                />
                <p className="text-base text-neutral-300">Generated for:</p>
                <p className="text-sm italic text-neutral-400 text-center">"{pixelArtPrompt}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCodeEditor && (
        <div className="mb-12 md:mb-14"> 
          <h4 className="font-medium text-neutral-100 mb-4 md:mb-5 text-xl md:text-2xl">Code Editor (JavaScript)</h4>
          <p className="text-lg md:text-xl text-neutral-300 mb-5 md:mb-6">Your AI mentor might ask you to write or test code here.</p>
          <textarea 
            value={codeInputValue}
            onChange={(e) => setCodeInputValue(e.target.value)}
            className="w-full h-52 md:h-64 lg:h-80 mt-3.5 p-4 sm:p-5 text-lg sm:text-xl bg-neutral-800/70 border-2 border-neutral-600/80 rounded-lg focus:ring-2 focus:ring-sky-500/90 focus:border-sky-500/90 outline-none transition-all duration-200 text-neutral-100 placeholder-neutral-400/90 backdrop-blur-sm shadow-inner custom-scrollbar focus:animate-breathing-glow"
            placeholder="// Enter JavaScript code here...
// Example: console.log('Hello from RoboVAI Labs!');
// let sum = 10 + 5;
// console.log('The sum is:', sum);
// return sum * 2;"
            disabled={isCodeRunning}
            aria-label="JavaScript Code Editor"
          />
          <button
            onClick={handleRunCodeFromEditor}
            disabled={isCodeRunning || !codeInputValue.trim()}
            className={`${commonButtonClasses} mt-6 bg-sky-600/90 hover:bg-sky-500 border-sky-500/80 focus:ring-sky-400 hover:shadow-sky-500/40`}
          >
            {isCodeRunning ? (
              <>
                <SparklesIcon className="w-7 h-7 mr-3 animate-smooth-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="w-7 h-7 mr-3" />
                Run Code
              </>
            )}
          </button>
          {executionOutput !== null && displayTool === 'code-editor' && (
            <div className={`mt-6 p-5 md:p-6 bg-black/50 border-2 ${codeExecutionHadError ? 'border-red-500/60' : 'border-neutral-600/60'} rounded-lg`}>
              <h5 className={`text-lg font-semibold mb-3 ${codeExecutionHadError ? 'text-red-300' : 'text-neutral-200'}`}>
                {codeExecutionHadError ? 'Error Output:' : 'Output:'}
              </h5>
              <pre className={`text-base sm:text-lg whitespace-pre-wrap break-all custom-scrollbar max-h-64 overflow-y-auto ${codeExecutionHadError ? 'text-red-300' : 'text-neutral-200'}`}>
                {executionOutput}
              </pre>
            </div>
          )}
        </div>
      )}
      
      {showStandbyMessage && (
        <div className="bg-neutral-700/50 backdrop-blur-md p-6 md:p-8 lg:p-10 rounded-xl shadow-lg border-2 border-neutral-600/60 min-h-[200px] md:min-h-[250px] bg-futuristic-grid bg-opacity-50 mb-12 md:mb-14">
          <p className="text-lg md:text-xl text-neutral-300 font-mono p-4 md:p-5 bg-black/30 rounded-md border-2 border-sky-700/40">
            <span className="text-sky-400 animate-pulse-fast">&gt; Standby Mode_</span><br />
            Interactive tools activate based on mentor guidance...<br />
            Awaiting input for: Code Editor, Pixel Art, Physics Lab...
          </p>
        </div>
      )}

       <div className="mt-auto pt-8 md:pt-10 lg:pt-12 border-t-2 border-white/15"> 
          <div className="flex items-center mb-5 md:mb-6">
            <TargetIcon className="w-9 h-9 md:w-10 md:h-10 text-yellow-400 mr-3.5 animate-subtle-pulse flex-shrink-0" />
            <h4 className="font-medium text-neutral-100 text-xl md:text-2xl">Current Quest / Task</h4>
          </div>
          <div className="bg-neutral-700/50 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-lg border-2 border-neutral-600/60 text-lg md:text-xl text-neutral-300 min-h-[120px] md:min-h-[150px] bg-futuristic-grid bg-opacity-30">
            {currentQuest ? currentQuest : "No active quest. Your mentor will assign tasks or provide guidance here."}
          </div>
        </div>
    </aside>
  );
};