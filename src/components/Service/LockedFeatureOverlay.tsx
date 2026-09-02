import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@material-ui/core';
import { MdLock } from 'react-icons/md';
import { sitePrefix } from '../../config';

interface Props {
  // PR-2457: the actual call site (AIAssistant.tsx) passes a single combined
  // message rather than separate planName/description - kept both shapes so
  // either a short one-liner (message) or a fuller planName+description layout
  // can be used depending on the caller.
  message?: string;
  planName?: string;
  description?: string;
}

// Full-page overlay for completely locked features (e.g. AI on Starter)
// Shows: lock icon + plan name + description + upgrade CTA
const LockedFeatureOverlay = ({ message, planName, description }: Props) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate(`${sitePrefix}BillingSettings`);
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 48,
        gap: 12,
      }}
    >
      <MdLock size={40} />
      {planName && <Typography variant="h6">{planName}</Typography>}
      {(message || description) && (
        <Typography variant="body2" color="textSecondary" style={{ maxWidth: 420 }}>
          {message || description}
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleUpgrade} style={{ marginBlockStart: 8 }}>
        Upgrade Plan
      </Button>
    </Box>
  );
};

export default LockedFeatureOverlay;
