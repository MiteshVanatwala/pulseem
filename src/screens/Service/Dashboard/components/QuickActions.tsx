import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ChatIcon from '@material-ui/icons/Chat';
import SmartToyIcon from '@material-ui/icons/Android';
import { sitePrefix } from '../../../../config';
import { whatsappRoutes } from '../../../Whatsapp/Constant';
import { PulseemReactInstance } from '../../../../helpers/Api/PulseemReactAPI';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import TierPlans from '../../../../components/TierPlans/TierPlans';

const QuickActions = ({ classes }: { classes?: any }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // PR-3766: no AI Assistant screen exists yet, so there's nowhere to put a
  // locked-section overlay - this button is the only entry point today. Fails
  // open (defaults to true, same as ServiceLimitsLogic's own contract) so a
  // network hiccup here never blocks an entitled account; the real enforcement
  // still lives server-side in ServiceAIGateLogic regardless of this value.
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [showAiLockedDialog, setShowAiLockedDialog] = useState(false);
  const [showTierPlans, setShowTierPlans] = useState(false);

  useEffect(() => {
    let cancelled = false;
    PulseemReactInstance.get('ServiceLimits/GetAccountLimits')
      .then((res: any) => {
        if (cancelled) return;
        const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        const enabled = parsed?.Data?.limits?.aiAssistantEnabled;
        if (typeof enabled === 'boolean') setAiAssistantEnabled(enabled);
      })
      .catch(() => {
        // Fail open - leave aiAssistantEnabled at its default of true.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Ordered by importance, and styled as primary / secondary / tertiary tones of the
  // Pulseem accent (#FF1744, palette.primary.main) rather than the blue/green/purple
  // they used to be — those belonged to no palette in this app.
  const actions = [
    { key: 'newWidget', label: t('common.dashboard_new_widget', 'New Widget'), icon: <AddCircleOutlineIcon />, variant: 'primary', to: `${sitePrefix}Widgets?action=create` },
    { key: 'viewChats', label: t('common.dashboard_view_chats', 'View Chats'), icon: <ChatIcon />, variant: 'secondary', to: `${whatsappRoutes.CHAT}?channel=widget` },
    { key: 'aiSetup', label: t('common.dashboard_ai_setup', 'AI Setup'), icon: <SmartToyIcon />, variant: 'tertiary', to: `${sitePrefix}AIAssistant` },
  ];

  const handleClick = (action: (typeof actions)[number]) => {
    if (action.key === 'aiSetup' && !aiAssistantEnabled) {
      setShowAiLockedDialog(true);
      return;
    }
    navigate(action.to);
  };

  return (
    <div className="svc-qa-row">
      {actions.map((a) => (
        <button
          key={a.key}
          className={`svc-qa-btn svc-qa-btn--${a.variant}`}
          onClick={() => handleClick(a)}
        >
          {a.icon}
          {a.label}
        </button>
      ))}

      {showAiLockedDialog && (
        <BaseDialog
          classes={classes}
          open={showAiLockedDialog}
          title={t('common.ai_locked_title', 'AI Assistant')}
          showDivider={false}
          onClose={() => setShowAiLockedDialog(false)}
          onCancel={() => setShowAiLockedDialog(false)}
          onConfirm={() => {
            setShowAiLockedDialog(false);
            setShowTierPlans(true);
          }}
          confirmText={t('billing.upgradePlan', 'Upgrade Plan')}
          cancelText={t('common.cancel', 'Cancel')}
        >
          <Typography variant="body2">
            {t(
              'common.ai_locked_message',
              'The AI Assistant is not included in your current plan. Upgrade to unlock it.',
            )}
          </Typography>
        </BaseDialog>
      )}

      {showTierPlans && (
        <TierPlans classes={classes} isOpen={showTierPlans} onClose={() => setShowTierPlans(false)} />
      )}
    </div>
  );
};

export default QuickActions;
