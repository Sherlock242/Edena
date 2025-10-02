'use client';

import React, { useState, useRef, MouseEvent, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { suggestRelatedConcepts } from '@/ai/flows/suggest-related-concepts';

import type { CanvasElement, Tool } from '@/lib/types';
import { Header } from './header';
import { Toolbar } from './toolbar';
import { Canvas } from './canvas';

export function IdeaCanvas() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'text') {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const newElement: CanvasElement = {
        id: `el_${Date.now()}`,
        type: 'text',
        x: e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0),
        y: e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0),
        width: 150,
        height: 50,
        content: 'New idea...',
        isEditing: true,
      };
      setElements((prev) => [...prev, newElement]);
      setSelectedElementId(newElement.id);
      setSelectedTool('select');
    } else {
      if (e.target === canvasRef.current) {
        setSelectedElementId(null);
      }
    }
  };

  const updateElement = useCallback((id: string, newProps: Partial<CanvasElement>) => {
    setElements((prev) => prev.map(el => (el.id === id ? { ...el, ...newProps } : el)));
  }, []);

  const selectElement = useCallback((id: string) => {
    setSelectedElementId(id);
    setElements((prev) => [...prev.filter((el) => el.id !== id), prev.find((el) => el.id === id)!]);
  }, []);

  const handleSave = () => {
    try {
        localStorage.setItem('idea-canvas-elements', JSON.stringify(elements));
        toast({ title: "Canvas Saved!", description: "Your canvas has been saved to local storage." });
    } catch (e) {
        toast({ title: "Error Saving", description: "Could not save to local storage. It might be full.", variant: "destructive" });
    }
  };

  const handleLoad = () => {
    const savedElements = localStorage.getItem('idea-canvas-elements');
    if (savedElements) {
      try {
        setElements(JSON.parse(savedElements));
        toast({ title: "Canvas Loaded!", description: "Your canvas has been loaded from local storage." });
      } catch (e) {
        toast({ title: "Error Loading", description: "Could not parse saved data.", variant: "destructive" });
      }
    } else {
      toast({ title: "No saved data", description: "Could not find any saved canvas data.", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(elements));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "idea-canvas.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Canvas Downloaded!", description: "idea-canvas.json has been downloaded." });
  };

  const handleIdeaExpansion = async () => {
    const selectedElement = elements.find(el => el.id === selectedElementId);
    if (!selectedElement || selectedElement.type !== 'text') {
      toast({ title: "Select a text element", description: "Please select a text element to expand on.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await suggestRelatedConcepts({ ideas: selectedElement.content });
      const newElement: CanvasElement = {
        id: `el_ai_${Date.now()}`,
        type: 'text',
        x: selectedElement.x + selectedElement.width + 20,
        y: selectedElement.y,
        width: 200,
        height: 100,
        content: result.relatedConcepts,
        isEditing: false,
      };
      setElements((prev) => [...prev, newElement]);
      toast({ title: "Idea Expanded!", description: "A new related concept has been added." });
    } catch (error) {
      console.error("AI Error:", error);
      toast({ title: "Error expanding idea", description: "Could not generate related concepts.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header onSave={handleSave} onLoad={handleLoad} onDownload={handleDownload} />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          isElementSelected={!!selectedElementId}
          onExpandIdea={handleIdeaExpansion}
          isGenerating={isGenerating}
        />
        <Canvas
          elements={elements}
          selectedElementId={selectedElementId}
          canvasRef={canvasRef}
          onCanvasClick={handleCanvasClick}
          onElementSelect={selectElement}
          onElementUpdate={updateElement}
          cursor={selectedTool === 'text' ? 'crosshair' : 'default'}
        />
      </div>
    </div>
  );
}
