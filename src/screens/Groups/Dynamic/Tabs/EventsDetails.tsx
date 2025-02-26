import clsx from 'clsx';
import {
    Grid, FormControl, MenuItem, Checkbox, FormControlLabel, InputLabel, TextField, Button, FormHelperText
} from '@material-ui/core'
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { ActivityEvent, ActivtyTimeInterval } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import SelectActivityInteval from '../Components/SelectActivityInteval';
import { DateField } from '../../../../components/managment';
import moment from 'moment';
import { DateFormats } from '../../../../helpers/Constants';
import SelectComparingType from '../Components/SelectComparingType';
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils';
import SelectProductCategories from '../Components/SelectProductCategories';
import SelectProductUrl from '../Components/SelectProductUrl';

const EventsDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();
    const [optionsDisabled, setOptionDisabled] = useState<boolean>(false);

    useEffect(() => {
        setOptionDisabled(data.dynamicData?.MyActivities.IsPurchased ||
            data.dynamicData?.MyActivities.IsNotPurchased ||
            data.dynamicData?.MyActivities.IsAbandoned /* || data.dynamicData?.MyActivities.IsPageViewed */
        )
    }, [data.dynamicData?.MyActivities]);

    // useEffect(() => {
    //     if (data.dynamicData?.MyActivities?.IsAbandonedComparingType?.toString() === ActivityEvent.Any ||
    //         data.dynamicData?.MyActivities?.IsPurchasedComparingType?.toString() === ActivityEvent.Any ||
    //         data.dynamicData?.MyActivities?.IsNotPurchasedComparingType?.toString() === ActivityEvent.Any) {
    //         onResetPrices();
    //     }

    // }, [
    //     data.dynamicData?.MyActivities?.IsAbandonedComparingType,
    //     data.dynamicData?.MyActivities?.IsPurchasedComparingType,
    //     data.dynamicData?.MyActivities?.IsNotPurchasedComparingType
    // ]);

    const renderIsPurchased = () => {
        return (
            <Grid container spacing={4} className={classes.pt25}>
                <Grid item xs={6} sm={6} md={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={optionsDisabled && !data.dynamicData?.MyActivities.IsPurchased}
                                onChange={(event: any) => onUpdate('IsPurchased', !!event.target.checked)}
                                checked={!!data.dynamicData?.MyActivities.IsPurchased}
                                name="openedinlast"
                                color="primary"
                            />
                        }
                        label={t('common.isPurchase')}
                        className={clsx(classes.pt5)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={2} className={clsx(classes.p10, classes.pb25)}>
                    <SelectActivityInteval
                        Disabled={!data.dynamicData?.MyActivities.IsPurchased}
                        OnUpdate={(event: any) => onUpdate('IsPurchasedInterval', event.target.value)}
                        Value={!data.dynamicData?.MyActivities.IsPurchased ? null : data.dynamicData?.MyActivities.IsPurchasedInterval}
                        classes={classes}
                        key={'IsPurchasedInterval'}
                    />
                </Grid>
                {
                    data.dynamicData?.MyActivities.IsPurchasedInterval.toString() === ActivtyTimeInterval.SpecificDates && (
                        <Grid item xs={12} sm={3} md={3} className={classes.pt5}>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsPurchased && data.dynamicData?.MyActivities.IsPurchasedFromDate}
                                        onChange={(value: any) => onUpdate('IsPurchasedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsOpenedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsPurchasedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={data.dynamicData?.MyActivities.IsPurchasedFromDate || undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsPurchased && data.dynamicData?.MyActivities.IsPurchasedToDate}
                                        onChange={(value: any) => onUpdate('IsPurchasedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsOpenedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsPurchasedToDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }
                {
                    data.dynamicData?.MyActivities?.IsPurchasedInterval?.toString() === ActivtyTimeInterval.DaysBack && data.dynamicData?.MyActivities?.IsPurchased && (
                        <Grid item xs={3} sm={3} md={2} className={classes.pt5}>
                            <TextField
                                label={t('common.typeDaysBack')}
                                variant='standard'
                                size='small'
                                value={data.dynamicData?.MyActivities?.IsPurchasedDaysBack}
                                onChange={(event: any) => onUpdate('IsPurchasedDaysBack', event.target.value)}
                                className={clsx(classes.textField)}
                                style={{ maxWidth: 200, marginTop: '0px !important', padding: '3px 0 2px 0 !important' }}
                                InputLabelProps={{
                                    style: {
                                        fontSize: 17,
                                        marginTop: '0px !important',
                                    }
                                }}
                            />
                        </Grid>
                    )
                }
                <Grid item xs={6} sm={6} md={2}>
                    <SelectComparingType
                        Disabled={!data.dynamicData?.MyActivities.IsPurchased}
                        Value={data.dynamicData?.MyActivities.IsPurchasedComparingType || ActivityEvent.Any}
                        OnUpdate={(event: any) => {
                            if (event.target.value === ActivityEvent.Any) {
                                onUpdate('', '', {
                                    IsPurchasedComparingType: ActivityEvent.Any,
                                    IsPurchasedMinPrice: null,
                                    IsPurchasedMaxPrice: null,
                                    PurchasedPrice: null
                                })
                            }
                            else {
                                onUpdate('IsPurchasedComparingType', event.target.value)
                            }
                        }}
                        classes={classes}
                        key={'IsPurchasedComparingType'}
                    />
                </Grid>
                {(data.dynamicData?.MyActivities.IsPurchasedComparingType.toString() === ActivityEvent.LessThan || data.dynamicData?.MyActivities.IsPurchasedComparingType.toString() === ActivityEvent.MoreThan) && data.dynamicData?.MyActivities.IsPurchased && <Grid item xs={12} sm={2} md={2} className={classes.pt5}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                            <InputLabel className={classes.fBlack}>{t('common.price')}:</InputLabel>
                            <TextField
                                placeholder={t('common.price')}
                                variant='outlined'
                                size='small'
                                value={data.dynamicData?.MyActivities.PurchasedPrice}
                                onChange={(event: any) => onUpdate('PurchasedPrice', event.target.value.trim())}
                                className={clsx(classes.w100, classes.textField)}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                }
                {
                    data.dynamicData?.MyActivities.IsPurchasedComparingType.toString() === ActivityEvent.Range && data.dynamicData?.MyActivities.IsPurchased && <Grid item xs={12} sm={3} md={3} className={classes.pt5}>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                                <InputLabel className={classes.fBlack}>{t('common.minPrice')}:</InputLabel>
                                <TextField
                                    id="purchaseMinPrice"
                                    placeholder={t('common.minPrice')}
                                    variant='outlined'
                                    size='small'
                                    value={data.dynamicData?.MyActivities.IsPurchasedMinPrice}
                                    onChange={(event: any) => onUpdate('IsPurchasedMinPrice', event.target.value.trim())}
                                    className={clsx(classes.w100, classes.textField)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                                <InputLabel className={classes.fBlack}>{t('common.maxPrice')}:</InputLabel>
                                <TextField
                                    id="purchaseMaxPrice"
                                    placeholder={t('common.maxPrice')}
                                    variant='outlined'
                                    size='small'
                                    value={data.dynamicData?.MyActivities.IsPurchasedMaxPrice}
                                    onChange={(event: any) => onUpdate('IsPurchasedMaxPrice', event.target.value.trim())}
                                    className={clsx(classes.w100, classes.textField, parseInt(data.dynamicData?.MyActivities.IsPurchasedMaxPrice) < parseInt(data.dynamicData?.MyActivities.IsPurchasedMinPrice) ? classes.error : null)}
                                />
                                {parseInt(data.dynamicData?.MyActivities.IsPurchasedMaxPrice) < parseInt(data.dynamicData?.MyActivities.IsPurchasedMinPrice) &&
                                    <FormHelperText className={classes.red}>{t('common.priceRangeError')}</FormHelperText>}
                            </Grid>
                        </Grid>
                    </Grid>
                }
                <Grid item xs={6} sm={6} md={2}>
                    <SelectProductCategories
                        classes={classes}
                        disabled={!data.dynamicData?.MyActivities.IsPurchased}
                        data={data.dynamicData?.MyActivities?.PurchasedProductCategory?.split(',')}
                        onUpdate={(value: any) => {
                            if (value !== null) {
                                onUpdate('PurchasedProductCategory', value.join(','))
                            }
                            else {
                                onUpdate('PurchasedProductCategory', value)
                            }
                        }} />
                </Grid>
            </Grid>

        );
    }

    const renderIsNotPurchased = () => {
        return (
            <Grid container spacing={4} className={classes.pt25}>
                <Grid item xs={6} sm={6} md={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={optionsDisabled && !data.dynamicData?.MyActivities.IsNotPurchased}
                                // disabled={data.dynamicData?.MyActivities?.IsPurchased === true}
                                onChange={(event: any) => onUpdate('IsNotPurchased', !!event.target.checked)}
                                checked={!!data.dynamicData?.MyActivities.IsNotPurchased}
                                name="openedinlast"
                                color="primary"
                            />
                        }
                        label={t('common.isNotPurchase')}
                        className={clsx(classes.pt5)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={2} className={clsx(classes.p10, classes.pb25)}>
                    <SelectActivityInteval
                        Disabled={!data.dynamicData?.MyActivities.IsNotPurchased}
                        OnUpdate={(event: any) => onUpdate('IsNotPurchasedInterval', event.target.value)}
                        Value={!data.dynamicData?.MyActivities.IsNotPurchased ? null : data.dynamicData?.MyActivities.IsNotPurchasedInterval}
                        classes={classes}
                        key={'IsNotPurchasedInterval'}
                    />
                </Grid>
                {
                    data.dynamicData?.MyActivities.IsNotPurchasedInterval.toString() === ActivtyTimeInterval.SpecificDates && (
                        <Grid item xs={12} sm={3} md={3} className={classes.pt5}>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotPurchased && data.dynamicData?.MyActivities.IsNotPurchasedFromDate}
                                        onChange={(value: any) => onUpdate('IsNotPurchasedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsOpenedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsNotPurchasedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={data.dynamicData?.MyActivities.IsNotPurchasedFromDate || undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsNotPurchased && data.dynamicData?.MyActivities.IsNotPurchasedToDate}
                                        onChange={(value: any) => onUpdate('IsNotPurchasedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsOpenedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsNotPurchasedToDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }
                {
                    data.dynamicData?.MyActivities?.IsNotPurchasedInterval?.toString() === ActivtyTimeInterval.DaysBack && data.dynamicData?.MyActivities?.IsNotPurchased && (
                        <Grid item xs={3} sm={3} md={2} className={classes.pt5}>
                            <TextField
                                label={t('common.typeDaysBack')}
                                variant='standard'
                                size='small'
                                value={data.dynamicData?.MyActivities?.IsNotPurchasedDaysBack}
                                onChange={(event: any) => onUpdate('IsNotPurchasedDaysBack', event.target.value)}
                                className={clsx(classes.textField)}
                                style={{ maxWidth: 200, marginTop: '0px !important', padding: '3px 0 2px 0 !important' }}
                                InputLabelProps={{
                                    style: {
                                        fontSize: 17,
                                        marginTop: '0px !important',
                                    }
                                }}
                            />
                        </Grid>
                    )
                }
                <Grid item xs={6} sm={6} md={2}>
                    <SelectComparingType
                        Disabled={!data.dynamicData?.MyActivities.IsNotPurchased}
                        Value={data.dynamicData?.MyActivities.IsNotPurchasedComparingType || ActivityEvent.Any}
                        OnUpdate={(event: any) => {
                            if (event.target.value === ActivityEvent.Any) {
                                onUpdate('', '', {
                                    IsNotPurchasedComparingType: ActivityEvent.Any,
                                    IsNotPurchasedMinPrice: null,
                                    IsNotPurchasedMaxPrice: null,
                                    NotPurchasedPrice: null
                                })
                            }
                            else {
                                onUpdate('IsNotPurchasedComparingType', event.target.value)
                            }
                        }}
                        classes={classes}
                        key={'IsNotPurchasedComparingType'}
                    />
                </Grid>
                {(data.dynamicData?.MyActivities.IsNotPurchasedComparingType.toString() === ActivityEvent.LessThan || data.dynamicData?.MyActivities.IsNotPurchasedComparingType.toString() === ActivityEvent.MoreThan) && data.dynamicData?.MyActivities.IsNotPurchased && (<Grid item xs={12} sm={4} md={4} className={classes.pt5}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                            <InputLabel className={classes.fBlack}>{t('common.price')}:</InputLabel>
                            <TextField
                                placeholder={t('common.price')}
                                variant='outlined'
                                size='small'
                                value={data.dynamicData?.MyActivities.NotPurchasedPrice}
                                onChange={(event: any) => onUpdate('NotPurchasedPrice', event.target.value.trim())}
                                className={clsx(classes.w100, classes.textField)}
                            />
                        </Grid>
                    </Grid>
                </Grid>)
                }

                {data.dynamicData?.MyActivities.IsNotPurchasedComparingType.toString() === ActivityEvent.Range && data.dynamicData?.MyActivities.IsNotPurchased && <Grid item xs={12} sm={4} md={4} className={classes.pt5}>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                            <InputLabel className={classes.fBlack}>{t('common.minPrice')}:</InputLabel>
                            <TextField
                                id="notPurchaseMinPrice"
                                placeholder={t('common.minPrice')}
                                variant='outlined'
                                size='small'
                                value={data.dynamicData?.MyActivities.IsNotPurchasedMinPrice}
                                onChange={(event: any) => onUpdate('IsNotPurchasedMinPrice', event.target.value.trim())}
                                className={clsx(classes.w100, classes.textField)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                            <InputLabel className={classes.fBlack}>{t('common.maxPrice')}:</InputLabel>
                            <TextField
                                id="notPurchaseMaxPrice"
                                placeholder={t('common.maxPrice')}
                                variant='outlined'
                                size='small'
                                value={data.dynamicData?.MyActivities.IsNotPurchasedMaxPrice}
                                onChange={(event: any) => onUpdate('IsNotPurchasedMaxPrice', event.target.value.trim())}
                                className={clsx(classes.w100, classes.textField, parseInt(data.dynamicData?.MyActivities.IsNotPurchasedMaxPrice) < parseInt(data.dynamicData?.MyActivities.IsNotPurchasedMinPrice) ? classes.error : null)}
                            />
                            {parseInt(data.dynamicData?.MyActivities.IsNotPurchasedMaxPrice) < parseInt(data.dynamicData?.MyActivities.IsNotPurchasedMinPrice) &&
                                <FormHelperText className={classes.red}>{t('common.priceRangeError')}</FormHelperText>}
                        </Grid>
                    </Grid>
                </Grid>
                }
                <Grid item xs={6} sm={6} md={2}>
                    <SelectProductCategories
                        classes={classes}
                        disabled={!data.dynamicData?.MyActivities.IsNotPurchased}
                        data={data.dynamicData?.MyActivities?.IsPageViewedProductCategory?.split(',')}
                        onUpdate={(value: any) => {
                            if (value !== null) {
                                onUpdate('IsPageViewedProductCategory', value.join(','))
                            }
                            else {
                                onUpdate('IsPageViewedProductCategory', value)
                            }
                        }} />
                </Grid>
            </Grid>

        );
    }

    const renderAbandoned = () => {
        return (
            <Grid container spacing={4} className={classes.pt25}>
                <Grid item xs={6} sm={6} md={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={optionsDisabled && !data.dynamicData?.MyActivities.IsAbandoned}
                                // disabled={data.dynamicData?.MyActivities?.IsPurchased === true}
                                onChange={(event: any) => onUpdate('IsAbandoned', !!event.target.checked)}
                                checked={!!data.dynamicData?.MyActivities.IsAbandoned}
                                name="openedinlast"
                                color="primary"
                            />
                        }
                        label={t('common.abandonedCart')}
                        className={clsx(classes.pt5)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={2} className={clsx(classes.p10, classes.pb25)}>
                    <SelectActivityInteval
                        Disabled={!data.dynamicData?.MyActivities.IsAbandoned}
                        OnUpdate={(event: any) => onUpdate('IsAbandonedInterval', event.target.value)}
                        Value={!data.dynamicData?.MyActivities.IsAbandoned ? null : data.dynamicData?.MyActivities.IsAbandonedInterval}
                        classes={classes}
                        key={'IsAbandonedInterval'}
                    />
                </Grid>
                {
                    data.dynamicData?.MyActivities.IsAbandonedInterval.toString() === ActivtyTimeInterval.SpecificDates && (
                        <Grid item xs={12} sm={3} md={3} className={classes.pt5}>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsAbandoned && data.dynamicData?.MyActivities.IsAbandonedFromDate}
                                        onChange={(value: any) => onUpdate('IsAbandonedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsOpenedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsAbandonedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={data.dynamicData?.MyActivities.IsAbandonedFromDate || undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsAbandoned && data.dynamicData?.MyActivities.IsAbandonedToDate}
                                        onChange={(value: any) => onUpdate('IsAbandonedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsOpenedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsAbandonedToDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }
                {
                    data.dynamicData?.MyActivities?.IsAbandonedInterval?.toString() === ActivtyTimeInterval.DaysBack && data.dynamicData?.MyActivities?.IsAbandoned && (
                        <Grid item xs={3} sm={3} md={2} className={classes.pt5}>
                            <TextField
                                label={t('common.typeDaysBack')}
                                variant='standard'
                                size='small'
                                value={data.dynamicData?.MyActivities?.IsAbandonedDaysBack}
                                onChange={(event: any) => onUpdate('IsAbandonedDaysBack', event.target.value)}
                                className={clsx(classes.textField)}
                                style={{ maxWidth: 200, marginTop: '0px !important', padding: '3px 0 2px 0 !important' }}
                                InputLabelProps={{
                                    style: {
                                        fontSize: 17,
                                        marginTop: '0px !important',
                                    }
                                }}
                            />
                        </Grid>
                    )
                }
                <Grid item xs={6} sm={6} md={2}>
                    <SelectComparingType
                        Disabled={!data.dynamicData?.MyActivities.IsAbandoned}
                        Value={data.dynamicData?.MyActivities.IsAbandonedComparingType || ActivityEvent.Any}
                        OnUpdate={(event: any) => {
                            if (event.target.value === ActivityEvent.Any) {
                                onUpdate('', '', {
                                    IsAbandonedComparingType: ActivityEvent.Any,
                                    IsAbandonedMinPrice: null,
                                    IsAbandonedMaxPrice: null,
                                    AbandonedPrice: null
                                })
                            }
                            else {
                                onUpdate('IsAbandonedComparingType', event.target.value)
                            }
                        }}
                        classes={classes}
                        key={'IsAbandonedComparingType'}
                    />
                </Grid>
                {(data.dynamicData?.MyActivities.IsAbandonedComparingType.toString() === ActivityEvent.LessThan || data.dynamicData?.MyActivities.IsAbandonedComparingType.toString() === ActivityEvent.MoreThan) && data.dynamicData?.MyActivities.IsAbandoned && (<Grid item xs={12} sm={4} md={4} className={classes.pt5}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                            <InputLabel className={classes.fBlack}>{t('common.price')}:</InputLabel>
                            <TextField
                                placeholder={t('common.price')}
                                variant='outlined'
                                size='small'
                                value={data.dynamicData?.MyActivities.AbandonedPrice}
                                onChange={(event: any) => onUpdate('AbandonedPrice', event.target.value.trim())}
                                className={clsx(classes.w100, classes.textField)}
                            />
                        </Grid>
                    </Grid>
                </Grid>)
                }

                {data.dynamicData?.MyActivities.IsAbandonedComparingType.toString() === ActivityEvent.Range && data.dynamicData?.MyActivities.IsAbandoned && <Grid item xs={12} sm={4} md={4} className={classes.pt5}>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                            <InputLabel className={classes.fBlack}>{t('common.minPrice')}:</InputLabel>
                            <TextField
                                id="abandonedMinPrice"
                                placeholder={t('common.minPrice')}
                                variant='outlined'
                                size='small'
                                value={data.dynamicData?.MyActivities.IsAbandonedMinPrice}
                                onChange={(event: any) => onUpdate('IsAbandonedMinPrice', event.target.value.trim())}
                                className={clsx(classes.w100, classes.textField)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} className={clsx(classes.p10, classes.pb25)}>
                            <InputLabel className={classes.fBlack}>{t('common.maxPrice')}:</InputLabel>
                            <TextField
                                id="abandonedMaxPrice"
                                placeholder={t('common.maxPrice')}
                                variant='outlined'
                                size='small'
                                value={data.dynamicData?.MyActivities.IsAbandonedMaxPrice}
                                onChange={(event: any) => onUpdate('IsAbandonedMaxPrice', event.target.value.trim())}
                                className={clsx(classes.w100, classes.textField, parseInt(data.dynamicData?.MyActivities.IsAbandonedMaxPrice) < parseInt(data.dynamicData?.MyActivities.IsAbandonedMinPrice) ? classes.error : null)}
                            />
                            {parseInt(data.dynamicData?.MyActivities.IsAbandonedMaxPrice) < parseInt(data.dynamicData?.MyActivities.IsAbandonedMinPrice) &&
                                <FormHelperText className={classes.red}>{t('common.priceRangeError')}</FormHelperText>}
                        </Grid>
                    </Grid>
                </Grid>
                }
                <Grid item xs={6} sm={6} md={2}>
                    <SelectProductCategories
                        classes={classes}
                        disabled={!data.dynamicData?.MyActivities.IsAbandoned}
                        data={data.dynamicData?.MyActivities?.AbandonedProductCategory?.split(',')}
                        onUpdate={(value: any) => {
                            if (value !== null) {
                                onUpdate('AbandonedProductCategory', value.join(','))
                            }
                            else {
                                onUpdate('AbandonedProductCategory', value)
                            }
                        }} />
                </Grid>
            </Grid>

        );
    }

    const renderPageViewed = () => {
        return (
            <Grid container spacing={4} className={classes.pt25}>
                <Grid item xs={6} sm={6} md={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={optionsDisabled && !data.dynamicData?.MyActivities.IsPageViewed}
                                onChange={(event: any) => onUpdate('IsPageViewed', !!event.target.checked)}
                                checked={!!data.dynamicData?.MyActivities.IsPageViewed}
                                name="openedinlast"
                                color="primary"
                            />
                        }
                        label={t('common.pageViewed')}
                        className={clsx(classes.pt5)}
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={2} className={clsx(classes.p10, classes.pb25)}>
                    <SelectActivityInteval
                        Disabled={!data.dynamicData?.MyActivities.IsPageViewed}
                        OnUpdate={(event: any) => onUpdate('IsPageViewedInterval', event.target.value)}
                        Value={data.dynamicData?.MyActivities.IsPageViewedInterval}
                        classes={classes}
                        key={'IsPageViewedInterval'}
                    />
                </Grid>
                {
                    data.dynamicData?.MyActivities.IsPageViewedInterval.toString() === ActivtyTimeInterval.SpecificDates && (
                        <Grid item xs={12} sm={3} md={3} className={classes.pt5}>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsAbandoned && data.dynamicData?.MyActivities.IsPageViewedFromDate}
                                        onChange={(value: any) => onUpdate('IsPageViewedFromDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsPageViewedFromDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsAbandonedFromDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>

                                <Grid item xs={6} sm={6} md={6}>
                                    {/* @ts-ignore */}
                                    <DateField
                                        toolbarDisabled={false}
                                        minDate={data.dynamicData?.MyActivities.IsPageViewedFromDate || undefined}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={data.dynamicData?.MyActivities?.IsAbandoned && data.dynamicData?.MyActivities.IsPageViewedToDate}
                                        onChange={(value: any) => onUpdate('IsPageViewedToDate', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
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
                                        data.dynamicData?.MyActivities?.IsPageViewedToDate && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('IsAbandonedToDate', null)}>{t("recipient.reset")}</Button>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }
                <Grid item xs={6} sm={6} md={4}>
                    <SelectProductUrl
                        classes={classes}
                        disabled={!data.dynamicData?.MyActivities.IsPageViewed}
                        data={data.dynamicData?.MyActivities?.PageViewedUrlIDs?.split(',')}
                        onUpdate={(value: any) => {
                            if (value !== null) {
                                onUpdate('PageViewedUrlIDs', value.join(','))
                            }
                            else {
                                onUpdate('PageViewedUrlIDs', value)
                            }
                        }} />
                </Grid>
            </Grid>

        );
    }

    return (<>
        <Grid item xs={12} className={clsx(classes.pb10)}>
            {RenderHtml(t('group.eCommerceEventNotice'))}
        </Grid>
        {renderIsPurchased()}
        {renderIsNotPurchased()}
        {renderAbandoned()}
        {renderPageViewed()}
    </>
    )
}

export default EventsDetails;