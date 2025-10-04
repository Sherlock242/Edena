'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

type WebsiteViewerProps = {
  url: string;
  onClose: () => void;
};

export function WebsiteViewer({ url, onClose }: WebsiteViewerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-background rounded-lg shadow-2xl w-full h-full flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-2 border-b bg-card">
            <span className="text-sm text-muted-foreground truncate ml-2">{url}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </header>
          <div className="flex-1 bg-white">
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="Website Viewer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
