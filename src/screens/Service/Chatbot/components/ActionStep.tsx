import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, Select } from '@material-ui/core';
import clsx from 'clsx';
import { IoIosArrowDown } from 'react-icons/io';
import { ChatbotActionType, IActionStep, IWhatsAppTemplate } from '../../../../Models/Service/Chatbot';

interface ActionStepProps {
  step: IActionStep;
  templates: IWhatsAppTemplate[];
  onChange: (step: IActionStep) => void;
  classes: any;
}

const ACTION_LABEL: Record<ChatbotActionType, string> = {
  send_widget: 'Send Widget Response',
  send_wa_template: 'Send WhatsApp Template',
  send_wa_chat: 'Send WhatsApp Chat',
  send_webhook: 'Send Webhook',
};

const defaultPayload = (actionType: ChatbotActionType, templates: IWhatsAppTemplate[]): IActionStep['payload'] => {
  switch (actionType) {
    case 'send_wa_template':
      return { templateId: templates[0]?.id ?? '', variables: {} };
    case 'send_webhook':
      return { url: '' };
    case 'send_wa_chat':
    case 'send_widget':
    default:
      return { text: '' };
  }
};

const ActionStep = ({ step, templates, onChange, classes }: ActionStepProps) => {
  const { t } = useTranslation();
  const payload = step.payload as any;

  const changeActionType = (actionType: ChatbotActionType) => {
    onChange({ ...step, actionType, payload: defaultPayload(actionType, templates) });
  };

  const changePayload = (patch: Record<string, any>) => {
    onChange({ ...step, payload: { ...payload, ...patch } });
  };

  const selectedTemplate = templates.find((tpl) => tpl.id === payload.templateId);

  return (
    <div>
      <div className="svc-cb-field">
        <label>{t('chatbot_action_type', 'Action type')}</label>
        <FormControl variant="standard" className={clsx(classes.selectInputFormControl, classes.w100)}>
          <Select
            native
            variant="standard"
            value={step.actionType}
            className={classes.pbt5}
            onChange={(event: any) => changeActionType(event.target.value)}
            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
          >
            {Object.entries(ACTION_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {t(`chatbot_${value}`, label)}
              </option>
            ))}
          </Select>
        </FormControl>
      </div>

      {step.actionType === 'send_widget' && (
        <div className="svc-cb-step-field">
          <label>{t('chatbot_message_text', 'Message text')}</label>
          <textarea
            className="svc-cb-textarea"
            value={payload.text ?? ''}
            onChange={(e) => changePayload({ text: e.target.value })}
            placeholder={t('chatbot_widget_placeholder', 'Message shown to the visitor in the widget chat') as string}
          />
        </div>
      )}

      {step.actionType === 'send_wa_chat' && (
        <>
          <div className="svc-cb-step-field">
            <label>{t('chatbot_message_text', 'Message text')}</label>
            <textarea
              className="svc-cb-textarea"
              value={payload.text ?? ''}
              onChange={(e) => changePayload({ text: e.target.value })}
              placeholder={t('chatbot_wa_chat_placeholder', 'Free-text message sent within an open WhatsApp session') as string}
            />
          </div>
          <div className="svc-cb-step-note">
            {t('chatbot_wa_session_warning', 'Only works within an open 24h WhatsApp session — otherwise this step is skipped.')}
          </div>
        </>
      )}

      {step.actionType === 'send_wa_template' && (
        <div className="svc-cb-step-field">
          <label>{t('chatbot_template', 'Approved template')}</label>
          <FormControl variant="standard" className={clsx(classes.selectInputFormControl, classes.w100)}>
            <Select
              native
              variant="standard"
              value={payload.templateId ?? ''}
              className={classes.pbt5}
              onChange={(event: any) => changePayload({ templateId: event.target.value, variables: {} })}
              IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </Select>
          </FormControl>
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div className="svc-cb-field-row" style={{ marginTop: 10 }}>
              {selectedTemplate.variables.map((varName) => (
                <div className="svc-cb-field" key={varName}>
                  <label>
                    {t(`chatbot_var_${varName}`, varName)}{' '}
                    <span className="svc-cb-var-tag">{`{{${varName}}}`}</span>
                  </label>
                  <input
                    className="svc-cb-text-input"
                    value={payload.variables?.[varName] ?? ''}
                    onChange={(e) => changePayload({ variables: { ...payload.variables, [varName]: e.target.value } })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step.actionType === 'send_webhook' && (
        <div className="svc-cb-step-field">
          <label>{t('chatbot_webhook_url', 'Webhook URL')}</label>
          <input
            className="svc-cb-text-input"
            value={payload.url ?? ''}
            placeholder="https://example.com/hooks/chatbot"
            onChange={(e) => changePayload({ url: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default ActionStep;
