import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface UseThinkingPhrasesResult {
  phrase: string;
  visible: boolean;
}

const INTERVAL_MS = 4000;
const FADE_MS = 250;

export const useThinkingPhrases = (active: boolean): UseThinkingPhrasesResult => {
  const { t } = useTranslation();
  const phrases = t('common.thinkingPhrases', { returnObjects: true }) as string[];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhraseIndex(0);
      setVisible(true);
      return;
    }

    intervalRef.current = setInterval(() => {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setPhraseIndex((prev) => {
          let next = Math.floor(Math.random() * phrases.length);
          while (next === prev && phrases.length > 1) {
            next = Math.floor(Math.random() * phrases.length);
          }
          return next;
        });
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active, phrases.length]);

  return { phrase: phrases[phraseIndex] ?? '', visible };
};
