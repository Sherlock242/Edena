'use client';

import React from 'react';
import type { Tool } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer, Type, Square, Sparkles } from 'lucide-react';

type ToolbarProps = {
    selectedTool: Tool;
    onToolSelect: (tool: Tool) => void;
    isElementSelected: boolean;
    onExpandIdea: () => void;
    isGenerating: boolean;
};

export function Toolbar({ selectedTool, onToolSelect, isElementSelected, onExpandIdea, isGenerating }: ToolbarProps) {
  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer />, label: 'Select & Move' },
    { id: 'text', icon: <Type />, label: 'Add Text' },
    { id: 'shape', icon: <Square />, label: 'Add Shape (soon)' },
  ];

  return (
    <TooltipProvider>
      <aside className="w-16 bg-card border-r p-2 flex flex-col items-center space-y-2 z-10">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTool === tool.id ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => tool.id !== 'shape' && onToolSelect(tool.id)}
                disabled={tool.id === 'shape'}
                className={tool.id === 'shape' ? 'cursor-not-allowed opacity-50' : ''}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {isElementSelected && (
          <>
            <div className="flex-grow" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onExpandIdea}
                  disabled={isGenerating}
                  className="bg-accent/50 hover:bg-accent"
                >
                  <Sparkles className={isGenerating ? 'animate-spin' : ''} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand Idea (AI)</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </aside>
    </TooltipProvider>
  );
}
