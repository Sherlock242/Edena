
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// EdengramLogo component is now defined directly inside this file
const EdengramLogo = ({ className }: { className?: string }) => {
    return (
        <svg 
            viewBox="0 0 100 100" 
            className={cn("h-16 w-16", className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#8A2BE2', stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor: '#FF1493', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor: '#00BFFF', stopOpacity:1}} />
                </linearGradient>
            </defs>
            <motion.path 
                d="M 20 20 L 80 20 L 80 80 L 20 80 Z" 
                stroke="url(#grad1)" 
                strokeWidth="8"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
             <motion.path 
                d="M 35 35 L 65 35 L 65 65 L 35 65 Z" 
                stroke="url(#grad1)" 
                strokeWidth="6"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            />
        </svg>
    )
};


const HomePage = () => {
  // All the necessary CSS styles are embedded here
  const pageStyles = `
    body {
      font-family: Arial, Helvetica, sans-serif;
    }
    :root {
      --background: 0 0% 0%;
      --foreground: 0 0% 100%;
      --card: 240 4% 9%;
      --card-foreground: 0 0% 100%;
      --popover: 240 4% 9%;
      --popover-foreground: 0 0% 100%;
      --primary: 260 85% 60%;
      --primary-foreground: 0 0% 100%;
      --secondary: 220 20% 15%;
      --secondary-foreground: 0 0% 100%;
      --muted: 240 4% 18%;
      --muted-foreground: 0 0% 63%;
      --accent: 260 85% 60%;
      --accent-foreground: 0 0% 100%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 240 4% 25%;
      --input: 240 4% 25%;
      --ring: 260 85% 60%;
      --radius: 0.5rem;
    }
    .dark {
      --background: 0 0% 0%;
      --foreground: 0 0% 100%;
      --card: 240 4% 9%;
      --card-foreground: 0 0% 100%;
      --popover: 240 4% 9%;
      --popover-foreground: 0 0% 100%;
      --primary: 260 85% 60%;
      --primary-foreground: 0 0% 100%;
      --secondary: 220 20% 15%;
      --secondary-foreground: 0 0% 100%;
      --muted: 240 4% 18%;
      --muted-foreground: 0 0% 63%;
      --accent: 260 85% 60%;
      --accent-foreground: 0 0% 100%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 0% 98%;
      --border: 240 4% 25%;
      --input: 240 4% 25%;
      --ring: 260 85% 60%;
    }
    * {
      border-color: hsl(var(--border));
    }
    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    .font-jarvis {
        font-family: 'Orbitron', sans-serif;
    }
  `;

  return (
    <>
      <style>{pageStyles}</style>
      <div className="flex flex-col h-screen bg-background text-foreground p-4 overflow-hidden items-center justify-center">
          <header className="absolute top-0 left-0 right-0 p-4 z-10">
              <div className="flex items-center justify-between w-full">
                  <h1 className="font-jarvis text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary">
                      EDENA
                  </h1>
                  <Button asChild variant="link" className="text-white hover:no-underline hover:text-cyan-400 transition-colors duration-300 p-0 h-auto">
                      <Link href="/login">
                          Sign In
                      </Link>
                  </Button>
              </div>
          </header>

          <motion.div
              className="flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
          >
              <EdengramLogo className="h-24 w-24 mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Edengram</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Your journey to creating and sharing interactive and expressive content starts here.
              </p>
              <Button asChild size="lg">
                  <Link href="/mood">
                      Get Started
                  </Link>
              </Button>
          </motion.div>
      </div>
    </>
  );
};

export default HomePage;
