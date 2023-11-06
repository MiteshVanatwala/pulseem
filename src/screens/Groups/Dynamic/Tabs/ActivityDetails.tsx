import clsx from 'clsx';
import {
    Grid, FormControl, MenuItem, Checkbox, FormControlLabel
} from '@material-ui/core'
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { ActivityGroup, ActivtyInterval } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';

const ActivityDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();

    return (
        <Grid container spacing={4} className={classes.pt25}>
            <Grid item xs={6} sm={3} md={3}>
                <FormControlLabel
                    control={
                        <Checkbox
                            onChange={(event: any) => {
                                const activities = { ...data?.dynamicData.MyActivities };
                                onUpdate({
                                    ...data?.dynamicData,
                                    MyActivities: { ...activities, IsOpened: !!event.target.checked } as ActivityGroup
                                })
                            }}
                            checked={!!data.dynamicData?.MyActivities?.IsOpened}
                            name="openedinlast"
                            color="primary"
                        />
                    }
                    label={t('common.isOpenedInTheLast')}
                    className={clsx(classes.pt5, classes.floatRight)}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
                <FormControl
                    variant="standard"
                    className={clsx(classes.selectInputFormControl, classes.w50)}
                >
                    <Select
                        variant='standard'
                        value={data.dynamicData?.MyActivities.IsOpenedInterval}
                        onChange={(event: any) => {
                            const activities = { ...data.dynamicData.MyActivities };
                            onUpdate({
                                ...data.dynamicData,
                                MyActivities: { ...activities, IsOpenedInterval: event.target.value } as ActivityGroup
                            })
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        className={clsx(classes.w100, classes.mt10)}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                    >
                        <MenuItem value={ActivtyInterval.LastWeek}>{t('common.lastWeek')}</MenuItem>
                        <MenuItem value={ActivtyInterval.Last2Weeks}>{t('common.last2Weeks')}</MenuItem>
                        <MenuItem value={ActivtyInterval.LastMonth}>{t('common.lastMonth')}</MenuItem>
                        <MenuItem value={ActivtyInterval.Last3Months}>{t('common.last3Months')}</MenuItem>
                        <MenuItem value={ActivtyInterval.Last6Months}>{t('common.last6Months')}</MenuItem>
                        <MenuItem value={ActivtyInterval.LastYear}>{t('common.lastYear')}</MenuItem>
                        <MenuItem value={ActivtyInterval.SpecificDates}>{t('common.specificDates')}</MenuItem>
                        <MenuItem value={ActivtyInterval.AllTheTime}>{t('common.specificDates')}</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={6} sm={3} md={3} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!!data.dynamicData?.MyActivities.IsNotOpened}
                            onChange={(event: any) => {
                                const activities = { ...data.dynamicData.MyActivities };
                                onUpdate({
                                    ...data.dynamicData,
                                    MyActivities: { ...activities, IsNotOpened: !!event.target.checked } as ActivityGroup
                                })
                            }}
                            name="notopenedinlast"
                            color="primary"
                        />
                    }
                    label={t('common.isNotOpenedInTheLast')}
                    className={clsx(classes.pt5, classes.floatRight)}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
                <FormControl
                    variant="standard"
                    className={clsx(classes.selectInputFormControl, classes.w50)}
                >
                    <Select
                        variant='standard'
                        value={data.dynamicData?.MyActivities.IsNotOpenedInterval}
                        onChange={(event: any) => {
                            const activities = { ...data.dynamicData.MyActivities };
                            onUpdate({
                                ...data.dynamicData,
                                MyActivities: { ...activities, IsNotOpenedInterval: event.target.value } as ActivityGroup
                            })
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        className={clsx(classes.w100, classes.mt10)}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                    >
                        <MenuItem value={ActivtyInterval.LastWeek}>{t('common.lastWeek')}</MenuItem>
                        <MenuItem value={ActivtyInterval.Last2Weeks}>{t('common.last2Weeks')}</MenuItem>
                        <MenuItem value={ActivtyInterval.LastMonth}>{t('common.lastMonth')}</MenuItem>
                        <MenuItem value={ActivtyInterval.Last3Months}>{t('common.last3Months')}</MenuItem>
                        <MenuItem value={ActivtyInterval.Last6Months}>{t('common.last6Months')}</MenuItem>
                        <MenuItem value={ActivtyInterval.LastYear}>{t('common.lastYear')}</MenuItem>
                        <MenuItem value={ActivtyInterval.SpecificDates}>{t('common.specificDates')}</MenuItem>
                        <MenuItem value={ActivtyInterval.AllTheTime}>{t('common.specificDates')}</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    )
}

export default ActivityDetails;