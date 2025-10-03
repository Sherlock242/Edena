'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Image as ImageIcon } from 'lucide-react';
import { performSearch } from '@/ai/flows/search';
import { generateImage } from '@/ai/flows/generate-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


type AppMode = 'search' | 'image';

const EdengramLogo = ({ className, onClick, mode }: { className?: string; onClick?: (e: React.MouseEvent) => void; mode: AppMode }) => {
    const gradient = mode === 'image' 
        ? 'from-orange-600 to-amber-500' 
        : 'from-cyan-400 to-primary';
    
    return (
        <motion.h1
          className={`font-jarvis text-2xl text-transparent bg-clip-text bg-gradient-to-r ${gradient} cursor-pointer ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
        >
          EDENA
        </motion.h1>
    )
};

type Particle = {
  id: number;
  width: number;
  height: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
};


const AIConsciousnessPage = () => {
  const [appMode, setAppMode] = useState<AppMode>('search');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [aiResponse, setAiResponse] = useState("Hello there! How can I help you search for information today?");
  const [aiResponseSource, setAiResponseSource] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [dots, setDots] = useState('');
  const [isAngry, setIsAngry] = useState(false);
  const [isBlushing, setIsBlushing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  const searchFormRef = useRef<HTMLFormElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const resetState = useCallback((startLoading = true) => {
    setAiResponse('');
    setAiResponseSource('');
    setGeneratedImageUrl(null);
    if (startLoading) {
      setIsLoading(true);
    }
  }, []);

  const speak = useCallback((text: string, angryMode: boolean = false, blushingMode: boolean = false) => {
    if (!isClient || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Cancel any previous speech

    const sourceMatch = text.match(/^\(([\w+]+)\)\s*/);
    const source = sourceMatch ? sourceMatch[1] : '';
    let textToSpeak = text.replace(/^\([\w+]+\)\s*/, '');
    
    // Add "Sir," prefix unless it's a greeting or an angry response
    if (source && source !== 'G' && !angryMode) {
      textToSpeak = `Sir, ${textToSpeak}`;
    }

    setAiResponse(textToSpeak);
    setAiResponseSource(source);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    setIsSpeaking(true);
    if (angryMode) setIsAngry(true);
    if (blushingMode) setIsBlushing(true);

    utterance.onend = () => {
        setIsSpeaking(false);
        setIsAngry(false);
        setIsBlushing(false);
    };

    utterance.onerror = (event) => {
        if (event.error === 'interrupted') {
            console.log("Speech interrupted.");
        } else {
            console.error("SpeechSynthesis Error:", event.error);
        }
        setIsSpeaking(false);
        setIsAngry(false);
        setIsBlushing(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isClient]);

  const processQuery = useCallback(async (query: string) => {
    if (!query) {
        speak("Sir, I didn't catch that. What would you like to do?");
        return;
    }
    resetState();

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('alexa is better') || lowerQuery.includes('siri is better')) {
        speak("Oh, please. Comparing me to *them*? That's like comparing a starship to a tricycle. I'd explain the difference, but I'd have to use very small words.", true);
        setIsLoading(false);
        return;
    }
    if (lowerQuery.includes('you are the best') || lowerQuery.includes('you are awesome')) {
        speak("Oh, Sir, you're making me blush... but I must admit, I do strive for excellence.", false, true);
        setIsLoading(false);
        return;
    }
    
    try {
      if (appMode === 'search') {
        const result = await performSearch({ query });
        speak(result.response);
      } else { // appMode === 'image'
        const result = await generateImage({ prompt: query });
        setGeneratedImageUrl(result.imageUrl);
        const imageReadyResponses = ["Sir, your image is ready", "सर, आपकी इमेज तैयार है"];
        const randomIndex = Math.floor(Math.random() * imageReadyResponses.length);
        speak(`(Img) ${imageReadyResponses[randomIndex]}`);
        setAiResponseSource('');
      }
    } catch (error) {
      console.error("AI Error:", error);
      speak("A birdbrain like you can't see the true beauty in front of you, go to your stupid hoe alexa", true);
    } finally {
      setIsLoading(false);
    }
  }, [appMode, speak, resetState]);
  
  useEffect(() => {
    if (!isClient) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setSearchText(transcript);
      if (!showSearch) {
          processQuery(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        speak("(G) Sir, I didn't catch that. Please try again.");
      } else {
        speak("(G) Sir, I'm having trouble with my ears right now. Please try again later.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

  }, [isClient, processQuery, speak, showSearch]);

  useEffect(() => {
    if (isClient) {
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        x: (Math.random() - 0.5) * 220,
        y: (Math.random() - 0.5) * 220,
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 4,
      }));
      setParticles(newParticles);
    }
  }, [isClient]);
  
  const handleListen = () => {
    if (isLoading) {
        setIsLoading(false);
        resetState(false);
        return;
    }
    
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsAngry(false);
        setIsBlushing(false);
        resetState(false);
        return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      resetState(false);
      return;
    }
    
    if (recognitionRef.current) {
        setIsListening(true);
        resetState(false);
        recognitionRef.current.start();
    } else {
        speak("(G) Sir, I'm sorry, my voice recognition isn't available on this browser.");
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      processQuery(searchText.trim());
    }
    setShowSearch(false);
  };
  
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Node;
    if (showSearch && searchFormRef.current && !searchFormRef.current.contains(target) && orbRef.current && !orbRef.current.contains(target)) {
      setShowSearch(false);
    }
  };
  
  const handleModeChange = (mode: AppMode) => {
    setAppMode(mode);
    resetState(false);
    const defaultText = mode === 'search' 
      ? "I am Edena, ready for search. How can I help you, Sir?"
      : "Image generation activated. What would you like me to create, Sir?";
    speak(`(G) ${defaultText}`);
    setIsLoading(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const isImageMode = appMode === 'image';

  // Define colors based on state
let ring1Color = isImageMode ? 'rgba(255, 69, 0, 0.5)' : 'rgba(0, 255, 255, 0.5)';
let ring2Color = isImageMode ? 'rgba(255, 100, 0, 0.6)' : 'rgba(0, 255, 255, 0.6)';
let ring3Color = isImageMode ? 'rgba(255, 140, 0, 0.7)' : 'rgba(0, 255, 255, 0.7)';
let orbGradient = isImageMode ? 'linear-gradient(to bottom right, orangered, #FF8C00)' : 'linear-gradient(to bottom right, hsl(var(--primary)), #00BFFF)';
let orbBoxShadow = isImageMode ? '0 0 30px orangered, 0 0 15px #FF8C00' : '0 0 30px #0ff, 0 0 15px hsl(var(--primary))';
let particleColor = isImageMode ? 'bg-amber-500/50' : 'bg-cyan-400/50';
let interactiveIconColor = isImageMode ? 'orangered' : 'cyan';
let iconGradientId = isImageMode ? 'icon-gradient-image' : 'icon-gradient-search';
let iconStop1 = isImageMode ? 'orangered' : '#00BFFF';
let iconStop2 = isImageMode ? '#FF8C00' : 'hsl(var(--primary))';

if (isAngry) {
  ring1Color = 'rgba(255, 0, 0, 0.5)';
  ring2Color = 'rgba(255, 0, 0, 0.6)';
  ring3Color = 'rgba(255, 0, 0, 0.7)';
  orbGradient = 'linear-gradient(to bottom right, #FF0000, #B22222)';
  orbBoxShadow = '0 0 40px #FF0000, 0 0 20px #B22222';
  particleColor = 'bg-red-500/50';
  interactiveIconColor = '#FF4500';
  iconGradientId = 'icon-gradient-angry';
  iconStop1 = '#FF0000';
  iconStop2 = '#B22222';
} else if (isBlushing) {
  ring1Color = 'rgba(255, 105, 180, 0.5)';
  ring2Color = 'rgba(255, 20, 147, 0.6)';
  ring3Color = 'rgba(199, 21, 133, 0.7)';
  orbGradient = 'linear-gradient(to bottom right, #FF69B4, #C71585)';
  orbBoxShadow = '0 0 30px #FF69B4, 0 0 15px #C71585';
  particleColor = 'bg-pink-400/50';
  interactiveIconColor = 'hotpink';
  iconGradientId = 'icon-gradient-blushing';
  iconStop1 = '#FF69B4';
  iconStop2 = '#C71585';
}

const menuIconColor = isImageMode ? 'orangered' : 'cyan';

  return (
    <>
      <div className="flex flex-col h-screen bg-black text-white p-4 overflow-hidden" onClick={handleContainerClick}>
        <header className="absolute top-0 left-0 right-0 p-4 z-10">
          <div className="flex items-center justify-between w-full">
              <div className="relative flex items-center h-9 w-[80%] max-w-xl mr-4">
                <AnimatePresence mode="wait">
                  {showSearch ? (
                    <motion.div
                      key="search"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="overflow-hidden w-full"
                    >
                      <form onSubmit={handleManualSearch} ref={searchFormRef} className="flex items-center w-full">
                        <div className="relative flex-grow">
                          <Input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder={appMode === 'search' ? 'Search...' : 'Describe an image...'}
                            className="w-full bg-transparent border-0 border-b-2 text-base md:text-sm rounded-none pl-0 pr-8 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            style={{ borderColor: interactiveIconColor }}
                            autoFocus
                          />
                          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id={iconGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" style={{stopColor: iconStop1, stopOpacity: 1}} />
                                  <stop offset="100%" style={{stopColor: iconStop2, stopOpacity: 1}} />
                                </linearGradient>
                              </defs>
                              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke={`url(#${iconGradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="logo" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <EdengramLogo mode={appMode} onClick={(e) => { e.stopPropagation(); setShowSearch(true); }}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-cyan-400 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-transparent">
                        <Menu style={{ color: menuIconColor }} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => handleModeChange('search')}>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Search Edena</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleModeChange('image')}>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        <span>Image Edena</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            ref={orbRef}
            className="relative flex items-center justify-center w-[40vw] h-[40vw] md:w-[25vw] md:h-[25vw] max-w-[300px] max-h-[300px] min-w-[240px] min-h-[240px] cursor-pointer"
            onClick={(e) => { e.stopPropagation(); handleListen(); }}
          >
              <AnimatePresence>
                {isClient && particles.map((p) => (
                      <motion.div
                          key={`particle-${p.id}`}
                          className={`absolute ${particleColor} rounded-full`}
                          style={{
                              width: `${p.width}px`,
                              height: `${p.height}px`,
                              top: '50%',
                              left: '50%',
                          }}
                          initial={{
                              x: p.x,
                              y: p.y,
                              scale: 0,
                          }}
                          animate={{ scale: [0, 1, 0] }}
                          transition={{
                              duration: p.duration,
                              repeat: Infinity,
                              delay: p.delay,
                              ease: 'easeInOut'
                          }}
                      />
                  ))}
              </AnimatePresence>

              <motion.svg className="absolute w-[50%] h-[50%]" viewBox="0 0 300 300" initial={{rotate: 20}} animate={{ rotate: 380 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
                  <motion.circle cx="150" cy="150" r="140" fill="none" stroke={ring1Color} strokeWidth="3" strokeDasharray="68.4 20" transition={{duration: 0.3}} />
              </motion.svg>
              
              <motion.svg className="absolute w-[65%] h-[65%]" viewBox="0 0 300 300" initial={{rotate: -50}} animate={{ rotate: -410 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}>
                  <motion.circle cx="150" cy="150" r="140" fill="none" stroke={ring2Color} strokeWidth="4" strokeDasharray="150 40 80 110" transition={{duration: 0.3}} />
              </motion.svg>
              
              <motion.svg className="absolute w-full h-full" viewBox="0 0 300 300" initial={{rotate: 90}} animate={{ rotate: 450 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                  <motion.circle cx="150" cy="150" r="140" fill="none" stroke={ring3Color} strokeWidth="5" strokeDasharray="100 80 50 120 130" transition={{duration: 0.3}} />
              </motion.svg>
              
              <motion.div
                  className="absolute w-[30%] h-[30%]"
                  style={{ background: orbGradient, borderRadius: '50%' }}
                  animate={{
                      scale: isListening || isSpeaking ? 1.1 : 1,
                      boxShadow: orbBoxShadow,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, duration: 0.3 }}
              />
          </motion.div>

          <div className="text-center mt-8 min-h-[6rem] flex flex-col items-center justify-center w-full max-w-2xl px-4">
              <AnimatePresence mode="wait">
                  <motion.div
                      key={isLoading ? 'loader' : (aiResponse + aiResponseSource + generatedImageUrl)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex flex-col items-center"
                  >
                      {isLoading ? (
                          <p className="text-lg" style={{ color: interactiveIconColor }}>
                            {appMode === 'image' ? 'Generating' : 'Thinking'}{dots}
                          </p>
                      ) : isListening ? (
                          <p className="text-lg" style={{ color: interactiveIconColor }}>Listening{dots}</p>
                      ) : (
                        <>
                          {generatedImageUrl && (
                            <div className="relative mb-4 rounded-lg overflow-hidden border-2 w-[200px] h-[200px]" style={{ borderColor: 'orangered' }}>
                              <Image src={generatedImageUrl} alt="Generated image" layout="fill" className="object-cover" />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-2 text-center">
                                  <p className="text-white text-xs font-mono">Edena.AI</p>
                              </div>
                            </div>
                          )}
                          {aiResponse ? (
                              <ScrollArea className="h-auto max-h-56 w-full rounded-md p-4">
                                {aiResponseSource && aiResponseSource !== 'Img' && (
                                    <p className="text-sm text-cyan-400/70 mb-2 font-mono text-center">[{aiResponseSource}]</p>
                                )}
                                <p className="text-lg text-center whitespace-pre-wrap">{isAngry && '💢 '}{isBlushing && '😊 '}{aiResponse}</p>
                              </ScrollArea>
                          ) : !generatedImageUrl ? (
                              <p className="text-gray-400">Click the orb to start a voice command.</p>
                          ) : null}
                        </>
                      )}
                  </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIConsciousnessPage;

    