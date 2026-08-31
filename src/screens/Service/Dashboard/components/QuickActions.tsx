import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ChatIcon from '@material-ui/icons/Chat';
import SmartToyIcon from '@material-ui/icons/Android';
import { sitePrefix } from '../../../../config';
import { whatsappRoutes } from '../../../Whatsapp/Constant';

const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Ordered by importance, and styled as primary / secondary / tertiary tones of the
  // Pulseem accent (#FF1744, palette.primary.main) rather than the blue/green/purple
  // they used to be — those belonged to no palette in this app.
  const actions = [
    { key: 'newWidget', label: t('common.dashboard_new_widget', 'New Widget'), icon: <AddCircleOutlineIcon />, variant: 'primary', to: `${sitePrefix}Widgets?action=create` },
    { key: 'viewChats', label: t('common.dashboard_view_chats', 'View Chats'), icon: <ChatIcon />, variant: 'secondary', to: `${whatsappRoutes.CHAT}?channel=widget` },
    { key: 'aiSetup', label: t('common.dashboard_ai_setup', 'AI Setup'), icon: <SmartToyIcon />, variant: 'tertiary', to: `${sitePrefix}AIAssistant` },
  ];

  return (
    <div className="svc-qa-row">
      {actions.map((a) => (
        <button
          key={a.key}
          className={`svc-qa-btn svc-qa-btn--${a.variant}`}
          onClick={() => navigate(a.to)}
        >
          {a.icon}
          {a.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
