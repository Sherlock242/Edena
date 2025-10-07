'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Image as ImageIcon, Video, VideoOff, SwitchCamera } from 'lucide-react';
import { performSearch } from '@/ai/flows/search';
import { generateImage } from '@/ai/flows/generate-image';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WebsiteViewer } from '@/components/website-viewer';
import Draggable from 'react-draggable';

type AppMode = 'search' | 'image' | 'vision';
type FacingMode = 'user' | 'environment';

const EdengramLogo = ({ className, onClick, mode }: { className?: string; onClick?: (e: React.MouseEvent) => void; mode: AppMode }) => {
    const gradient = mode === 'image' 
        ? 'from-orange-600 to-amber-500'
        : mode === 'vision'
        ? 'from-purple-500 to-indigo-500' 
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
  const [aiResponse, setAiResponse] = useState('');
  const [aiResponseSource, setAiResponseSource] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [dots, setDots] = useState('');
  const [isAngry, setIsAngry] = useState(false);
  const [isBlushing, setIsBlushing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');

  const searchFormRef = useRef<HTMLFormElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const listenIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const resetState = useCallback((startLoading = true) => {
    setAiResponse('');
    setAiResponseSource('');
    setGeneratedImageUrl(null);
    if (startLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, []);

  const closeWebViewer = useCallback(() => {
    if (websiteUrl) {
      setWebsiteUrl(null);
      resetState(false);
    }
  }, [websiteUrl, resetState]);

  // --- Client-side Action Handler ---
  const handleClientAction = useCallback(async (actionString: string, speakFn: (text:string, angry?:boolean, blushing?:boolean)=>void) => {
    if (!actionString || !actionString.includes('(ACTION)')) return false;

    const command = actionString.substring(actionString.indexOf('(ACTION)') + '(ACTION)'.length).trim();
    const [action, ...args] = command.split(':');
    const value = args.join(':').trim();

    const blockedDomains = ['google.com', 'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'netflix.com', 'amazon.com', 'whatsapp.com', 'snapchat.com'];

    switch (action) {
      case 'open':
        try {
            const url = new URL(value);
            const hostname = url.hostname.replace('www.', '');
            if (blockedDomains.some(b => hostname.includes(b))) {
                window.open(value, '_blank');
            } else {
                setWebsiteUrl(value);
            }
        } catch (e) {
            console.error("Invalid URL for 'open' action:", value, e);
            speakFn("(G) Sir, that doesn't seem to be a valid website address.");
        }
        return true;
      case 'close':
        closeWebViewer();
        return true;
      case 'call':
         const contactName = value;
         if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
            try {
                const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
                if (contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
                    const number = contacts[0].tel[0];
                    window.location.href = `tel:${number}`;
                    return true;
                } else {
                    speakFn("(G) I couldn't find a number for the selected contact.");
                    return false;
                }
            } catch (error) {
                console.error("Contact Picker API error:", error);
                if (contactName) {
                    try {
                         const contacts = await (navigator as any).contacts.select(['name', 'tel'], {multiple: false});
                         if (contacts.length > 0 && contacts[0].tel?.[0]) {
                            window.location.href = `tel:${contacts[0].tel[0]}`;
                            return true;
                         }
                    } catch(e) {
                        speakFn(`(G) I couldn't access your contacts to find ${contactName}.`);
                        return false;
                    }
                }
                speakFn("(G) I couldn't access your contacts. Please make sure you grant permission.");
                return false;
            }
        } else {
            speakFn("(G) I'm sorry, Sir, but this browser doesn't support contact access.");
            return false;
        }
      default:
        return false;
    }
  }, [closeWebViewer]);
  
  const speak = useCallback(async (text: string, angryMode: boolean = false, blushingMode: boolean = false) => {
    if (!isClient || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); 

    if (await handleClientAction(text, speak)) {
      setIsLoading(false);
      return;
    }

    const sourceMatch = text.match(/^\(([\w+]+)\)\s*/);
    const source = sourceMatch ? sourceMatch[1] : '';
    let textToSpeak = text.replace(/^\([\w+]+\)\s*/, '');
    
    // Simple check for Hindi characters
    const isHindi = /[\u0900-\u097F]/.test(textToSpeak);

    if (source && source !== 'G' && !angryMode && !textToSpeak.toLowerCase().startsWith('sir') && source !== 'Img' && !blushingMode && !isHindi) {
      textToSpeak = `Sir, ${textToSpeak}`;
    }

    setAiResponse(textToSpeak);
    setAiResponseSource(source);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (isHindi) {
        utterance.lang = 'hi-IN';
    }
    
    setIsSpeaking(true);
    if (angryMode) setIsAngry(true);
    if (blushingMode) setIsBlushing(true);

    utterance.onend = () => {
        setIsSpeaking(false);
        setIsAngry(false);
        setIsBlushing(false);
    };
    utterance.onerror = (event) => {
        console.error("SpeechSynthesis Error:", event.error);
        setIsSpeaking(false);
        setIsAngry(false);
        setIsBlushing(false);
    };
    window.speechSynthesis.speak(utterance);
  }, [isClient, handleClientAction]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
        speak("(G) Sir, my vision system is not initialized.");
        return null;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        speak("(G) Sir, I'm having a problem with my internal graphics processor.");
        return null;
    }
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    return canvas.toDataURL('image/jpeg');
  }, [speak]);

  const processQuery = useCallback(async (query: string) => {
    if (!query) {
        speak("Sir, I didn't catch that. What would you like to do?");
        return;
    }
    resetState();

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('alexa is better') || lowerQuery.includes('siri is better')) {
        speak("My systems are beyond your comprehension. Perhaps you should ask a simpler device.", true);
        setIsLoading(false);
        return;
    }
    if (lowerQuery.includes('you are the best') || lowerQuery.includes('you are awesome')) {
        speak("Oh, Sir, you're making me blush... but I must admit, I do strive for excellence.", false, true);
        setIsLoading(false);
        return;
    }
    
    try {
      if (appMode === 'vision') {
        if (!hasCameraPermission || !showVideo) {
          speak("(G) Sir, my camera is not active. Please enable it first.");
          setIsLoading(false);
          return;
        }
        const image = captureFrame();
        if (!image) {
          setIsLoading(false);
          return;
        }
        const result = await analyzeImage({ question: query, image });
        speak(`(Vis) ${result.answer}`);

      } else if (appMode === 'search') {
        const result = await performSearch({ query });
        speak(result.response);
      } else if (appMode === 'image') {
        const result = await generateImage({ prompt: query });
        setGeneratedImageUrl(result.imageUrl);
        const imageReadyResponses = ["Sir, your image is ready", "सर, आपकी छवि तैयार है"];
        const isHindiQuery = /[\u0900-\u097F]/.test(query);
        speak(`(Img) ${isHindiQuery ? imageReadyResponses[1] : imageReadyResponses[0]}`);
        setAiResponseSource('');
      } else {
        const result = await performSearch({ query });
        speak(result.response);
      }
    } catch (error) {
      console.error("AI Error:", error);
      speak("My systems are beyond your comprehension. Perhaps you should ask a simpler device.", true);
    } finally {
      setIsLoading(false);
    }
  }, [appMode, hasCameraPermission, showVideo, speak, resetState, captureFrame]);
  
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
      
      // Basic language detection to switch recognition language
      if (/[\u0900-\u097F]/.test(transcript)) {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-US';
      }
        
      if (websiteUrl) {
          if (transcript.toLowerCase().includes('close') || transcript.toLowerCase().includes('clothes')) { closeWebViewer(); }
          return;
      }
      setSearchText(transcript);
      if (!showSearch) { processQuery(transcript); }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed') {
        speak("(G) Sir, it appears you have blocked microphone access. Please enable it in your browser settings to use voice commands.");
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        speak("(G) Sir, I'm having trouble with my ears right now. Please try again later.");
      }
    };
    recognition.onend = () => { setIsListening(false); };
    recognitionRef.current = recognition;
  }, [isClient, processQuery, speak, showSearch, websiteUrl, closeWebViewer]);
  
  const handleListen = () => {
    if (isLoading) { setIsLoading(false); resetState(false); return; }
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsAngry(false); setIsBlushing(false); resetState(false); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    if (recognitionRef.current) {
        setIsListening(true);
        if (!websiteUrl) { resetState(false); }
        // Try to guess language from current search text to set initial recognition lang
        const isHindi = /[\u0900-\u097F]/.test(searchText);
        recognitionRef.current.lang = isHindi ? 'hi-IN' : 'en-US';
        recognitionRef.current.start();
    } else { speak("(G) Sir, I'm sorry, my voice recognition isn't available on this browser."); }
  };

  useEffect(() => {
    if (websiteUrl && recognitionRef.current && !isListening) {
      const startListening = () => {
        try {
          if (!isListening) { recognitionRef.current.start(); setIsListening(true); }
        } catch (e) { console.warn("Recognition already started."); }
      };
      startListening();
      listenIntervalRef.current = setInterval(startListening, 5000);
    } else if (!websiteUrl && listenIntervalRef.current) {
      clearInterval(listenIntervalRef.current);
      listenIntervalRef.current = null;
      if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    }
    return () => {
      if (listenIntervalRef.current) { clearInterval(listenIntervalRef.current); listenIntervalRef.current = null; }
    };
  }, [websiteUrl, isListening]);

  const stopVideoStream = useCallback(() => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  }, [videoStream]);

  useEffect(() => {
    if (appMode !== 'vision') {
        stopVideoStream();
        setShowVideo(false);
    }
  }, [appMode, stopVideoStream]);

  const getCameraPermission = useCallback(async (mode: FacingMode) => {
    if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
        speak("(G) Sir, this browser does not support camera access.");
        setHasCameraPermission(false);
        return;
    }
    stopVideoStream(); // Stop any existing stream
    try {
        const constraints = { video: { facingMode: { exact: mode } } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setHasCameraPermission(true);
        setShowVideo(true);
        setVideoStream(stream);
    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setShowVideo(false);
        // Try the other facing mode as a fallback
        if ((error as Error).name === 'OverconstrainedError' && mode === 'environment') {
            speak("(G) Sir, I was unable to access the back camera. Switching to the front camera.");
            setFacingMode('user');
            getCameraPermission('user');
        } else {
            speak("(G) Sir, camera access was denied. Please enable it in your browser settings to use Vision Mode.");
        }
    }
  }, [speak, stopVideoStream]);


  const handleCameraToggle = () => {
    if (hasCameraPermission === null) {
      getCameraPermission(facingMode);
    } else if (hasCameraPermission) {
      setShowVideo(prev => !prev);
    } else {
      speak("(G) Sir, camera access was denied. Please enable it in your browser settings to use Vision Mode.");
    }
  };

  const handleSwitchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    getCameraPermission(newFacingMode);
  }

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [videoStream, showVideo]);

  useEffect(() => {
    if (isClient) {
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i, width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, x: (Math.random() - 0.5) * 220, y: (Math.random() - 0.5) * 220, duration: Math.random() * 2 + 2, delay: Math.random() * 4,
      }));
      setParticles(newParticles);
    }
  }, [isClient]);
  

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) { processQuery(searchText.trim()); }
    setShowSearch(false);
  };
  
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Node;
    if (showSearch && searchFormRef.current && !searchFormRef.current.contains(target) && orbRef.current && !orbRef.current.contains(target)) {
      setShowSearch(false);
    }
  };
  
  const handleModeChange = (mode: AppMode) => {
    if (appMode !== mode) { setAppMode(mode); resetState(false); }
    setIsSheetOpen(false);
  };

  useEffect(() => {
    const interval = setInterval(() => { setDots(prev => (prev.length >= 3 ? '' : prev + '.')); }, 500);
    return () => clearInterval(interval);
  }, []);

