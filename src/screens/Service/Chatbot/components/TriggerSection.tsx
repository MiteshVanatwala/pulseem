import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, Select } from '@material-ui/core';
import { IoIosArrowDown } from 'react-icons/io';
import { MdFlashOn, MdTimer } from 'react-icons/md';
import { ChatbotTrigger } from '../../../../Models/Service/Chatbot';

interface TriggerSectionProps {
  trigger: ChatbotTrigger;
  cooldownEnabled: boolean;
  cooldownHours: number;
  onChange: (patch: Partial<{ trigger: ChatbotTrigger; cooldownEnabled: boolean; cooldownHours: number }>) => void;
  classes: any;
}

const OPTIONS: { value: ChatbotTrigger; label: string; key: string }[] = [
  { value: 'any', label: 'Any Message', key: 'chatbot_any_message' },
  { value: 'whatsapp', label: 'WhatsApp only', key: 'chatbot_trigger_whatsapp' },
  { value: 'widget', label: 'Widget only', key: 'chatbot_trigger_widget' },
];

const TriggerSection = ({ trigger, cooldownEnabled, cooldownHours, onChange, classes }: TriggerSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="svc-cb-trigger-card">
      <div className="svc-cb-trigger-row">
        <div className="svc-cb-trigger-row-icon svc-cb-trigger-row-icon-fires">
          <MdFlashOn size={18} />
        </div>
        <div className="svc-cb-trigger-row-text">
          <div className="svc-cb-trigger-row-label">{t('chatbot_fires_on', 'Fires on')}</div>
          <div className="svc-cb-trigger-row-desc">
            {t('chatbot_fires_on_desc', 'Choose which incoming messages should start this chatbot.')}
          </div>
        </div>
        <div className="svc-cb-trigger-control">
          <FormControl variant="standard" className={classes.selectInputFormControl}>
            <Select
              native
              variant="standard"
              value={trigger}
              className={classes.pbt5}
              onChange={(event: any) => onChange({ trigger: event.target.value })}
              IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
            >
              {OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.key, opt.label)}
                </option>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <div className="svc-cb-trigger-row">
        <div className="svc-cb-trigger-row-icon svc-cb-trigger-row-icon-cooldown">
          <MdTimer size={18} />
        </div>
        <div className="svc-cb-trigger-row-text">
          <div className="svc-cb-trigger-row-label">{t('chatbot_repeat', 'Re-entry cooldown')}</div>
          <div className="svc-cb-trigger-row-desc">
            {t('chatbot_repeat_desc', 'Stop the same contact from re-entering this flow too soon.')}
          </div>
        </div>
        <div className="svc-cb-trigger-control">
          <div
            className={`svc-cb-toggle-wrap ${cooldownEnabled ? 'on' : ''}`}
            onClick={() => onChange({ cooldownEnabled: !cooldownEnabled })}
            role="switch"
            aria-checked={cooldownEnabled}
          >
            <span className={`svc-cb-switch ${cooldownEnabled ? 'on' : ''}`} />
          </div>
        </div>
      </div>

      {cooldownEnabled && (
        <div className="svc-cb-trigger-row svc-cb-cooldown-detail">
          <div className="svc-cb-trigger-row-icon" />
          <div className="svc-cb-trigger-row-text">
            <div className="svc-cb-trigger-row-desc">
              {t('chatbot_wait_prefix', 'Wait before the same contact can re-enter this flow')}
            </div>
          </div>
          <div className="svc-cb-trigger-control">
            <div className="svc-cb-stepper">
              <button type="button" onClick={() => onChange({ cooldownHours: Math.max(1, cooldownHours - 1) })}>
                −
              </button>
              <input
                type="number"
                min={1}
                value={cooldownHours}
                onChange={(e) => onChange({ cooldownHours: Math.max(1, Number(e.target.value) || 1) })}
              />
              <button type="button" onClick={() => onChange({ cooldownHours: cooldownHours + 1 })}>
                +
              </button>
              <span className="svc-cb-stepper-unit">{t('chatbot_hours', 'hours')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriggerSection;
