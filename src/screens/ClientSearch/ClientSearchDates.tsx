import clsx from 'clsx';
import {
  Button,
  Grid, InputLabel
} from '@material-ui/core'
import 'moment/locale/he';
import { useTranslation } from 'react-i18next';
import { DateField } from '../../components/managment';
import moment from "moment";
import { DateFormats } from '../../helpers/Constants';
import { useDispatch, useSelector } from 'react-redux';
import { getAccountExtraData } from '../../redux/reducers/smsSlice';
import { useEffect } from 'react';

export const ClientSearchDates = ({ classes, data, onUpdate }: any) => {
  const { t } = useTranslation();
  const { extraData } = useSelector((state: any) => state.sms);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!extraData || extraData.length === 0) {
      dispatch(getAccountExtraData());
    }

    console.log(data?.MyConditions[0][`${extraData.ExtraDate1}From`]);
  }, [])

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
              value={moment(data?.MyConditions[0]?.BirthDateFrom).diff('0001-01-01') > 0 ? data?.MyConditions[0]?.BirthDateFrom : null}
              onChange={(value: any) => onUpdate('BirthDateFrom', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.FromDate')}
              timePickerOpen={true}
              dateActive={true}
              minDate={undefined}
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
              data?.MyConditions[0]?.BirthDateFrom && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateFrom', null)}>{t("recipient.reset")}</Button>
            }
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={moment(data?.MyConditions[0]?.BirthDateTo).diff('0001-01-01') > 0 ? data?.MyConditions[0]?.BirthDateTo : null}
              onChange={(value: any) => onUpdate('BirthDateTo', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.ToDate')}
              timePickerOpen={false}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={data?.MyConditions[0]?.BirthDateFrom || undefined}
            />
            {
              data?.MyConditions[0]?.BirthDateTo && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateTo', null)}>{t("recipient.reset")}</Button>
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
              value={moment(data?.MyConditions[0]?.BirthDateFromWithoutYear).diff('0001-01-01') > 0 ? data?.MyConditions[0]?.BirthDateFromWithoutYear : null}
              onChange={(value: any) => onUpdate('BirthDateFromWithoutYear', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.FromDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
              datePickerView={["date", "month"]}
              format={"DD/MM"}
            />
            {
              data?.MyConditions[0]?.BirthDateFromWithoutYear && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateFromWithoutYear', null)}>{t("recipient.reset")}</Button>
            }
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={moment(data?.MyConditions[0]?.BirthDateToWithoutYear).diff('0001-01-01') > 0 ? data?.MyConditions[0]?.BirthDateToWithoutYear : null}
              onChange={(value: any) => onUpdate('BirthDateToWithoutYear', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.ToDate')}
              timePickerOpen={false}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
              datePickerView={["date", "month"]}
              format={"DD/MM"}
            />
            {
              data?.MyConditions[0]?.BirthDateToWithoutYear && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('BirthDateToWithoutYear', null)}>{t("recipient.reset")}</Button>
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
              value={moment(data?.MyConditions[0]?.ReminderFrom).diff('0001-01-01') > 0 ? data?.MyConditions[0]?.ReminderFrom : null}
              onChange={(value: any) => onUpdate('ReminderFrom', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.FromDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0]?.ReminderFrom && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('ReminderFrom', null)}>{t("recipient.reset")}</Button>
            }
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={moment(data?.MyConditions[0]?.ReminderTo).diff('0001-01-01') > 0 ? data?.MyConditions[0]?.ReminderTo : null}
              onChange={(value: any) => onUpdate('ReminderTo', moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.ToDate')}
              timePickerOpen={false}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={data?.MyConditions[0]?.ReminderFrom || undefined}
            />
            {
              data?.MyConditions[0]?.ReminderTo && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate('ReminderTo', null)}>{t("recipient.reset")}</Button>
            }
          </Grid>
        </Grid>
      </Grid>
      {extraData.ExtraDate1 && <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
        <InputLabel className={classes.fBlack}>{extraData.ExtraDate1}:</InputLabel>
        <Grid container spacing={3} className={clsx(classes.pt25)}>
          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate1}From`] && moment(data?.MyConditions[0][`${extraData.ExtraDate1}From`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate1}From`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate1}From`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.FromDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate1}From`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate1}From`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate1}To`] && moment(data?.MyConditions[0][`${extraData.ExtraDate1}To`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate1}To`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate1}To`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.ToDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate1}To`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate1}To`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>
        </Grid>
      </Grid>}
      {extraData.ExtraDate2 && <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
        <InputLabel className={classes.fBlack}>{extraData.ExtraDate2}:</InputLabel>
        <Grid container spacing={3} className={clsx(classes.pt25)}>
          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate2}From`] && moment(data?.MyConditions[0][`${extraData.ExtraDate2}From`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate2}From`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate2}From`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.FromDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate2}From`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate2}From`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate2}To`] && moment(data?.MyConditions[0][`${extraData.ExtraDate2}To`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate2}To`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate2}To`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.ToDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate2}To`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate2}To`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>
        </Grid>
      </Grid>}
      {extraData.ExtraDate3 && <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
        <InputLabel className={classes.fBlack}>{extraData.ExtraDate3}:</InputLabel>
        <Grid container spacing={3} className={clsx(classes.pt25)}>
          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate3}From`] && moment(data?.MyConditions[0][`${extraData.ExtraDate3}From`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate3}From`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate3}From`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.FromDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate3}From`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate3}From`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate3}To`] && moment(data?.MyConditions[0][`${extraData.ExtraDate3}To`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate3}To`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate3}To`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.ToDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate3}To`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate3}To`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>
        </Grid>
      </Grid>}
      {extraData.ExtraDate4 && <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
        <InputLabel className={classes.fBlack}>{extraData.ExtraDate4}:</InputLabel>
        <Grid container spacing={3} className={clsx(classes.pt25)}>
          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate4}From`] && moment(data?.MyConditions[0][`${extraData.ExtraDate4}From`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate4}From`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate4}From`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.FromDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate4}From`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate4}From`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            {/* @ts-ignore */}
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={data?.MyConditions[0][`${extraData.ExtraDate4}To`] && moment(data?.MyConditions[0][`${extraData.ExtraDate4}To`]).diff('0001-01-01') > 0 ? data?.MyConditions[0][`${extraData.ExtraDate4}To`] : null}
              onChange={(value: any) => onUpdate(`${extraData.ExtraDate4}To`, moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT))}
              placeholder={t('common.ToDate')}
              timePickerOpen={true}
              dateActive={true}
              onTimeChange={() => { }}
              timeActive={false}
              buttons={[]}
              removePadding={true}
              hideInvalidDateMessage={true}
              minDate={undefined}
            />
            {
              data?.MyConditions[0][`${extraData.ExtraDate4}To`] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(data?.MyConditions[0][`${extraData.ExtraDate4}To`], null)}>{t("recipient.reset")}</Button>
            }
          </Grid>
        </Grid>
      </Grid>}
    </Grid>
  )
}

export default ClientSearchDates;