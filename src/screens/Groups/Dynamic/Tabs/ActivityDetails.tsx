import clsx from 'clsx';
import {
    Grid, Checkbox, FormControlLabel, Button,
    TextField
} from '@material-ui/core'
import 'moment/locale/he';
import { ActivtyTimeInterval } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';
import { DateField } from '../../../../components/managment';
import moment from "moment";
import { DateFormats } from '../../../../helpers/Constants';
import SelectActivityInteval from '../Components/SelectActivityInteval';
import SelectCampaignType from '../Components/SelectCampaignType';

const ActivityDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();

    return (
        <Grid container spacing={4} className={classes.pt25}>
            {/* Opened Email In  */}
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
                <SelectActivityInteval
                    Disabled={!data.dynamicData?.MyActivities?.IsOpened}
                    OnUpdate={(event: any) => onUpdate('IsOpenedInterval', event.target.value)}
                    Value={!data.dynamicData?.MyActivities?.IsOpened ? null : data.dynamicData?.MyActivities.IsOpenedInterval}
                    classes={classes}
                    key={'IsOpenedInterval'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsOpenedInterval.toString() === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsOpened && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsOpened && data.dynamicData?.MyActivities?.IsOpenedFromDate}
                                        onChange={(value: any) => onUpdate('IsOpenedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        onChange={(value: any) => onUpdate('IsOpenedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                {
                    data.dynamicData?.MyActivities?.IsOpenedInterval?.toString() === ActivtyTimeInterval.DaysBack && data.dynamicData?.MyActivities?.IsOpened && (
                        <TextField
                            label={t('common.typeDaysBack')}
                            variant='standard'
                            size='small'
                            value={data.dynamicData?.MyActivities?.IsOpenedDaysBack}
                            onChange={(event: any) => onUpdate('IsOpenedDaysBack', event.target.value)}
                            className={clsx(classes.textField)}
                            style={{ maxWidth: 200, marginTop: '0px !important', padding: '3px 0 2px 0 !important' }}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17,
                                    marginTop: '0px !important',
                                }
                            }}
                        />
                    )
                }
            </Grid>
            {/* Not Opened Email In */}
            <Grid item xs={6} sm={6} md={2} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            // disabled={data.dynamicData?.MyActivities?.IsOpened === true}
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
                <SelectActivityInteval
                    Disabled={!data.dynamicData?.MyActivities.IsNotOpened}
                    OnUpdate={(event: any) => onUpdate('IsNotOpenedInterval', event.target.value)}
                    Value={!data.dynamicData?.MyActivities.IsNotOpened ? null : data.dynamicData?.MyActivities.IsNotOpenedInterval}
                    classes={classes}
                    key={'IsNotOpenedInterval'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsNotOpenedInterval.toString() === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsNotOpened && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotOpenedFromDate}
                                        onChange={(value: any) => onUpdate('IsNotOpenedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        onChange={(value: any) => onUpdate('IsNotOpenedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                {
                    data.dynamicData?.MyActivities?.IsNotOpenedInterval?.toString() === ActivtyTimeInterval.DaysBack && data.dynamicData?.MyActivities?.IsNotOpened && (
                        <TextField
                            label={t('common.typeDaysBack')}
                            variant='standard'
                            size='small'
                            value={data.dynamicData?.MyActivities?.IsNotOpenedDaysBack}
                            onChange={(event: any) => onUpdate('IsNotOpenedDaysBack', event.target.value)}
                            className={clsx(classes.textField)}
                            style={{ maxWidth: 200, marginTop: '0px !important', padding: '3px 0 2px 0 !important' }}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17,
                                    marginTop: '0px !important',
                                }
                            }}
                        />
                    )
                }
            </Grid>
            {/* Clicked On a link in */}
            <Grid item xs={6} sm={6} md={2} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            // disabled={data.dynamicData?.MyActivities.IsNotClicked === true || data.dynamicData?.MyActivities.IsNotOpened === true}
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
                <SelectActivityInteval
                    Disabled={!data.dynamicData?.MyActivities.IsClicked}
                    OnUpdate={(event: any) => onUpdate('IsClickedInterval', event.target.value)}
                    Value={!data.dynamicData?.MyActivities.IsClicked ? null : data.dynamicData?.MyActivities.IsClickedInterval}
                    classes={classes}
                    key={'IsClickedInterval'}
                />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
                <SelectCampaignType
                    Disabled={!data.dynamicData?.MyActivities?.IsClicked}
                    OnUpdate={(event: any) => {
                        if (event.target.value !== null) {
                            onUpdate('IsClickInCampaignTypes', event.target.value.join(','))
                        }
                        else {
                            onUpdate('IsClickInCampaignTypes', event.target.value)
                        }
                    }}
                    Value={!data.dynamicData?.MyActivities?.IsClicked ? null : data.dynamicData?.MyActivities?.IsClickInCampaignTypes}
                    classes={classes}
                    key={'IsClickInCampaignTypes'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={6} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsClickedInterval.toString() === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsClicked && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsClickedFromDate}
                                        onChange={(value: any) => onUpdate('IsClickedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        onChange={(value: any) => onUpdate('IsClickedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                {
                    data.dynamicData?.MyActivities?.IsClickedInterval?.toString() === ActivtyTimeInterval.DaysBack && data.dynamicData?.MyActivities?.IsClicked && (
                        <TextField
                            label={t('common.typeDaysBack')}
                            variant='standard'
                            size='small'
                            value={data.dynamicData?.MyActivities?.IsClickedDaysBack}
                            onChange={(event: any) => onUpdate('IsClickedDaysBack', event.target.value)}
                            className={clsx(classes.textField)}
                            style={{ maxWidth: 200, marginTop: '0px !important', padding: '3px 0 2px 0 !important' }}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17,
                                    marginTop: '0px !important',
                                }
                            }}
                        />
                    )
                }
            </Grid>
            {/* Not ckiecked on a link in */}
            <Grid item xs={6} sm={6} md={2} className={classes.pt5}>
                <FormControlLabel
                    control={
                        <Checkbox
                            // disabled={data.dynamicData?.MyActivities.IsClicked === true}
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
                <SelectActivityInteval
                    Disabled={!data.dynamicData?.MyActivities.IsNotClicked}
                    OnUpdate={(event: any) => {
                        if (event.target.value !== null) {
                            onUpdate('IsNotClickedInterval', event.target.value.join(','))
                        }
                        else {
                            onUpdate('IsNotClickedInterval', event.target.value)
                        }
                    }}
                    Value={!data.dynamicData?.MyActivities.IsNotClicked ? null : data.dynamicData?.MyActivities.IsNotClickedInterval}
                    classes={classes}
                    key={'IsNotClickedInterval'}
                />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
                <SelectCampaignType
                    Disabled={!data.dynamicData?.MyActivities?.IsClicked}
                    OnUpdate={(event: any) => {
                        if (event.target.value !== null) {
                            onUpdate('IsNotClickInCampaignTypes', event.target.value.join(','))
                        }
                        else {
                            onUpdate('IsNotClickInCampaignTypes', event.target.value)
                        }
                    }}
                    Value={!data.dynamicData?.MyActivities?.IsClicked ? null : data.dynamicData?.MyActivities?.IsNotClickInCampaignTypes}
                    classes={classes}
                    key={'IsNotClickInCampaignTypes'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={6} className={classes.pt5}>
                {
                    data.dynamicData?.MyActivities.IsNotClickedInterval.toString() === ActivtyTimeInterval.SpecificDates && data.dynamicData?.MyActivities?.IsNotClicked && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}

                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotClickedFromDate}
                                        onChange={(value: any) => onUpdate('IsNotClickedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        onChange={(value: any) => onUpdate('IsNotClickedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                {
                    data.dynamicData?.MyActivities?.IsNotClickedInterval?.toString() === ActivtyTimeInterval.DaysBack && data.dynamicData?.MyActivities?.IsNotClicked && (
                        <TextField
                            label={t('common.typeDaysBack')}
                            variant='standard'
                            size='small'
                            value={data.dynamicData?.MyActivities?.IsNotClickedDaysBack}
                            onChange={(event: any) => onUpdate('IsNotClickedDaysBack', event.target.value)}
                            className={clsx(classes.textField)}
                            style={{ maxWidth: 200, marginTop: '0px !important', padding: '3px 0 2px 0 !important' }}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17,
                                    marginTop: '0px !important',
                                }
                            }}
                        />
                    )
                }
            </Grid>
        </Grid>
    )
}

export default ActivityDetails;