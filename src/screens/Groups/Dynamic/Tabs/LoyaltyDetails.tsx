import { Box, Grid, MenuItem, Select, TextField, Typography, FormControl } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

/**
 * PR-3418 — Yotpo loyalty conditions tab for the dynamic-group editor.
 * Writes into MyConditions[0] loyalty fields (operator = plain token string).
 * The TVF (SearchDynamicGroupClientsIDs_ByCampaigns_PageViewSupported) reads
 * these and joins loyalty_accounts. Inert when nothing is set.
 */
const LoyaltyDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();
    const cond = data?.dynamicData?.MyConditions?.[0] || {};

    const numOps = [
        { v: '', l: 'common.select' },
        { v: 'gt', l: 'groups.loyalty.op.over' },
        { v: 'lt', l: 'groups.loyalty.op.under' },
        { v: 'eq', l: 'groups.loyalty.op.equals' },
        { v: 'between', l: 'groups.loyalty.op.between' },
    ];
    const tierOps = [
        { v: '', l: 'common.select' },
        { v: 'eq', l: 'groups.loyalty.op.is' },
        { v: 'neq', l: 'groups.loyalty.op.isNot' },
    ];
    const expiryOps = [
        { v: '', l: 'common.select' },
        { v: 'withindays', l: 'groups.loyalty.op.withinDays' },
        { v: 'after', l: 'groups.loyalty.op.after' },
        { v: 'before', l: 'groups.loyalty.op.before' },
        { v: 'hasnoexpiry', l: 'groups.loyalty.op.noExpiry' },
    ];
    const optedOps = [
        { v: '', l: 'common.select' },
        { v: 'yes', l: 'common.Yes' },
        { v: 'no', l: 'common.No' },
    ];

    const opSelect = (condKey: string, ops: any[]) => (
        <FormControl className={clsx(classes.selectInputFormControl, classes.w100)}>
            <Select
                variant="standard"
                value={cond[condKey] || ''}
                onChange={(e: any) => onUpdate(condKey, e.target.value)}
            >
                {ops.map((o) => <MenuItem key={o.v} value={o.v}>{t(o.l)}</MenuItem>)}
            </Select>
        </FormControl>
    );

    const valueField = (key: string, type: string = 'number', disabled: boolean = false) => (
        <TextField
            size="small"
            type={type}
            value={cond[key] || ''}
            disabled={disabled}
            onChange={(e: any) => onUpdate(key, e.target.value)}
            className={clsx(classes.dBlock)}
        />
    );

    const row = (labelKey: string, condSelect: JSX.Element, valueEls: JSX.Element) => (
        <Grid container spacing={2} className={clsx(classes.pt14)} alignItems="center">
            <Grid item xs={12} md={4}>
                <Typography className={clsx(classes.bold)}>{t(labelKey)}</Typography>
            </Grid>
            <Grid item xs={6} md={4}>{condSelect}</Grid>
            <Grid item xs={6} md={4}>{valueEls}</Grid>
        </Grid>
    );

    return (
        <Box className={clsx(classes.pt14)}>
            <Typography className={clsx(classes.mb5)} style={{ color: '#7C3AED', fontWeight: 600 }}>
                {'💎 '}{t('groups.loyalty.title')}
            </Typography>

            {row('campaigns.loyalty.points', opSelect('LoyaltyPointsCond', numOps),
                <Box style={{ display: 'flex', gap: 8 }}>
                    {valueField('LoyaltyPoints')}
                    {cond.LoyaltyPointsCond === 'between' && valueField('LoyaltyPointsTo')}
                </Box>)}

            {row('campaigns.loyalty.tier', opSelect('LoyaltyTierCond', tierOps), valueField('LoyaltyTier', 'text'))}

            {row('campaigns.loyalty.pointsEarned', opSelect('LoyaltyPointsEarnedCond', numOps),
                <Box style={{ display: 'flex', gap: 8 }}>
                    {valueField('LoyaltyPointsEarned')}
                    {cond.LoyaltyPointsEarnedCond === 'between' && valueField('LoyaltyPointsEarnedTo')}
                </Box>)}

            {row('campaigns.loyalty.pointsExpiry', opSelect('LoyaltyExpiryCond', expiryOps),
                valueField('LoyaltyExpiry', cond.LoyaltyExpiryCond === 'withindays' ? 'number' : 'date',
                    cond.LoyaltyExpiryCond === 'hasnoexpiry'))}

            {row('groups.loyalty.optedIn', opSelect('LoyaltyOptedInCond', optedOps), <span />)}
        </Box>
    );
};

export default LoyaltyDetails;
