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

  const actions = [
    { key: 'newWidget', label: t('dashboard_new_widget', 'New Widget'), icon: <AddCircleOutlineIcon />, bg: '#2563eb', to: `${sitePrefix}Widgets?action=create` },
    { key: 'viewChats', label: t('dashboard_view_chats', 'View Chats'), icon: <ChatIcon />, bg: '#16a34a', to: `${whatsappRoutes.CHAT}?channel=widget` },
    { key: 'aiSetup', label: t('dashboard_ai_setup', 'AI Setup'), icon: <SmartToyIcon />, bg: '#8b5cf6', to: `${sitePrefix}AIAssistant` },
  ];

  return (
    <div className="svc-qa-row">
      {actions.map((a) => (
        <button key={a.key} className="svc-qa-btn" style={{ background: a.bg }} onClick={() => navigate(a.to)}>
          {a.icon}
          {a.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
