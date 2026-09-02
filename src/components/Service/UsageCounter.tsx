import { Box, LinearProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  current: number;
  max: number; // -1 = unlimited
  label: string;
}

const useStyles = makeStyles({
  barNormal: { backgroundColor: '#0371ad' },
  barWarning: { backgroundColor: '#d32f2f' },
});

// Renders: "3 / 10 Chatbots" with MUI LinearProgress bar
// Changes to red when >= 80% consumed
const UsageCounter = ({ current, max, label }: Props) => {
  const classes = useStyles();

  if (max === -1) {
    return (
      <Typography variant="body2" color="textSecondary">
        {`Unlimited ${label}`}
      </Typography>
    );
  }

  const percent = max === 0 ? 100 : Math.min(100, Math.max(0, (current / max) * 100));
  const isNearOrOverLimit = percent >= 80;

  return (
    <Box style={{ marginBlockEnd: 12 }}>
      <Typography variant="body2" style={{ marginBlockEnd: 4 }}>
        {`${current} / ${max} ${label}`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percent}
        classes={{ barColorPrimary: isNearOrOverLimit ? classes.barWarning : classes.barNormal }}
        style={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

export default UsageCounter;
