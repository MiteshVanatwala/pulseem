import clsx from 'clsx';
import {
    Button,
    Grid, InputLabel
} from '@material-ui/core'
import 'moment/locale/he';
import { useTranslation } from 'react-i18next';
import { DateField } from '../../../../components/managment';
import moment from "moment";
import { DateFormats } from '../../../../helpers/Constants';

const DateDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();

    return (
        <Grid container className={classes.pt25}>
            <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                <InputLabel className={classes.fBlack}>{t('common.birthdayFrom')}:</InputLabel>
                <Grid container spacing={3} className={clsx(classes.pt25)}>
                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.BirthDateFrom}
                            onChange={(value: any) => onUpdate('BirthDateFrom', moment(value).format(DateFormats.DATE_ONLY))}
                            placeholder={t('common.FromDate')}
                            timePickerOpen={true}
                            dateActive={true}
                            onTimeChange={() => { }}
                            timeActive={false}
                            buttons={{
                                ok: t("common.confirm"),
                                cancel: t("common.cancel"),
                            } as any}
                            removePadding={true}
                            hideInvalidDateMessage={true}
                        />
                        {
                            data.dynamicData?.MyConditions[0]?.BirthDateFrom && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateFrom', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>

                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.BirthDateTo}
                            onChange={(value: any) => onUpdate('BirthDateTo', moment(value).format(DateFormats.DATE_ONLY))}
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
                            data.dynamicData?.MyConditions[0]?.BirthDateTo && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateTo', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                <InputLabel className={classes.fBlack}>{t('common.birthdayWithoutYear')}:</InputLabel>
                <Grid container spacing={3} className={clsx(classes.pt25)}>
                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.BirthDateFromWithoutYear}
                            onChange={(value: any) => onUpdate('BirthDateFromWithoutYear', moment(value).format(DateFormats.DATE_ONLY))}
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
                            data.dynamicData?.MyConditions[0]?.BirthDateFromWithoutYear && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateFromWithoutYear', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>

                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.BirthDateToWithoutYear}
                            onChange={(value: any) => onUpdate('BirthDateToWithoutYear', moment(value).format(DateFormats.DATE_ONLY))}
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
                            data.dynamicData?.MyConditions[0]?.BirthDateToWithoutYear && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateToWithoutYear', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                <InputLabel className={classes.fBlack}>{t('common.reminderFrom')}:</InputLabel>
                <Grid container spacing={3} className={clsx(classes.pt25)}>
                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.ReminderFrom}
                            onChange={(value: any) => onUpdate('ReminderFrom', moment(value).format(DateFormats.DATE_ONLY))}
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
                            data.dynamicData?.MyConditions[0]?.ReminderFrom && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('ReminderFrom', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>

                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.ReminderTo}
                            onChange={(value: any) => onUpdate('ReminderTo', moment(value).format(DateFormats.DATE_ONLY))}
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
                            data.dynamicData?.MyConditions[0]?.ReminderTo && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('ReminderTo', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                <InputLabel className={classes.fBlack}>{t('common.createFrom')}:</InputLabel>
                <Grid container spacing={3} className={clsx(classes.pt25)}>
                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.CreatedFrom}
                            onChange={(value: any) => onUpdate('CreatedFrom', moment(value).format(DateFormats.DATE_ONLY))}
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
                            data.dynamicData?.MyConditions[0]?.CreatedFrom && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('CreatedFrom', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>

                    <Grid item xs={6} sm={6} md={6}>
                        {/* @ts-ignore */}
                        <DateField
                            toolbarDisabled={false}
                            classes={classes}
                            value={data.dynamicData?.MyConditions[0]?.CreatedTo}
                            onChange={(value: any) => onUpdate('CreatedTo', moment(value).format(DateFormats.DATE_ONLY))}
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
                            data.dynamicData?.MyConditions[0]?.CreatedTo && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('CreatedTo', null)}>{t("recipient.reset")}</Button>
                        }
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default DateDetails;