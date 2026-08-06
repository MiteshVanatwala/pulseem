import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChatbotActionType, IActionStep, IWhatsAppTemplate } from '../../../../Models/Service/Chatbot';

interface ActionStepProps {
  step: IActionStep;
  templates: IWhatsAppTemplate[];
  onChange: (step: IActionStep) => void;
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

const ActionStep = ({ step, templates, onChange }: ActionStepProps) => {
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
      <span className="svc-cb-step-kind svc-cb-kind-action">{t('chatbot_action', 'Action')}</span>
      <div className="svc-cb-field">
        <label>{t('chatbot_action_type', 'Action type')}</label>
        <select
          className="svc-cb-select"
          value={step.actionType}
          onChange={(e) => changeActionType(e.target.value as ChatbotActionType)}
        >
          {Object.entries(ACTION_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {t(`chatbot_${value}`, label)}
            </option>
          ))}
        </select>
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
          <select
            className="svc-cb-select"
            value={payload.templateId ?? ''}
            onChange={(e) => changePayload({ templateId: e.target.value, variables: {} })}
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div className="svc-cb-field-row" style={{ marginTop: 10 }}>
              {selectedTemplate.variables.map((varName) => (
                <div className="svc-cb-field" key={varName}>
                  <label>{`{{${varName}}}`}</label>
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
