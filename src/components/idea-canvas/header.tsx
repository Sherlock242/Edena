'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Download } from 'lucide-react';

type HeaderProps = {
    onSave: () => void;
    onLoad: () => void;
    onDownload: () => void;
};

export function Header({ onSave, onLoad, onDownload }: HeaderProps) {
  return (
    <header className="p-2 border-b flex items-center justify-between shadow-sm bg-card z-10">
      <h1 className="text-xl font-bold font-headline ml-4">Idea Canvas</h1>
      <div className="flex items-center space-x-2 mr-4">
        <Button variant="ghost" size="sm" onClick={onSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
        <Button variant="ghost" size="sm" onClick={onLoad}><FolderOpen className="mr-2 h-4 w-4" /> Load</Button>
        <Button variant="ghost" size="sm" onClick={onDownload}><Download className="mr-2 h-4 w-4" /> Download</Button>
      </div>
    </header>
  );
}
