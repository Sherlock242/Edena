'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Mic, Play, Loader2, Wand2, Save, Trash2, CheckCircle } from 'lucide-react';
import { cloneVoice } from '@/ai/flows/voice-clone';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSavedVoices, type SavedVoice } from '@/hooks/use-saved-voices';

export default function VoiceCloningPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('Sir, I have replicated the voice. The synthesis is now complete.');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceNameToSave, setVoiceNameToSave] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<SavedVoice | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { savedVoices, addVoice, deleteVoice } = useSavedVoices();

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
      setSelectedVoice(null); // Deselect saved voice if a new file is uploaded
      toast({
        title: "File Selected",
        description: `${file.name}`,
      });
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!audioFile && !selectedVoice) {
      toast({
        variant: "destructive",
        title: "No audio source",
        description: "Please upload an audio sample or select a saved voice.",
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

    const processAudio = async (audioDataUri: string) => {
        try {
          const result = await cloneVoice({
            audioDataUri: audioDataUri,
            text: textToSpeak,
          });
          setGeneratedAudio(result.audioUrl);
          setVoiceNameToSave(audioFileName.replace(/\.[^/.]+$/, "") || selectedVoice?.name || 'New Voice');
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
    
    if (selectedVoice) {
        processAudio(selectedVoice.audioDataUri);
    } else if (audioFile) {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioFile);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            await processAudio(base64Audio);
          };
          reader.onerror = () => {
             throw new Error("Error reading file.");
          }
        } catch (error) {
          console.error("File processing error:", error);
          toast({
            variant: "destructive",
            title: "File Error",
            description: "There was an error processing the audio file.",
          });
          setIsLoading(false);
        }
    }
  }, [audioFile, selectedVoice, textToSpeak, toast, audioFileName]);

  const handleSaveVoice = () => {
    if (!generatedAudio || !voiceNameToSave) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Voice',
        description: 'Please generate a voice and provide a name first.',
      });
      return;
    }
    addVoice({ name: voiceNameToSave, audioDataUri: generatedAudio });
    toast({
      title: 'Voice Saved',
      description: `"${voiceNameToSave}" has been added to your library.`,
    });
  };
  
  const handleSelectVoice = (voice: SavedVoice) => {
      setSelectedVoice(voice);
      setAudioFile(null);
      setAudioFileName('');
      toast({
          title: "Voice Selected",
          description: `Using "${voice.name}" as the voice sample.`
      });
  }


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
          
          {savedVoices.length > 0 && (
            <Card className="bg-card/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center"><Save className="mr-2 text-purple-400" />Saved Voices</CardTitle>
                <CardDescription>Select a previously saved voice to use for generation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                    {savedVoices.map((voice) => (
                        <div key={voice.name} className="flex items-center justify-between p-2 rounded-md bg-background/30">
                           <div className="flex items-center gap-4">
                             <p className="font-medium">{voice.name}</p>
                             {selectedVoice?.name === voice.name && (
                                <CheckCircle className="text-green-500 w-5 h-5" />
                             )}
                           </div>
                           <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost" onClick={() => handleSelectVoice(voice)}>Use</Button>
                                <audio src={voice.audioDataUri} controls className="h-8 max-w-[150px] md:max-w-xs"></audio>
                                <Button size="icon" variant="destructive" onClick={() => deleteVoice(voice.name)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                           </div>
                        </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center"><Mic className="mr-2 text-purple-400" />1. Provide Voice Sample</CardTitle>
              <CardDescription>Upload a new audio sample (MP3, WAV) or select a saved voice above. Max 5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2" /> Upload New Audio
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="audio/mp3,audio/mpeg,audio/wav"
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
              disabled={isLoading || (!audioFile && !selectedVoice) || !textToSpeak}
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
                <CardDescription>Listen to the generated audio below. You can save it for future use.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio controls src={generatedAudio} className="w-full">
                  Your browser does not support the audio element.
                </audio>
                <div className="flex items-center space-x-4">
                    <Input 
                        type="text"
                        placeholder="Enter voice name to save..."
                        value={voiceNameToSave}
                        onChange={(e) => setVoiceNameToSave(e.target.value)}
                        className="bg-background/50"
                    />
                    <Button onClick={handleSaveVoice} disabled={!voiceNameToSave}>
                        <Save className="mr-2" /> Save Voice
                    </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
