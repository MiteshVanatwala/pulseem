import { useEffect, useRef, useState } from 'react';
import { CloudFlareSiteKey } from '../../helpers/Constants';

interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark';
}

const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onVerify, theme = 'light' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number>();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (!document.querySelector('script#cf-turnstile')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      // @ts-ignore
      if (window.turnstile) {
        setIsScriptLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isScriptLoaded) {
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
