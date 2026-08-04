import { useState, useEffect, useRef } from 'react';
import { saveWidget, TierBlockedError } from '../helpers/Api/WidgetAPI';
import { WidgetConfig } from '../screens/Widgets/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useWidgetAutoSave(
  data: WidgetConfig,
  delay: number = 2000,
  onSaved?: (result: { widgetId: string; status: string }) => void,
  widgetId?: string,
  domain?: string,
  onTierBlocked?: (featureCode: string) => void,
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const initialRender = useRef(true);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const onTierBlockedRef = useRef(onTierBlocked);
  onTierBlockedRef.current = onTierBlocked;
  // Read via ref so a debounced save always targets the latest known widget,
  // without the identifier's own change re-triggering the debounce timer.
  const identifierRef = useRef({ widgetId, domain });
  identifierRef.current = { widgetId, domain };

  useEffect(() => {
    // Skip saving on the first render — that render is either the initial blank
    // config or the config just loaded from GetWidget, neither of which is a change.
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    setSaveStatus('saving');

    const handler = setTimeout(async () => {
      try {
        const result = await saveWidget(data, identifierRef.current.widgetId, identifierRef.current.domain);
        setSaveStatus('saved');
        onSavedRef.current?.(result);

        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('Failed to auto-save widget config', error);
        if (error instanceof TierBlockedError) {
          setSaveStatus('idle');
          onTierBlockedRef.current?.(error.featureCode);
        } else {
          setSaveStatus('error');
        }
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, delay]);

  return saveStatus;
}
