import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DefaultScreen from '../../DefaultScreen';
import { sitePrefix } from '../../../config';
import { getChatbotFlow, saveChatbot, clearCurrentFlow } from '../../../redux/reducers/chatbotSlice';
import { IChatbotFlow } from '../../../Models/Service/Chatbot';
import { MOCK_WA_TEMPLATES, emptyFlow } from './mockChatbots';
import TriggerSection from './components/TriggerSection';
import FlowBuilder from './components/FlowBuilder';
import './chatbot.css';

const ChatbotBuilder = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { chatbotId } = useParams<{ chatbotId?: string }>();
  const { currentFlow, loadingFlow, saving } = useSelector((s: any) => s.chatbot);

  const [flow, setFlow] = useState<IChatbotFlow>(emptyFlow());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getChatbotFlow(chatbotId));
    return () => {
      dispatch(clearCurrentFlow());
    };
  }, [dispatch, chatbotId]);

  useEffect(() => {
    if (currentFlow) setFlow(currentFlow);
  }, [currentFlow]);

  const goBack = () => navigate(`${sitePrefix}Chatbots`);

  const handleSave = () => {
    if (!flow.name.trim()) {
      setError(t('chatbot_error_name_required', 'Give this chatbot a name before saving.') as string);
      return;
    }
    if (flow.steps.length === 0) {
      setError(t('chatbot_error_step_required', 'Add at least one step before saving.') as string);
      return;
    }
    setError(null);
    dispatch(saveChatbot(flow)).then(() => goBack());
  };

  if (loadingFlow) {
    return (
      <DefaultScreen classes={classes} currentPage="service" subPage="serviceChatbots" containerClass="" hideSideImages>
        <div className="svc-cb">{t('common_loading', 'Loading…')}</div>
      </DefaultScreen>
    );
  }

  return (
    <DefaultScreen classes={classes} currentPage="service" subPage="serviceChatbots" containerClass="" hideSideImages>
      <div className="svc-cb">
        <div className="svc-cb-builder-head">
          <input
            className="svc-cb-name-input"
            value={flow.name}
            placeholder={t('chatbot_name_placeholder', 'Untitled chatbot') as string}
            onChange={(e) => setFlow({ ...flow, name: e.target.value })}
          />
          <div
            className="svc-cb-toggle-wrap"
            onClick={() => setFlow({ ...flow, enabled: !flow.enabled })}
            role="switch"
            aria-checked={flow.enabled}
          >
            <span className={`svc-cb-switch ${flow.enabled ? 'on' : ''}`} />
            {flow.enabled ? t('chatbot_enabled', 'Enabled') : t('chatbot_disabled', 'Disabled')}
          </div>
          <button className="svc-cb-btn svc-cb-btn-ghost" onClick={goBack}>
            {t('common_cancel', 'Cancel')}
          </button>
          <button className="svc-cb-btn svc-cb-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t('common_saving', 'Saving…') : t('common_save', 'Save')}
          </button>
        </div>

        {error && (
          <div className="svc-cb-limit-note" style={{ background: '#fef3f2', borderColor: '#fda29b', color: '#b42318' }}>
            ⚠️ <span>{error}</span>
          </div>
        )}

        <TriggerSection
          trigger={flow.trigger}
          cooldownEnabled={flow.cooldownEnabled}
          cooldownHours={flow.cooldownHours}
          onChange={(patch) => setFlow({ ...flow, ...patch })}
        />

        <p className="svc-cb-card-title" style={{ margin: '18px 0 10px' }}>
          {t('chatbot_flow', 'Flow')}
        </p>
        <FlowBuilder
          steps={flow.steps}
          templates={MOCK_WA_TEMPLATES}
          onChange={(steps) => setFlow({ ...flow, steps })}
        />
      </div>
    </DefaultScreen>
  );
};

export default ChatbotBuilder;
