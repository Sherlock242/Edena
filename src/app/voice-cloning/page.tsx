'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Loader2, ArrowLeft, Waves, Sparkles, AudioLines, Upload, Save, Download, Trash2, Library } from 'lucide-react';
import { cloneVoice } from '@/ai/flows/voice-clone';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSavedVoices } from '@/hooks/use-saved-voices';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

type RecordingState = 'idle' | 'recording' | 'processing' | 'finished';

const PREBUILT_VOICES = {
    'Male': ['achird', 'alnilam', 'charon', 'fenrir', 'gacrux', 'iapetus', 'orus', 'puck', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar', 'sulafat', 'umbriel', 'zephyr', 'zubenelgenubi'],
    'Female': ['achernar', 'algenib', 'algieba', 'aoede', 'autonoe', 'callirrhoe', 'despina', 'enceladus', 'erinome', 'kore', 'laomedeia', 'leda', 'pulcherrima', 'vindemiatrix']
};

export default function VoiceCloningPage() {
  const [textToSpeak, setTextToSpeak] = useState('Sir, I have replicated the voice. The synthesis is now complete.');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [dots, setDots] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [userAudioDataUri, setUserAudioDataUri] = useState<string | null>(null);
  const [voiceNameToSave, setVoiceNameToSave] = useState('');

  const { savedVoices, addVoice, deleteVoice } = useSavedVoices();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleGenerateClick = useCallback(async () => {
    if (!textToSpeak) {
      toast({ variant: 'destructive', title: 'No text provided', description: 'Please enter the text you want the AI to speak.' });
      return;
    }
    if (!userAudioDataUri && !selectedVoice) {
      toast({ variant: 'destructive', title: 'No voice source', description: 'Please record, upload, or select a pre-built voice.' });
      return;
    }

    setRecordingState('processing');
    setGeneratedAudio(null);

    try {
      const result = await cloneVoice({
        audioDataUri: userAudioDataUri ?? undefined,
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
  }, [textToSpeak, selectedVoice, userAudioDataUri, toast]);

  const processAndSetAudio = (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      setUserAudioDataUri(base64Audio);
      toast({ title: 'Audio Sample Ready', description: 'Your voice sample has been loaded and is ready for generation.' });
      setRecordingState('idle');
      setSelectedVoice(null); // Clear pre-built voice selection
    };
     reader.onerror = () => {
        console.error("Error reading audio data");
        toast({ variant: 'destructive', title: 'Audio Read Error', description: 'There was an issue processing your audio.' });
        setRecordingState('idle');
    }
  }

  const handleStartRecording = async () => {
    if (recordingState === 'recording') {
        mediaRecorderRef.current?.stop();
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: 'Media Not Supported', description: 'Your browser does not support microphone recording.' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => { audioChunksRef.current.push(event.data); };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAndSetAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecordingState('recording');
      setGeneratedAudio(null);
      setUserAudioDataUri(null);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please enable microphone permissions in your browser settings.' });
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUserAudioDataUri(null);
    setRecordingState('processing');
    processAndSetAudio(file);
    event.target.value = ''; // Reset file input
  }

  const handleOrbClick = () => {
    if (recordingState === 'recording') {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (recordingState === 'processing') return;

    if (userAudioDataUri || selectedVoice) {
      handleGenerateClick();
    } else {
      handleStartRecording();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => { setDots(prev => (prev.length >= 3 ? '' : prev + '.')); }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSaveVoice = () => {
    if (!voiceNameToSave.trim()) {
        toast({ title: 'Invalid Name', description: 'Please enter a name for the voice profile.', variant: 'destructive' });
        return;
    }
    if (!userAudioDataUri) {
        toast({ title: 'No Audio Sample', description: 'You can only save a recorded or uploaded voice sample.', variant: 'destructive' });
        return;
    }
    addVoice({ name: voiceNameToSave, audioDataUri: userAudioDataUri });
    toast({ title: 'Voice Saved', description: `Voice profile "${voiceNameToSave}" has been saved to your library.` });
    setVoiceNameToSave('');
  };

  const handleDownloadAudio = () => {
    if (!generatedAudio) return;
    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = `edena_tts_${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSelectSavedVoice = (voiceName: string) => {
    const voice = savedVoices.find(v => v.name === voiceName);
    if (voice) {
        setUserAudioDataUri(voice.audioDataUri);
        setSelectedVoice(null); // Unselect any pre-built voice
        toast({ title: 'Voice Loaded', description: `Voice profile "${voiceName}" is ready for generation.`});
    }
  };

  const orbState = recordingState === 'recording' || recordingState === 'processing';
  const orbGradient = orbState ? 'linear-gradient(to bottom right, #FF0000, #B22222)' : 'linear-gradient(to bottom right, #8A2BE2, #4B0082)';
  const orbBoxShadow = orbState ? '0 0 40px #FF0000, 0 0 20px #B22222' : '0 0 30px #8A2BE2, 0 0 15px #4B0082';
  const canGenerate = !!userAudioDataUri || !!selectedVoice;

  return (
    <div className="flex flex-col h-screen bg-black text-white font-body overflow-hidden">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-jarvis text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
            EDENA
          </Link>
          <span className="text-xl text-gray-400">/</span>
          <h1 className="text-xl font-headline">Voice Cloning</h1>
        </div>
        <Button variant="ghost" asChild size="icon">
            <Link href="/"><ArrowLeft /></Link>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-4xl flex flex-col items-center text-center py-8">

            <motion.div 
                layout 
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative flex items-center justify-center w-[250px] h-[250px] cursor-pointer mb-8 shrink-0" 
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
                    animate={{ scale: orbState || canGenerate ? 1.1 : 1 }} 
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                    {!canGenerate && recordingState === 'idle' && <Mic className="w-12 h-12 text-white/80" />}
                    {canGenerate && recordingState === 'idle' && <Sparkles className="w-12 h-12 text-white/80" />}
                    {recordingState === 'recording' && <MicOff className="w-12 h-12 text-white/80" />}
                    {recordingState === 'processing' && <Loader2 className="w-12 h-12 text-white/80 animate-spin" />}
                    {recordingState === 'finished' && <Play className="w-12 h-12 text-white/80" />}
                </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={recordingState}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="min-h-[4rem] flex flex-col items-center justify-center"
                >
                    {recordingState === 'idle' && !canGenerate && <p className="text-lg text-muted-foreground">Click orb to record a voice sample.</p>}
                    {recordingState === 'idle' && canGenerate && <p className="text-lg text-muted-foreground">Ready to generate. Click the orb.</p>}
                    {recordingState === 'recording' && <p className="text-lg text-red-400">Recording{dots}</p>}
                    {recordingState === 'processing' && <p className="text-lg text-purple-400">Analyzing & Synthesizing{dots}</p>}
                    {recordingState === 'finished' && (
                        <div className="text-center">
                            <p className="text-lg text-green-400">Synthesis Complete!</p>
                            <p className="text-sm text-muted-foreground mt-1">Click orb to generate again or provide a new sample.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="w-full grid gap-6 mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-card/50 border-purple-500/30">
                        <CardHeader>
                        <CardTitle className="flex items-center"><AudioLines className="mr-2 h-5 w-5 text-purple-400"/>1. Choose Voice Source(s)</CardTitle>
                        <CardDescription>Use a pre-built voice, your own sample, or both for complex cloning.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Select onValueChange={(value) => setSelectedVoice(value === 'none' ? null : value)} value={selectedVoice || 'none'}>
                                <SelectTrigger className="w-full bg-background/50 text-base">
                                    <SelectValue placeholder="Select a pre-built target voice... (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Clone from sample only)</SelectItem>
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
                            <div className="flex items-center text-sm text-muted-foreground">
                                <div className="flex-grow border-t border-muted-foreground/30"></div>
                                <div className="mx-4 flex-shrink-0">OR</div>
                                <div className="flex-grow border-t border-muted-foreground/30"></div>
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <Button className="w-full" variant="outline" onClick={handleStartRecording} disabled={recordingState === 'processing'}>
                                {recordingState === 'recording' ? <MicOff className="mr-2"/> : <Mic className="mr-2"/>}
                                {recordingState === 'recording' ? 'Stop Recording' : 'Record Sample'}
                            </Button>
                            <Button className="w-full" variant="outline" onClick={handleUploadClick} disabled={recordingState !== 'idle'}>
                                <Upload className="mr-2"/>
                                Upload Sample
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/50 border-purple-500/30">
                        <CardHeader>
                            <CardTitle className="flex items-center"><Library className="mr-2 h-5 w-5 text-purple-400" />Saved Voice Library</CardTitle>
                            <CardDescription>Select a previously saved voice profile to use for generation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {savedVoices.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {savedVoices.map(voice => (
                                        <div key={voice.name} className="flex items-center justify-between bg-background/50 p-2 rounded-md">
                                            <button className="text-left flex-grow hover:text-purple-400" onClick={() => handleSelectSavedVoice(voice.name)}>
                                                {voice.name}
                                            </button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the "{voice.name}" voice profile. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteVoice(voice.name)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ))}
                                </div>
                           ) : (
                               <p className="text-sm text-muted-foreground text-center py-8">No saved voices yet. Save a generated voice to start your library.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
                <Card className="bg-card/50 border-purple-500/30">
                    <CardHeader>
                    <CardTitle className="flex items-center"><Sparkles className="mr-2 h-5 w-5 text-purple-400"/>2. Enter Text & Generate</CardTitle>
                    <CardDescription>Provide the text to synthesize with the chosen voice configuration.</CardDescription>
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
                                <CardDescription>Listen, save the voice profile, or download the audio file.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <audio controls src={generatedAudio} className="w-full">
                                Your browser does not support the audio element.
                                </audio>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" disabled={!userAudioDataUri}>
                                                <Save className="mr-2" /> Save Voice Profile
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Save Voice Profile</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Give this voice a name. This will save the source audio sample to your browser's local storage for later use.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <Input
                                                placeholder="e.g., 'My Morning Voice'"
                                                value={voiceNameToSave}
                                                onChange={(e) => setVoiceNameToSave(e.target.value)}
                                            />
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleSaveVoice}>Save</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <Button variant="outline" onClick={handleDownloadAudio}>
                                        <Download className="mr-2" /> Download .wav file
                                    </Button>
                                </div>
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
