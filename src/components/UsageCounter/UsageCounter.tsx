import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Chip } from "@material-ui/core";

interface UsageCounterProps {
  current: number;
  max: number | null;
  labelKey: string;
}

const isFiniteNumber = (value: any): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const SEVERITY_COLORS = {
  normal: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  warning: { backgroundColor: '#fef3c7', color: '#92400e' },
  error: { backgroundColor: '#fee2e2', color: '#b91c1c' },
};

const UsageCounter = ({ current, max, labelKey }: UsageCounterProps) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const { t } = useTranslation();

  if (!isFiniteNumber(max) || max < 0) {
    return null;
  }

  const safeCurrent = isFiniteNumber(current) ? current : 0;
  const percent = Math.min(100, Math.max(0, max === 0 ? 100 : (safeCurrent / max) * 100));
  const severity = percent >= 100 ? 'error' : percent >= 80 ? 'warning' : 'normal';

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'} style={{ marginBlockEnd: 12 }}>
      <Chip
        size="small"
        label={t('SubUsers.serviceLimits.usageFormat', { current: safeCurrent, max, label: t(labelKey) })}
        style={SEVERITY_COLORS[severity]}
      />
    </Box>
  );
};

export default UsageCounter;
