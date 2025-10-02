
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { Slot } from '@radix-ui/react-slot';

// --- Embedded UI Components ---

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white hover:no-underline hover:text-cyan-400 p-0 h-auto ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';


// --- Embedded Logo Component ---
const EdengramLogo = ({ className, onClick }: { className?: string; onClick?: (e: React.MouseEvent) => void }) => {
    return (
        <motion.h1
          className={`font-jarvis text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary cursor-pointer ${className}`}
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [aiResponse, setAiResponse] = useState("Hello there! How can I help you search for information today?");
  const [dots, setDots] = useState('');
  const [isAngry, setIsAngry] = useState(false);
  const [isBlushing, setIsBlushing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  const searchFormRef = useRef<HTMLFormElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const speak = useCallback((text: string, angryMode: boolean = false, blushingMode: boolean = false) => {
    // Mock functionality since speech synthesis is browser-dependent
    console.log(`Speaking: ${text}`);
    setIsSpeaking(true);
    setAiResponse(text);
    if (angryMode) setIsAngry(true);
    if (blushingMode) setIsBlushing(true);
    setTimeout(() => {
        setIsSpeaking(false);
        if (angryMode) setIsAngry(false);
        if (blushingMode) setIsBlushing(false);
    }, 3000); // Simulate speech duration
  }, []);

  const processQuery = useCallback(async (query: string) => {
    if (!query) {
        speak("I didn't catch that. What would you like to search for?");
        return;
    }
    setIsLoading(true);
    setAiResponse('');
    // Mock AI response
    setTimeout(() => {
        speak(`Searching for "${query}"... but I can't connect right now.`);
        setIsLoading(false);
    }, 1500);
  }, [speak]);

  const handleListen = () => {
    if (isSpeaking) {
        setIsSpeaking(false);
        setIsAngry(false);
        setIsBlushing(false);
        return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setAiResponse('');
    // Mock listening
    setTimeout(() => {
        setIsListening(false);
        processQuery("a sample voice query");
    }, 3000);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      processQuery(searchText.trim());
      setSearchText('');
    }
    setShowSearch(false);
  };
  
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Node;
    if (showSearch && searchFormRef.current && !searchFormRef.current.contains(target) && orbRef.current && !orbRef.current.contains(target)) {
      setShowSearch(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const ring1Color = isAngry ? 'rgba(255, 69, 0, 0.5)' : (isBlushing ? 'rgba(255, 182, 193, 0.5)' : 'rgba(0, 255, 255, 0.5)');
  const ring2Color = isAngry ? 'rgba(255, 69, 0, 0.6)' : (isBlushing ? 'rgba(255, 182, 193, 0.6)' : 'rgba(0, 255, 255, 0.6)');
  const ring3Color = isAngry ? 'rgba(255, 69, 0, 0.7)' : (isBlushing ? 'rgba(255, 182, 193, 0.7)' : 'rgba(0, 255, 255, 0.7)');
  const orbGradient = isAngry 
    ? 'linear-gradient(to bottom right, orangered, #FF8C00)' 
    : (isBlushing ? 'linear-gradient(to bottom right, #FFC0CB, #FFB6C1)' : 'linear-gradient(to bottom right, hsl(var(--primary)), #00BFFF)');
  const orbBoxShadow = isAngry
    ? '0 0 30px orangered, 0 0 15px #FF8C00'
    : (isBlushing ? '0 0 30px #FFC0CB, 0 0 15px #FFB6C1)' : '0 0 30px #0ff, 0 0 15px hsl(var(--primary))');

  return (
    <>
      <div className="flex flex-col h-screen bg-black text-white p-4 overflow-hidden" onClick={handleContainerClick}>
        <header className="absolute top-0 left-0 right-0 p-4 z-10">
          <div className="flex items-center justify-start w-full">
              <div className="relative flex items-center h-9 max-w-xs mr-4">
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
                            placeholder="Search..."
                            className="w-full bg-transparent border-0 border-b-2 border-cyan-400 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white pl-0 pr-8"
                            autoFocus
                          />
                          <Button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-cyan-400/70 hover:text-cyan-400 h-8 w-8">
                              <Search size={20} />
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="logo" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <EdengramLogo onClick={(e) => { e.stopPropagation(); setShowSearch(true); }}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                          className="absolute bg-cyan-400/50 rounded-full"
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
                  className="absolute w-[30%] h-[30%] rounded-full"
                  style={{ background: orbGradient }}
                  animate={{
                      scale: isListening || isSpeaking ? 1.1 : 1,
                      boxShadow: orbBoxShadow,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, duration: 0.3 }}
              />
          </motion.div>

          <div className="text-center mt-8 min-h-[4rem] flex items-center justify-center">
              <AnimatePresence mode="wait">
                  <motion.div
                      key={isLoading ? 'loader' : aiResponse}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-[90vw] md:w-auto"
                  >
                      {isLoading ? (
                          <p className="text-lg text-cyan-400">Thinking{dots}</p>
                      ) : isListening ? (
                          <p className="text-lg text-cyan-400">Listening{dots}</p>
                      ) : aiResponse ? (
                          <p className="text-lg text-center md:max-w-md">{aiResponse}</p>
                      ) : (
                          <p className="text-gray-400">Click the orb to start a voice search.</p>
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

    
