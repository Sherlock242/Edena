'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Loader2, ArrowLeft, Waves, Sparkles, AudioLines } from 'lucide-react';
import { cloneVoice } from '@/ai/flows/voice-clone';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

type RecordingState = 'idle' | 'recording' | 'processing' | 'finished';

const PREBUILT_VOICES = {
    'Male': [
        'Arcturus', 'Canopus', 'Spica', 'Hadar', 'Rigel',
    ],
    'Female': [
        'Achernar', 'Algenib', 'Antares', 'Capella', 'Deneb', 'Mirfak', 'Sirius', 'Vega',
    ]
}

export default function VoiceCloningPage() {
  const [textToSpeak, setTextToSpeak] = useState('Sir, I have replicated the voice. The synthesis is now complete.');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [dots, setDots] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  
  const handleGenerateClick = useCallback(async (audioDataUri?: string) => {
    if (!textToSpeak) {
      toast({ variant: 'destructive', title: 'No text provided', description: 'Please enter the text you want the AI to speak.' });
      return;
    }
    if (!audioDataUri && !selectedVoice) {
      toast({ variant: 'destructive', title: 'No voice source', description: 'Please record an audio sample or select a pre-built voice.' });
      return;
    }

    setRecordingState('processing');
    setGeneratedAudio(null);

    try {
      const result = await cloneVoice({
        audioDataUri: audioDataUri,
        text: textToSpeak,
        voiceName: selectedVoice ?? undefined,
      });
      
      setGeneratedAudio(result.audioUrl);
      
      toast({ title: 'Voice Generated', description: 'The audio has been successfully generated.' });
      setRecordingState('finished');

    } catch (error) {
      console.error('AI voice cloning error:', error);
      toast({ variant: 'destructive', title: 'AI Error', description: (error as Error).message || 'An unknown AI error occurred.' });
      setRecordingState('idle');
    }
  }, [textToSpeak, selectedVoice, toast]);

  const handleStartRecording = async () => {
    if (recordingState === 'recording') {
        mediaRecorderRef.current?.stop();
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: 'Media Not Supported', description: 'Your browser does not support microphone recording.' });
      return;
    }
    
    setSelectedVoice(null); // Clear pre-built voice selection when recording

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => { audioChunksRef.current.push(event.data); };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          handleGenerateClick(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecordingState('recording');
      setGeneratedAudio(null);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please enable microphone permissions in your browser settings.' });
    }
  };

  const handleOrbClick = () => {
    if (selectedVoice) {
      handleGenerateClick();
    } else {
      handleStartRecording();
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => { setDots(prev => (prev.length >= 3 ? '' : prev + '.')); }, 500);
    return () => clearInterval(interval);
  }, []);

  const orbState = recordingState === 'recording' || recordingState === 'processing';
  const orbGradient = orbState ? 'linear-gradient(to bottom right, #FF0000, #B22222)' : 'linear-gradient(to bottom right, #8A2BE2, #4B0082)';
  const orbBoxShadow = orbState ? '0 0 40px #FF0000, 0 0 20px #B22222' : '0 0 30px #8A2BE2, 0 0 15px #4B0082';
  const hasSelection = !!selectedVoice;

  return (
    <div className="flex flex-col h-screen bg-black text-white font-body overflow-hidden">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-jarvis text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
            EDENA
          </Link>
          <span className="text-xl text-gray-400">/</span>
          <h1 className="text-2xl font-headline">Voice Cloning Studio</h1>
        </div>
        <Button variant="ghost" asChild>
            <Link href="/"><ArrowLeft className="mr-2"/> Back to Edena</Link>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center">

            <motion.div 
                layout 
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative flex items-center justify-center w-[250px] h-[250px] cursor-pointer mb-8" 
                onClick={handleOrbClick}
            >
                <AnimatePresence>
                    {(recordingState === 'recording') && (
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        > <Waves className="w-full h-full text-red-500/50 animate-pulse-slow" /> </motion.div>
                    )}
                </AnimatePresence>

                <motion.div 
                    className="absolute w-[40%] h-[40%] rounded-full flex items-center justify-center" 
                    style={{ background: orbGradient, boxShadow: orbBoxShadow }} 
                    animate={{ scale: orbState || hasSelection ? 1.1 : 1 }} 
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                    {recordingState === 'idle' && !hasSelection && <Mic className="w-12 h-12 text-white/80" />}
                    {recordingState === 'idle' && hasSelection && <Sparkles className="w-12 h-12 text-white/80" />}
                    {recordingState === 'recording' && <MicOff className="w-12 h-12 text-white/80" />}
                    {recordingState === 'processing' && <Loader2 className="w-12 h-12 text-white/80 animate-spin" />}
                    {recordingState === 'finished' && <Play className="w-12 h-12 text-white/80" />}
                </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={recordingState + (selectedVoice || '')}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="min-h-[4rem] flex flex-col items-center justify-center"
                >
                    {recordingState === 'idle' && !selectedVoice && <p className="text-lg text-muted-foreground">Click orb to record voice sample.</p>}
                    {recordingState === 'idle' && selectedVoice && <p className="text-lg text-muted-foreground">Click orb to generate with "{selectedVoice}".</p>}
                    {recordingState === 'recording' && <p className="text-lg text-red-400">Recording{dots}</p>}
                    {recordingState === 'processing' && <p className="text-lg text-purple-400">Analyzing & Synthesizing{dots}</p>}
                    {recordingState === 'finished' && (
                        <div className="text-center">
                            <p className="text-lg text-green-400">Synthesis Complete!</p>
                            <p className="text-sm text-muted-foreground mt-1">Click orb to generate again or record new sample.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="w-full grid gap-6 mt-8">
                <Card className="bg-card/50 border-purple-500/30">
                    <CardHeader>
                    <CardTitle className="flex items-center"><AudioLines className="mr-2 h-5 w-5 text-purple-400"/>1. Choose Voice Source</CardTitle>
                    <CardDescription>Record a voice sample OR select a pre-built AI voice.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={(value) => { setSelectedVoice(value); setRecordingState('idle'); }} value={selectedVoice || ''}>
                            <SelectTrigger className="w-full bg-background/50 text-base" disabled={recordingState === 'recording' || recordingState === 'processing'}>
                                <SelectValue placeholder="Select a pre-built voice..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Female</SelectLabel>
                                    {PREBUILT_VOICES.Female.map(voice => <SelectItem key={voice} value={voice}>{voice}</SelectItem>)}
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectLabel>Male</SelectLabel>
                                    {PREBUILT_VOICES.Male.map(voice => <SelectItem key={voice} value={voice}>{voice}</SelectItem>)}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                         <div className="my-4 flex items-center text-sm text-muted-foreground">
                            <div className="flex-grow border-t border-muted-foreground/30"></div>
                            <div className="mx-4 flex-shrink-0">OR</div>
                            <div className="flex-grow border-t border-muted-foreground/30"></div>
                        </div>
                        <Button className="w-full" variant="outline" onClick={handleOrbClick} disabled={recordingState === 'processing' || !!selectedVoice}>
                            {recordingState === 'recording' ? <MicOff className="mr-2"/> : <Mic className="mr-2"/>}
                            {recordingState === 'recording' ? 'Stop Recording' : 'Record a Voice Sample'}
                        </Button>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-purple-500/30">
                    <CardHeader>
                    <CardTitle className="flex items-center"><Sparkles className="mr-2 h-5 w-5 text-purple-400"/>2. Enter Text & Generate</CardTitle>
                    <CardDescription>Provide the text to synthesize with the chosen voice.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Textarea
                        value={textToSpeak}
                        onChange={(e) => setTextToSpeak(e.target.value)}
                        placeholder="Enter text here..."
                        className="min-h-[100px] bg-background/50 text-base"
                        disabled={recordingState === 'recording' || recordingState === 'processing'}
                    />
                    </CardContent>
                </Card>
                
                <AnimatePresence>
                    {generatedAudio && recordingState === 'finished' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="bg-card/50 border-purple-500/30">
                            <CardHeader>
                                <CardTitle className="flex items-center"><Play className="mr-2 text-purple-400" />3. Result</CardTitle>
                                <CardDescription>Listen to the generated audio below.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <audio controls src={generatedAudio} className="w-full">
                                Your browser does not support the audio element.
                                </audio>
                            </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </main>
    </div>
  );
}
