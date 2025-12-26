"use client"

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export type SavedVoice = {
    name: string;
    audioDataUri: string;
};

const STORAGE_KEY = 'edena-saved-voices';

export function useSavedVoices() {
    const [savedVoices, setSavedVoices] = useState<SavedVoice[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(STORAGE_KEY);
            if (item) {
                setSavedVoices(JSON.parse(item));
            }
        } catch (error) {
            console.error("Failed to load saved voices from localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Could not load voices',
                description: 'There was an error reading your saved voices from local storage.'
            });
        }
    }, [toast]);

    const saveVoicesToStorage = (voices: SavedVoice[]) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(voices));
        } catch (error) {
             console.error("Failed to save voices to localStorage", error);
             toast({
                variant: 'destructive',
                title: 'Could not save voices',
                description: 'Local storage might be full or unavailable.'
            });
        }
    }

    const addVoice = useCallback((newVoice: SavedVoice) => {
        let updatedVoices: SavedVoice[];
        setSavedVoices(currentVoices => {
            const voiceExists = currentVoices.some(v => v.name === newVoice.name);
            if (voiceExists) {
                // If voice with same name exists, update it
                updatedVoices = currentVoices.map(v => v.name === newVoice.name ? newVoice : v);
                 toast({
                    title: "Voice Updated",
                    description: `Voice profile "${newVoice.name}" has been updated.`
                });
            } else {
                // Otherwise, add the new voice
                updatedVoices = [...currentVoices, newVoice];
            }
            saveVoicesToStorage(updatedVoices);
            return updatedVoices;
        });

    }, [toast]);

    const deleteVoice = useCallback((voiceName: string) => {
        let updatedVoices: SavedVoice[];
        setSavedVoices(currentVoices => {
            updatedVoices = currentVoices.filter(v => v.name !== voiceName);
            saveVoicesToStorage(updatedVoices);
            return updatedVoices;
        });
        toast({
            title: 'Voice Deleted',
            description: `"${voiceName}" has been removed from your library.`,
        });
    }, [toast]);

    return { savedVoices, addVoice, deleteVoice };
}
