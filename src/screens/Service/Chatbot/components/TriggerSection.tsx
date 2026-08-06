import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChatbotTrigger } from '../../../../Models/Service/Chatbot';

interface TriggerSectionProps {
  trigger: ChatbotTrigger;
  cooldownEnabled: boolean;
  cooldownHours: number;
  onChange: (patch: Partial<{ trigger: ChatbotTrigger; cooldownEnabled: boolean; cooldownHours: number }>) => void;
}

const OPTIONS: { value: ChatbotTrigger; label: string }[] = [
  { value: 'any', label: 'Any message' },
  { value: 'whatsapp', label: 'WhatsApp only' },
  { value: 'widget', label: 'Widget only' },
];

const TriggerSection = ({ trigger, cooldownEnabled, cooldownHours, onChange }: TriggerSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="svc-cb-card">
      <p className="svc-cb-card-title">{t('chatbot_trigger', 'Trigger')}</p>
      <div className="svc-cb-field-row">
        <div className="svc-cb-field">
          <label>{t('chatbot_fires_on', 'Fires on')}</label>
          <div className="svc-cb-segmented">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={trigger === opt.value ? 'sel' : ''}
                onClick={() => onChange({ trigger: opt.value })}
              >
                {t(`chatbot_trigger_${opt.value}`, opt.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="svc-cb-field">
          <label>{t('chatbot_repeat', 'Re-entry cooldown')}</label>
          <div className="svc-cb-cooldown-row">
            <input
              type="checkbox"
              checked={cooldownEnabled}
              onChange={(e) => onChange({ cooldownEnabled: e.target.checked })}
            />
            {t('chatbot_wait', 'Wait')}
            <input
              type="number"
              min={1}
              className="svc-cb-mini-input"
              value={cooldownHours}
              disabled={!cooldownEnabled}
              onChange={(e) => onChange({ cooldownHours: Math.max(1, Number(e.target.value) || 1) })}
            />
            {t('chatbot_wait_suffix', 'hours before the same contact can re-enter this flow')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggerSection;
