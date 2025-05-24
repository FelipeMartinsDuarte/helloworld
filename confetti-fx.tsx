"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiPiece {
  id: number;
  left: string;
  top: string;
  color: string;
  transform: string;
  animationDuration: string;
  animationDelay: string;
}

const colors = [
  'hsl(var(--primary))', 
  'hsl(var(--accent))', 
  'hsl(var(--destructive))',
  '#34D399', // Emerald 500
  '#FBBF24'  // Amber 400
];

interface ConfettiFxProps {
  trigger: boolean;
  onComplete?: () => void;
}

const ConfettiFx: React.FC<ConfettiFxProps> = ({ trigger, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const createConfetti = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    const numPieces = 50; // Number of confetti pieces

    for (let i = 0; i < numPieces; i++) {
      newPieces.push({
        id: Math.random(),
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * -20 - 80}px`, // Start above the screen
        color: colors[Math.floor(Math.random() * colors.length)],
        transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
        animationDuration: `${Math.random() * 2 + 2}s`, // 2 to 4 seconds fall
        animationDelay: `${Math.random() * 0.5}s`,
      });
    }
    setPieces(newPieces);

    // Call onComplete after the longest animation might finish
    if (onComplete) {
      setTimeout(onComplete, 4500); // Max duration + delay
    }
  }, [onComplete]);

  useEffect(() => {
    if (trigger) {
      createConfetti();
    } else {
      setPieces([]); // Clear confetti if trigger becomes false
    }
  }, [trigger, createConfetti]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            top: piece.top,
            backgroundColor: piece.color,
            transform: piece.transform,
            animationDuration: piece.animationDuration,
            animationDelay: piece.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiFx;
