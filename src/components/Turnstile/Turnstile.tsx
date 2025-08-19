import { useEffect, useRef } from 'react';
import { CloudFlareSiteKey } from '../../helpers/Constants';

interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark';
}

const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onVerify, theme = 'light' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number>();

  useEffect(() => {
    // @ts-ignore
    if (!window.turnstile) {
      console.error('Turnstile is not loaded');
      return;
    }

    if (containerRef.current && !widgetId.current) {
      // @ts-ignore
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey || CloudFlareSiteKey,
        callback: onVerify,
        theme: theme
      });
    }

    return () => {
      if (widgetId.current) {
        // @ts-ignore
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onVerify, theme]);

  return <div ref={containerRef} />;
};

export default Turnstile;
