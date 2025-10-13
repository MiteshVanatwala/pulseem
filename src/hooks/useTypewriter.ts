import { useState, useEffect } from 'react';

interface UseTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  startTyping?: boolean;
}

export const useTypewriter = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  loop = false,
  startTyping = false 
}: UseTypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isWaitingToRestart, setIsWaitingToRestart] = useState(false);

  // Reset when startTyping changes
  useEffect(() => {
    if (startTyping) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
      setIsWaitingToRestart(false);
    } else {
      setIsTyping(false);
      setIsWaitingToRestart(false);
    }
  }, [startTyping]);

  // Handle initial delay
  useEffect(() => {
    if (!startTyping) return;
    
    let timeout: NodeJS.Timeout;
    
    if (delay > 0 && currentIndex === 0 && !isWaitingToRestart) {
      setIsTyping(false);
      timeout = setTimeout(() => {
        setIsTyping(true);
      }, delay);
    }

    return () => clearTimeout(timeout);
  }, [delay, currentIndex, startTyping, isWaitingToRestart]);

  useEffect(() => {
    if (!isTyping || !startTyping) return;

    let timeout: NodeJS.Timeout;

    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
    } else if (loop) {
      setIsWaitingToRestart(true);
      timeout = setTimeout(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsWaitingToRestart(false);
      }, 1500); // Wait for 1.5s before restarting
    } else {
      setIsTyping(false);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, isTyping, loop, startTyping]);

  return {
    displayedText,
    isTyping,
    isDone: currentIndex === text.length
  };
};
