import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@material-ui/core';
import { MdLock } from 'react-icons/md';
import { sitePrefix } from '../../config';

interface Props {
  message?: string;
  feature?: string;
}

// Renders: lock icon + message + "Upgrade Plan" button
// "Upgrade Plan" → navigates to pricing/account settings page
const UpgradePrompt = ({ message, feature }: Props) => {
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
      <Button size="small" variant="outlined" onClick={handleUpgrade}>
        Upgrade Plan
      </Button>
    </Box>
  );
};

export default UpgradePrompt;
