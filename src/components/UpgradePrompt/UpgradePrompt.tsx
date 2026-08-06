import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@material-ui/core";
import { MdLock } from "react-icons/md";
import TierPlans from "../TierPlans/TierPlans";

interface UpgradePromptProps {
  classes: any;
  messageKey: string;
  featureKey?: string;
}

const UpgradePrompt = ({ classes, messageKey }: UpgradePromptProps) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const { t } = useTranslation();
  const [showTierPlans, setShowTierPlans] = useState(false);

  return (
    <Box
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBlock: 8 }}
    >
      <MdLock />
      <Typography variant="body2" style={{ marginInlineEnd: 8 }}>
        {t(messageKey)}
      </Typography>
      <Button size="small" variant="outlined" onClick={() => setShowTierPlans(true)}>
        {t('SubUsers.serviceLimits.upgradeCta')}
      </Button>
      {showTierPlans && (
        <TierPlans
          classes={classes}
          isOpen={showTierPlans}
          onClose={() => setShowTierPlans(false)}
        />
      )}
    </Box>
  );
};

export default UpgradePrompt;