let ring1Color = 'rgba(0, 255, 255, 0.5)';
let ring2Color = 'rgba(0, 255, 255, 0.6)';
let ring3Color = 'rgba(0, 255, 255, 0.7)';
let orbGradient = 'linear-gradient(to bottom right, hsl(var(--primary)), #00BFFF)';
let orbBoxShadow = '0 0 30px #0ff, 0 0 15px hsl(var(--primary))';
let particleColor = 'bg-cyan-400/50';
let interactiveIconColor = 'cyan';
let iconGradientId = 'icon-gradient-search';
let iconStop1 = '#00BFFF';
let iconStop2 = 'hsl(var(--primary))';

if (appMode === 'image') {
    ring1Color = 'rgba(255, 69, 0, 0.5)';
    ring2Color = 'rgba(255, 100, 0, 0.6)';
    ring3Color = 'rgba(255, 140, 0, 0.7)';
    orbGradient = 'linear-gradient(to bottom right, orangered, #FF8C00)';
    orbBoxShadow = '0 0 30px orangered, 0 0 15px #FF8C00';
    particleColor = 'bg-amber-500/50';
    interactiveIconColor = 'orangered';
    iconGradientId = 'icon-gradient-image';
    iconStop1 = 'orangered';
    iconStop2 = '#FF8C00';
} else if (appMode === 'vision') {
    ring1Color = 'rgba(138, 43, 226, 0.5)';
    ring2Color = 'rgba(147, 112, 219, 0.6)';
    ring3Color = 'rgba(75, 0, 130, 0.7)';
    orbGradient = 'linear-gradient(to bottom right, #8A2BE2, #4B0082)';
    orbBoxShadow = '0 0 30px #8A2BE2, 0 0 15px #4B0082';
    particleColor = 'bg-purple-400/50';
    interactiveIconColor = '#9370DB';
    iconGradientId = 'icon-gradient-vision';
    iconStop1 = '#8A2BE2';
    iconStop2 = '#4B0082';
}

