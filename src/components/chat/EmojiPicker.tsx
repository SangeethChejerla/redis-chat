// components/chat/EmojiPicker.tsx
'use client';

import { useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';


interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {

  const pickerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button')?.querySelector('.lucide-smile')) {
          onEmojiSelect('');
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onEmojiSelect]);
  
  return (
    <div ref={pickerRef}>
      <Picker
        onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
        lazyLoadEmojis={true}
      />
    </div>
  );
}