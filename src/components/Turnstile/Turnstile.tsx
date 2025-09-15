import { useEffect, useRef, useState } from 'react';
import { CloudFlareSiteKey } from '../../helpers/Constants';
import { sitePrefix } from '../../config';

interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark';
}

const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onVerify, theme = 'light' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number>();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isWidgetRendered, setIsWidgetRendered] = useState(false);
  const hasTokenBeenGenerated = useRef(false);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (!document.querySelector('script#cf-turnstile')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile';
      // script.src = `${sitePrefix}common.js`;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      // Check if turnstile is available
      // @ts-ignore
      if (window.turnstile) {
        setIsScriptLoaded(true);
      } else {
        // Wait for turnstile to be available
        const checkTurnstile = setInterval(() => {
          // @ts-ignore
          if (window.turnstile) {
            setIsScriptLoaded(true);
            clearInterval(checkTurnstile);
          }
        }, 100);
        
        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkTurnstile), 10000);
      }
    }
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || isWidgetRendered) {
      return;
    }

    // Render new widget only once
    try {
      // @ts-ignore
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey || CloudFlareSiteKey,
        callback: (token: string) => {
          if (!hasTokenBeenGenerated.current) {
            hasTokenBeenGenerated.current = true;
            onVerify(token);
          }
        },
        theme: theme
      });
      setIsWidgetRendered(true);
    } catch (error) {
      console.error("Error rendering Turnstile widget:", error);
    }

    return () => {
      if (widgetId.current) {
        try {
          // @ts-ignore
          window.turnstile.remove(widgetId.current);
          setIsWidgetRendered(false);
          hasTokenBeenGenerated.current = false;
        } catch (error) {
          console.log("Error removing turnstile widget on cleanup:", error);
        }
      }
    };
  }, [isScriptLoaded, siteKey, theme]); // Removed onVerify from dependencies

  return <div ref={containerRef} />;
};

export default Turnstile;
