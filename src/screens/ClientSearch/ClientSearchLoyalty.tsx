import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const ClientSearchLoyalty = ({ classes, data, onUpdate }: any) => {
  const { t } = useTranslation();

  const handleChange = (field: string, value: any) => {
    onUpdate(field, value);
  };

  const pointsCondOptions = [
    { value: 'gt', label: t('appBar.groups.loyalty.op.over') },
    { value: 'lt', label: t('appBar.groups.loyalty.op.under') },
    { value: 'eq', label: t('appBar.groups.loyalty.op.equals') },
    { value: 'between', label: t('appBar.groups.loyalty.op.between') },
  ];

  const tierCondOptions = [
    { value: 'eq', label: t('appBar.groups.loyalty.op.is') },
    { value: 'neq', label: t('appBar.groups.loyalty.op.isNot') },
  ];

  const expiryCondOptions = [
    { value: 'withindays', label: t('appBar.groups.loyalty.op.withinDays') },
    { value: 'after', label: t('appBar.groups.loyalty.op.after') },
    { value: 'before', label: t('appBar.groups.loyalty.op.before') },
    { value: 'noexpiry', label: t('appBar.groups.loyalty.op.noExpiry') },
  ];

  const optedInOptions = [
    { value: '', label: '' },
    { value: 'true', label: t('common.yes') },
    { value: 'false', label: t('common.no') },
  ];

  return (
    <Grid container spacing={3}>
      {/* Loyalty Points */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl variant="standard" fullWidth className={classes?.mt25}>
          <InputLabel style={{ fontSize: 17 }}>{t('campaigns.loyalty.points')}</InputLabel>
          <Select
            value={data?.LoyaltyPointsCond || ''}
            onChange={(e) => handleChange('LoyaltyPointsCond', e.target.value)}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {pointsCondOptions.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          label={t('campaigns.loyalty.points')}
          variant="standard"
          size="small"
          type="number"
          value={data?.LoyaltyPoints ?? ''}
          onChange={(e) => handleChange('LoyaltyPoints', e.target.value ? parseInt(e.target.value) : null)}
          fullWidth
          className={classes?.mt25}
          InputLabelProps={{ style: { fontSize: 17 } }}
          disabled={!data?.LoyaltyPointsCond}
        />
      </Grid>
      {data?.LoyaltyPointsCond === 'between' && (
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label={t('common.to')}
            variant="standard"
            size="small"
            type="number"
            value={data?.LoyaltyPointsTo ?? ''}
            onChange={(e) => handleChange('LoyaltyPointsTo', e.target.value ? parseInt(e.target.value) : null)}
            fullWidth
            className={classes?.mt25}
            InputLabelProps={{ style: { fontSize: 17 } }}
          />
        </Grid>
      )}

      {/* Loyalty Tier */}
      <Grid item xs={12} sm={6} md={2}>
        <FormControl variant="standard" fullWidth className={classes?.mt25}>
          <InputLabel style={{ fontSize: 17 }}>{t('campaigns.loyalty.tier')}</InputLabel>
          <Select
            value={data?.LoyaltyTierCond || ''}
            onChange={(e) => handleChange('LoyaltyTierCond', e.target.value)}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {tierCondOptions.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label={t('campaigns.loyalty.tier')}
          variant="standard"
          size="small"
          value={data?.LoyaltyTier || ''}
          onChange={(e) => handleChange('LoyaltyTier', e.target.value || null)}
          fullWidth
          className={classes?.mt25}
          InputLabelProps={{ style: { fontSize: 17 } }}
          disabled={!data?.LoyaltyTierCond}
        />
      </Grid>

      {/* Points Earned */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl variant="standard" fullWidth className={classes?.mt25}>
          <InputLabel style={{ fontSize: 17 }}>{t('campaigns.loyalty.pointsEarned')}</InputLabel>
          <Select
            value={data?.LoyaltyPointsEarnedCond || ''}
            onChange={(e) => handleChange('LoyaltyPointsEarnedCond', e.target.value)}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {pointsCondOptions.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          label={t('campaigns.loyalty.pointsEarned')}
          variant="standard"
          size="small"
          type="number"
          value={data?.LoyaltyPointsEarned ?? ''}
          onChange={(e) => handleChange('LoyaltyPointsEarned', e.target.value ? parseInt(e.target.value) : null)}
          fullWidth
          className={classes?.mt25}
          InputLabelProps={{ style: { fontSize: 17 } }}
          disabled={!data?.LoyaltyPointsEarnedCond}
        />
      </Grid>
      {data?.LoyaltyPointsEarnedCond === 'between' && (
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label={t('common.to')}
            variant="standard"
            size="small"
            type="number"
            value={data?.LoyaltyPointsEarnedTo ?? ''}
            onChange={(e) => handleChange('LoyaltyPointsEarnedTo', e.target.value ? parseInt(e.target.value) : null)}
            fullWidth
            className={classes?.mt25}
            InputLabelProps={{ style: { fontSize: 17 } }}
          />
        </Grid>
      )}

      {/* Points Expiry */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl variant="standard" fullWidth className={classes?.mt25}>
          <InputLabel style={{ fontSize: 17 }}>{t('campaigns.loyalty.pointsExpiry')}</InputLabel>
          <Select
            value={data?.LoyaltyExpiryCond || ''}
            onChange={(e) => handleChange('LoyaltyExpiryCond', e.target.value)}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {expiryCondOptions.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {(data?.LoyaltyExpiryCond === 'withindays') && (
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label={t('appBar.groups.loyalty.op.withinDays')}
            variant="standard"
            size="small"
            type="number"
            value={data?.LoyaltyExpiryDays ?? ''}
            onChange={(e) => handleChange('LoyaltyExpiryDays', e.target.value ? parseInt(e.target.value) : null)}
            fullWidth
            className={classes?.mt25}
            InputLabelProps={{ style: { fontSize: 17 } }}
          />
        </Grid>
      )}
      {(data?.LoyaltyExpiryCond === 'after' || data?.LoyaltyExpiryCond === 'before') && (
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label={t('campaigns.loyalty.pointsExpiry')}
            variant="standard"
            size="small"
            type="date"
            value={data?.LoyaltyExpiryDate || ''}
            onChange={(e) => handleChange('LoyaltyExpiryDate', e.target.value || null)}
            fullWidth
            className={classes?.mt25}
            InputLabelProps={{ shrink: true, style: { fontSize: 17 } }}
          />
        </Grid>
      )}

      {/* Opted In */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl variant="standard" fullWidth className={classes?.mt25}>
          <InputLabel style={{ fontSize: 17 }}>{t('appBar.groups.loyalty.optedIn')}</InputLabel>
          <Select
            value={data?.LoyaltyOptedIn === true ? 'true' : data?.LoyaltyOptedIn === false ? 'false' : ''}
            onChange={(e) => {
              const v = e.target.value;
              handleChange('LoyaltyOptedIn', v === '' ? null : v === 'true');
            }}
          >
            {optedInOptions.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label || <em>—</em>}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default ClientSearchLoyalty;
