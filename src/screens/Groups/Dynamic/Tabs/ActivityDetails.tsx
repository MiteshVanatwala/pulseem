import clsx from 'clsx';
import {
    Grid, FormControl, Checkbox, FormControlLabel, Button
} from '@material-ui/core'
import 'moment/locale/he';
import { ActivtyTimeInterval } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';
import { DateField } from '../../../../components/managment';
import moment from "moment";
import { DateFormats } from '../../../../helpers/Constants';
import SelectActivityInteval from '../Components/SelectActivityInteval';

const ActivityDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();

    return (
        <Grid container spacing={4} className={classes.pt25}>
            {/* Opened Email In  */}
            <Grid item xs={6} sm={6} md={2}>
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={data.dynamicData?.MyActivities?.IsNotOpened === true}
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
                    <SelectActivityInteval
                        Disabled={data.dynamicData?.MyActivities?.IsNotOpened === true}
                        OnUpdate={(event: any) => onUpdate('IsOpenedInterval', event.target.value)}
                        Value={data.dynamicData?.MyActivities.IsOpenedInterval}
                        classes={classes}
                        key={'IsOpenedInterval'}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsOpenedInterval === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsOpened && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsOpened && data.dynamicData?.MyActivities?.IsOpenedFromDate}
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

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsOpened && data.dynamicData?.MyActivities?.IsOpenedToDate}
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
            {/* Not Opened Email In */}
            <Grid item xs={6} sm={6} md={2} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={data.dynamicData?.MyActivities?.IsOpened === true}
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
                    <SelectActivityInteval
                        Disabled={data.dynamicData?.MyActivities?.IsOpened === true}
                        OnUpdate={(event: any) => onUpdate('IsNotOpenedInterval', event.target.value)}
                        Value={data.dynamicData?.MyActivities.IsNotOpenedInterval}
                        classes={classes}
                        key={'IsNotOpenedInterval'}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsNotOpenedInterval === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsNotOpened && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

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
            {/* Clicked On a link in */}
            <Grid item xs={6} sm={6} md={2} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={data.dynamicData?.MyActivities.IsNotClicked === true || data.dynamicData?.MyActivities.IsNotOpened === true}
                            checked={!!data.dynamicData?.MyActivities.IsClicked}
                            onChange={(event: any) => onUpdate('IsClicked', !!event.target.checked)}
                            name="notopenedinlast"
                            color="primary"
                        />
                    }
                    label={t('common.clickedOnLink')}
                    className={clsx(classes.pt5)}
                />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
                <FormControl
                    variant="standard"
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <SelectActivityInteval
                        Disabled={data.dynamicData?.MyActivities.IsNotClicked === true || data.dynamicData?.MyActivities.IsNotOpened === true}
                        OnUpdate={(event: any) => onUpdate('IsClickedInterval', event.target.value)}
                        Value={data.dynamicData?.MyActivities.IsClickedInterval}
                        classes={classes}
                        key={'IsClickedInterval'}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsClickedInterval === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsClicked && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsClickedFromDate}
                                        onChange={(value: any) => onUpdate('IsClickedFromDate', moment(value).format(DateFormats.DATE_ONLY))}
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
                                        data.dynamicData?.MyActivities?.IsClickedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsClickedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsClickedToDate}
                                        onChange={(value: any) => onUpdate('IsClickedToDate', moment(value).format(DateFormats.DATE_ONLY))}
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
                                        data.dynamicData?.MyActivities?.IsClickedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsClickedToDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>
                            </Grid>
                        </>
                    )
                }
            </Grid>
            {/* Not ckiecked on a link in */}
            <Grid item xs={6} sm={6} md={2} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={data.dynamicData?.MyActivities.IsClicked === true}
                            checked={!!data.dynamicData?.MyActivities.IsNotClicked}
                            onChange={(event: any) => onUpdate('IsNotClicked', !!event.target.checked)}
                            name="notopenedinlast"
                            color="primary"
                        />
                    }
                    label={t('common.notClickedOnLink')}
                    className={clsx(classes.pt5)}
                />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
                <FormControl
                    variant="standard"
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <SelectActivityInteval
                        Disabled={data.dynamicData?.MyActivities.IsClicked === true}
                        OnUpdate={(event: any) => onUpdate('IsNotClickedInterval', event.target.value)}
                        Value={data.dynamicData?.MyActivities.IsNotClickedInterval}
                        classes={classes}
                        key={'IsNotClickedInterval'}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsNotClickedInterval === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsNotClicked && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotClickedFromDate}
                                        onChange={(value: any) => onUpdate('IsNotClickedFromDate', moment(value).format(DateFormats.DATE_ONLY))}
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
                                        data.dynamicData?.MyActivities?.IsNotClickedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsNotClickedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotClickedToDate}
                                        onChange={(value: any) => onUpdate('IsNotClickedToDate', moment(value).format(DateFormats.DATE_ONLY))}
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
                                        data.dynamicData?.MyActivities?.IsNotClickedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsNotClickedToDate', null)}>{t("recipient.reset")}</Button>
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