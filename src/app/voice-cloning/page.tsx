'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Mic, Play, Loader2, Wand2 } from 'lucide-react';
import { cloneVoice } from '@/ai/flows/voice-clone';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function VoiceCloningPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('Sir, I have replicated the voice. The synthesis is now complete.');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an audio file smaller than 5MB.",
        });
        return;
      }
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!audioFile) {
      toast({
        variant: "destructive",
        title: "No audio file selected",
        description: "Please upload an audio sample to clone.",
      });
      return;
    }
    if (!textToSpeak) {
      toast({
        variant: "destructive",
        title: "No text provided",
        description: "Please enter the text you want the AI to speak.",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedAudio(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioFile);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const result = await cloneVoice({
            audioDataUri: base64Audio,
            text: textToSpeak,
          });
          setGeneratedAudio(result.audioUrl);
          toast({
            title: "Voice Generated",
            description: "The audio has been successfully generated in the cloned voice.",
          });
        } catch (error) {
          console.error("AI voice cloning error:", error);
          toast({
            variant: "destructive",
            title: "AI Error",
            description: "The AI model failed to process the request. This is an experimental feature.",
          });
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      console.error("File processing error:", error);
      toast({
        variant: "destructive",
        title: "File Error",
        description: "There was an error processing the audio file.",
      });
      setIsLoading(false);
    }
  }, [audioFile, textToSpeak, toast]);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-body">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-jarvis text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
            EDENA
          </Link>
          <span className="text-xl text-gray-400">/</span>
          <h1 className="text-2xl font-headline">Voice Cloning</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto grid gap-8">
          <Card className="bg-card/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center"><Mic className="mr-2 text-purple-400" />1. Provide Voice Sample</CardTitle>
              <CardDescription>Upload a clear audio sample (MP3, WAV) of the voice you want to clone. Max 5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2" /> Upload Audio
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="audio/mp3,audio/wav"
                />
                {audioFileName && <p className="text-sm text-muted-foreground">{audioFileName}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-purple-500/30">
            <CardHeader>
              <CardTitle>2. Enter Text to Synthesize</CardTitle>
              <CardDescription>Provide the text you want the cloned voice to speak.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                placeholder="Enter text here..."
                className="min-h-[120px] bg-background/50 text-base"
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerateClick}
              disabled={isLoading || !audioFile || !textToSpeak}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 transition-opacity text-white text-lg px-8 py-6"
            >
              {isLoading ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <Wand2 className="mr-2" />
              )}
              Generate Voice
            </Button>
          </div>

          {generatedAudio && (
            <Card className="bg-card/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center"><Play className="mr-2 text-purple-400" />Result</CardTitle>
                <CardDescription>Listen to the generated audio below.</CardDescription>
              </CardHeader>
              <CardContent>
                <audio controls src={generatedAudio} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
