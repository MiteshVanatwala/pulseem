import clsx from 'clsx';
import {
    Grid, FormControl, MenuItem, Checkbox, FormControlLabel, Button
} from '@material-ui/core'
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { ActivtyTimeInterval } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';
import { DateField } from '../../../../components/managment';
import moment from "moment";
import { DateFormats } from '../../../../helpers/Constants';

const ActivityDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();

    return (
        <Grid container spacing={4} className={classes.pt25}>
            <Grid item xs={6} sm={6} md={2}>
                <FormControlLabel
                    control={
                        <Checkbox
                            onChange={(event: any) => onUpdate('IsOpened', !!event.target.checked)}
                            checked={!!data.dynamicData?.MyActivities?.IsOpened}
                            name="openedinlast"
                            color="primary"
                        />
                    }
                    label={t('common.isOpenedInTheLast')}
                    className={clsx(classes.pt5)}
                />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
                <FormControl
                    variant="standard"
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <Select
                        variant='standard'
                        value={data.dynamicData?.MyActivities.IsOpenedInterval}
                        onChange={(event: any) => onUpdate('IsOpenedInterval', event.target.value)}
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
                        <MenuItem value={ActivtyTimeInterval.LastWeek}>{t('common.lastWeek')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.Last2Weeks}>{t('common.last2Weeks')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.LastMonth}>{t('common.lastMonth')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.Last3Months}>{t('common.last3Months')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.Last6Months}>{t('common.last6Months')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.LastYear}>{t('common.lastYear')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.SpecificDates}>{t('common.specificDates')}</MenuItem>
                        {/* <MenuItem value={ActivtyTimeInterval.Ever}>{t('common.allTheTimes')}</MenuItem> */}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsOpenedInterval === ActivtyTimeInterval.SpecificDates && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={null}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsOpenedFromDate}
                                        onChange={(value: any) => onUpdate('IsOpenedFromDate', moment(value).format(DateFormats.DATE_ONLY))}
                                        placeholder={t('common.FromDate')}
                                        timePickerOpen={true}
                                        dateActive={true}
                                        onTimeChange={() => { }}
                                        timeActive={false}
                                        buttons={[]}
                                        removePadding={true}
                                        hideInvalidDateMessage={true}
                                    />
                                    {
                                        data.dynamicData?.MyActivities?.IsOpenedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsOpenedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={null}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsOpenedToDate}
                                        onChange={(value: any) => onUpdate('IsOpenedToDate', moment(value).format(DateFormats.DATE_ONLY))}
                                        placeholder={t('common.ToDate')}
                                        timePickerOpen={false}
                                        dateActive={true}
                                        onTimeChange={() => { }}
                                        timeActive={false}
                                        buttons={[]}
                                        removePadding={true}
                                        hideInvalidDateMessage={true}
                                    />
                                    {
                                        data.dynamicData?.MyActivities?.IsOpenedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsOpenedToDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>
                            </Grid>
                        </>
                    )
                }
            </Grid>

            <Grid item xs={6} sm={6} md={2} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!!data.dynamicData?.MyActivities.IsNotOpened}
                            onChange={(event: any) => onUpdate('IsNotOpened', !!event.target.checked)}
                            name="notopenedinlast"
                            color="primary"
                        />
                    }
                    label={t('common.isNotOpenedInTheLast')}
                    className={clsx(classes.pt5)}
                />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
                <FormControl
                    variant="standard"
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <Select
                        variant='standard'
                        value={data.dynamicData?.MyActivities.IsNotOpenedInterval}
                        onChange={(event: any) => onUpdate('IsNotOpenedInterval', event.target.value)}
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
                        <MenuItem value={ActivtyTimeInterval.LastWeek}>{t('common.lastWeek')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.Last2Weeks}>{t('common.last2Weeks')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.LastMonth}>{t('common.lastMonth')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.Last3Months}>{t('common.last3Months')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.Last6Months}>{t('common.last6Months')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.LastYear}>{t('common.lastYear')}</MenuItem>
                        <MenuItem value={ActivtyTimeInterval.SpecificDates}>{t('common.specificDates')}</MenuItem>
                        {/* <MenuItem value={ActivtyTimeInterval.Ever}>{t('common.allTheTimes')}</MenuItem> */}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsNotOpenedInterval === ActivtyTimeInterval.SpecificDates && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={moment()}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotOpenedFromDate}
                                        onChange={(value: any) => onUpdate('IsNotOpenedFromDate', moment(value).format(DateFormats.DATE_ONLY))}
                                        placeholder={t('common.FromDate')}
                                        timePickerOpen={true}
                                        dateActive={true}
                                        onTimeChange={() => { }}
                                        timeActive={false}
                                        buttons={[]}
                                        removePadding={true}
                                        hideInvalidDateMessage={true}
                                    />
                                    {
                                        data.dynamicData?.MyActivities?.IsNotOpenedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsNotOpenedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={moment()}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotOpenedToDate}
                                        onChange={(value: any) => onUpdate('IsNotOpenedToDate', moment(value).format(DateFormats.DATE_ONLY))}
                                        placeholder={t('common.ToDate')}
                                        timePickerOpen={false}
                                        dateActive={true}
                                        onTimeChange={() => { }}
                                        timeActive={false}
                                        buttons={[]}
                                        removePadding={true}
                                        hideInvalidDateMessage={true}
                                    />
                                    {
                                        data.dynamicData?.MyActivities?.IsNotOpenedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsNotOpenedToDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>
                            </Grid>
                        </>
                    )
                }
            </Grid>
        </Grid>
    )
}

export default ActivityDetails;