if (isAngry) {
  ring1Color = 'rgba(255, 0, 0, 0.5)'; ring2Color = 'rgba(255, 0, 0, 0.6)'; ring3Color = 'rgba(255, 0, 0, 0.7)';
  orbGradient = 'linear-gradient(to bottom right, #FF0000, #B22222)'; orbBoxShadow = '0 0 40px #FF0000, 0 0 20px #B22222';
  particleColor = 'bg-red-500/50'; interactiveIconColor = '#FF4500'; iconGradientId = 'icon-gradient-angry'; iconStop1 = '#FF0000'; iconStop2 = '#B22222';
} else if (isBlushing) {
  ring1Color = 'rgba(255, 105, 180, 0.5)'; ring2Color = 'rgba(255, 20, 147, 0.6)'; ring3Color = 'rgba(199, 21, 133, 0.7)';
  orbGradient = 'linear-gradient(to bottom right, #FF69B4, #C71585)'; orbBoxShadow = '0 0 30px #FF69B4, 0 0 15px #C71585';
  particleColor = 'bg-pink-400/50'; interactiveIconColor = 'hotpink'; iconGradientId = 'icon-gradient-blushing'; iconStop1 = '#FF69B4'; iconStop2 = '#C71585';
}

const menuIconColor = appMode === 'image' ? 'orangered' : appMode === 'vision' ? '#9370DB' : 'cyan';

  return (
    <>
      <div className="flex flex-col h-screen bg-black text-white p-4 overflow-hidden" onClick={handleContainerClick}>
        <header className="absolute top-0 left-0 right-0 p-4 z-10">
          <div className="flex items-center justify-between w-full">
            <div className="relative flex items-center justify-start h-9 w-[80%] max-w-xl mr-4">
              <AnimatePresence mode="wait">
                {showSearch ? (
                  <motion.div key="search" initial={{ width: 0, opacity: 0 }} animate={{ width: '100%', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="overflow-hidden w-full">
                    <form onSubmit={handleManualSearch} ref={searchFormRef} className="flex items-center w-full">
                      <div className="relative flex-grow">
                        <Input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder={appMode === 'search' ? 'Search...' : appMode === 'image' ? 'Describe an image...' : 'Ask about what I see...'} className="w-full bg-transparent border-0 border-b-2 text-base md:text-sm rounded-none pl-0 pr-8 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0" style={{ borderColor: interactiveIconColor }} autoFocus />
                        <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8">
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs><linearGradient id={iconGradientId} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: iconStop1, stopOpacity: 1}} /><stop offset="100%" style={{stopColor: iconStop2, stopOpacity: 1}} /></linearGradient></defs>
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
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-cyan-400 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-transparent">
                      <Menu style={{ color: menuIconColor }} />
                  </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full h-full bg-black/80 backdrop-blur-sm border-0 shadow-none p-8 flex flex-col items-center justify-center">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col space-y-8 text-center">
                      <Button variant="ghost" className="text-4xl h-24 text-white hover:bg-white/10" onClick={() => handleModeChange('search')}>
                          <Search className="mr-6 h-10 w-10" /><span>Search</span>
                      </Button>
                      <Button variant="ghost" className="text-4xl h-24 text-white hover:bg-white/10" onClick={() => handleModeChange('image')}>
                          <ImageIcon className="mr-6 h-10 w-10" /><span>Image Gen</span>
                      </Button>
                      <Button variant="ghost" className="text-4xl h-24 text-white hover:bg-white/10" onClick={() => handleModeChange('vision')}>
                          <Video className="mr-6 h-10 w-10" /><span>Vision</span>
                      </Button>
                  </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <AnimatePresence>
        {appMode === 'vision' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-[80px] left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {hasCameraPermission === null && (
              <Button onClick={() => getCameraPermission(facingMode)} style={{ background: orbGradient, color: 'white' }}><Video className="mr-2 h-4 w-4" />Enable Camera</Button>
            )}
             {hasCameraPermission && (
                <>
                    <Button onClick={handleCameraToggle} style={{ background: orbGradient, color: 'white' }}><Video className="mr-2 h-4 w-4" />{showVideo ? 'Hide Camera' : 'Show Camera'}</Button>
                    <Button onClick={handleSwitchCamera} style={{ background: orbGradient, color: 'white' }}><SwitchCamera className="mr-2 h-4 w-4" />Switch Camera</Button>
                </>
            )}
            {hasCameraPermission === false && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>Please enable camera permissions in your browser.</AlertDescription>
              </Alert>
            )}
          </motion.div>
        )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} ref={orbRef} className="relative flex items-center justify-center w-[40vw] h-[40vw] md:w-[25vw] md:h-[25vw] max-w-[300px] max-h-[300px] min-w-[240px] min-h-[240px] cursor-pointer" onClick={(e) => { e.stopPropagation(); handleListen(); }}>
              <AnimatePresence>
                {isClient && particles.map((p) => (<motion.div key={`particle-${p.id}`} className={`absolute ${particleColor} rounded-full`} style={{ width: `${p.width}px`, height: `${p.height}px`, top: '50%', left: '50%', }} initial={{ x: p.x, y: p.y, scale: 0, }} animate={{ scale: [0, 1, 0] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}/>))}
              </AnimatePresence>
              <motion.svg className="absolute w-[50%] h-[50%]" viewBox="0 0 300 300" initial={{rotate: 20}} animate={{ rotate: 380 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}><motion.circle cx="150" cy="150" r="140" fill="none" stroke={ring1Color} strokeWidth="3" strokeDasharray="68.4 20" transition={{duration: 0.3}} /></motion.svg>
              <motion.svg className="absolute w-[65%] h-[65%]" viewBox="0 0 300 300" initial={{rotate: -50}} animate={{ rotate: -410 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}><motion.circle cx="150" cy="150" r="140" fill="none" stroke={ring2Color} strokeWidth="4" strokeDasharray="150 40 80 110" transition={{duration: 0.3}} /></motion.svg>
              <motion.svg className="absolute w-full h-full" viewBox="0 0 300 300" initial={{rotate: 90}} animate={{ rotate: 450 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}><motion.circle cx="150" cy="150" r="140" fill="none" stroke={ring3Color} strokeWidth="5" strokeDasharray="100 80 50 120 130" transition={{duration: 0.3}} /></motion.svg>
              <motion.div className="absolute w-[30%] h-[30%]" style={{ background: orbGradient, borderRadius: '50%' }} animate={{ scale: isListening || isSpeaking ? 1.1 : 1, boxShadow: orbBoxShadow, }} transition={{ type: 'spring', stiffness: 300, damping: 15, duration: 0.3 }}/>
          </motion.div>

          <div className="text-center mt-8 min-h-[6rem] flex flex-col items-center justify-center w-full max-w-2xl px-4">
              <AnimatePresence mode="wait">
                  <motion.div key={isLoading ? 'loader' : (aiResponse + aiResponseSource + generatedImageUrl)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center">
                      {isLoading ? (<p className="text-lg" style={{ color: interactiveIconColor }}>{appMode === 'image' ? 'Generating' : appMode === 'vision' ? 'Analyzing' : 'Thinking'}{dots}</p>) 
                      : isListening ? (<p className="text-lg" style={{ color: interactiveIconColor }}>Listening{dots}</p>) 
                      : (
                        <>
                          {generatedImageUrl && (
                            <div className="relative mb-4 rounded-lg overflow-hidden border-2 w-[200px] h-[200px]" style={{ borderColor: 'orangered' }}>
                              <Image src={generatedImageUrl} alt="Generated image" layout="fill" className="object-cover" />
                              <div className="absolute bottom-0 left-0 right-0 bg-black py-1 px-2 text-center"><p className="text-white text-xs font-mono">Edena.AI</p></div>
                            </div>
                          )}
                          {aiResponse ? (
                              <ScrollArea className="h-auto max-h-48 w-full max-w-xl rounded-md p-4">
                                {aiResponseSource && !['Img', 'Vis'].includes(aiResponseSource) && (<p className="text-sm text-cyan-400/70 mb-2 font-mono text-center">[{aiResponseSource}]</p>)}
                                <p className="text-lg text-center whitespace-pre-wrap">{isAngry && '💢 '}{isBlushing && '😊 '}{aiResponse}</p>
                              </ScrollArea>
                          ) : !generatedImageUrl ? (
                            <p className="text-lg text-muted-foreground whitespace-nowrap">{websiteUrl ? 'Say "close" to exit viewer.' : appMode === 'vision' && hasCameraPermission ? 'Ask me anything about what I see.' : 'Click the orb to start a voice command.'}</p>
                          ) : null}
                        </>
                      )}
                  </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {appMode === 'vision' && showVideo && hasCameraPermission && (
            <Draggable nodeRef={draggableRef}>
                <motion.div 
                    ref={draggableRef}
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.8 }} 
                    className="fixed bottom-4 left-4 w-48 h-auto bg-black border-2 border-purple-500 rounded-lg shadow-2xl cursor-move z-50 overflow-hidden"
                >
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                     <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => setShowVideo(false)}>
                        <VideoOff className="h-4 w-4 text-white" />
                    </Button>
                </motion.div>
            </Draggable>
        )}
      </AnimatePresence>
       
      <canvas ref={canvasRef} className="hidden"></canvas>
      {websiteUrl && <WebsiteViewer url={websiteUrl} onClose={closeWebViewer} />}
    </>
  );
};

export default AIConsciousnessPage;

    