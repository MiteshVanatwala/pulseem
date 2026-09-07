import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@material-ui/core';
import { MdLock } from 'react-icons/md';
import clsx from 'clsx';
import { sitePrefix } from '../../config';

interface Props {
  message?: string;
  feature?: string;
  classes?: any;
}

// Renders: lock icon + message + "Upgrade Plan" button
// "Upgrade Plan" → navigates to pricing/account settings page
const UpgradePrompt = ({ message, feature, classes }: Props) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate(`${sitePrefix}BillingSettings`);
  };

  const displayMessage =
    message || (feature ? `${feature} is not available on your current plan.` : 'This feature is not available on your current plan.');

  return (
    <Box style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBlock: 8 }}>
      <MdLock />
      <Typography variant="body2" style={{ marginInlineEnd: 8 }}>
        {displayMessage}
      </Typography>
      {/* Same classes as the Chatbot list page's Search button (classes.btn +
          classes.btnRounded + classes.searchButton) - identical look, no custom
          color override. */}
      <Button onClick={handleUpgrade} className={clsx(classes?.btn, classes?.btnRounded, classes?.searchButton)}>
        Upgrade Plan
      </Button>
    </Box>
  );
};

export default UpgradePrompt;
