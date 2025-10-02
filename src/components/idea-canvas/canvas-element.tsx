'use client';

import type { CanvasElement } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';

type CanvasElementProps = {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id:string, props: Partial<CanvasElement>) => void;
};

export function CanvasElementComponent({ element, isSelected, onSelect, onUpdate }: CanvasElementProps) {
  const [isEditing, setIsEditing] = useState(element.isEditing);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(element.id, { isEditing: false, content: textareaRef.current?.value ?? element.content });
  };
  
  useEffect(() => {
    if (element.isEditing) {
        setIsEditing(true);
    }
  }, [element.isEditing]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
    }
  }, [isEditing]);

  return (
    <Card
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        minHeight: element.height,
        cursor: 'move',
      }}
      className={`p-2 shadow-lg resize overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          defaultValue={element.content}
          onBlur={handleBlur}
          className="w-full h-full bg-transparent border-none outline-none resize-none text-sm"
        />
      ) : (
        <p className="w-full h-full whitespace-pre-wrap break-words text-sm">{element.content}</p>
      )}
    </Card>
  );
}
