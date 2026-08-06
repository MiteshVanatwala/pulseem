import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, LinearProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

interface UsageCounterProps {
  current: number;
  max: number | null;
  labelKey: string;
}

const isFiniteNumber = (value: any): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const useLocalStyles = makeStyles({
  barNormal: { backgroundColor: '#0371ad' },
  barWarning: { backgroundColor: '#ed6c02' },
  barError: { backgroundColor: '#d32f2f' },
});

const UsageCounter = ({ current, max, labelKey }: UsageCounterProps) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const { t } = useTranslation();
  const localClasses = useLocalStyles();
  
  if (!isFiniteNumber(max) || max < 0) {
    return null;
  }

  const safeCurrent = isFiniteNumber(current) ? current : 0;
  const percent = Math.min(100, Math.max(0, max === 0 ? 100 : (safeCurrent / max) * 100));
  const barClass = percent >= 100
    ? localClasses.barError
    : percent >= 80
      ? localClasses.barWarning
      : localClasses.barNormal;

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'} style={{ marginBlockEnd: 12 }}>
      <Typography variant="body2" style={{ marginBlockEnd: 4 }}>
        {t('SubUsers.serviceLimits.usageFormat', { current: safeCurrent, max, label: t(labelKey) })}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percent}
        classes={{ barColorPrimary: barClass }}
        style={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

export default UsageCounter;
