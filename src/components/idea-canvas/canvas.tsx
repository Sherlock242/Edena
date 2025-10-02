'use client';
import React, { MouseEvent } from 'react';
import type { CanvasElement } from '@/lib/types';
import { CanvasElementComponent } from './canvas-element';

type CanvasProps = {
    elements: CanvasElement[];
    selectedElementId: string | null;
    canvasRef: React.RefObject<HTMLDivElement>;
    onCanvasClick: (e: MouseEvent<HTMLDivElement>) => void;
    onElementSelect: (id: string) => void;
    onElementUpdate: (id: string, props: Partial<CanvasElement>) => void;
    cursor: string;
};

export function Canvas({
  elements,
  selectedElementId,
  canvasRef,
  onCanvasClick,
  onElementSelect,
  onElementUpdate,
  cursor,
}: CanvasProps) {
  return (
    <main
      ref={canvasRef}
      className="flex-1 relative overflow-hidden"
      onClick={onCanvasClick}
      style={{ cursor }}
    >
      {elements.map((el) => (
        <CanvasElementComponent
          key={el.id}
          element={el}
          isSelected={selectedElementId === el.id}
          onSelect={onElementSelect}
          onUpdate={onElementUpdate}
        />
      ))}
    </main>
  );
}
