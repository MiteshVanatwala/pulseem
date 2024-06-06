import clsx from 'clsx';
import { FormControl, Select } from '@material-ui/core'
import 'moment/locale/he';
import { IoIosArrowDown } from 'react-icons/io';
import { ActivtyTimeInterval } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';


interface IntervalArgs {
  classes: any | never;
  Value: string | any;
  Disabled: Boolean | any;
  OnUpdate: (event: any) => {} | void;
}

const SelectActivityInteval = (args: IntervalArgs) => {
  const { t } = useTranslation();

  const { classes, Value, Disabled, OnUpdate }: IntervalArgs = args;

  return <>
    <FormControl
      variant="standard"
      className={clsx(classes.selectInputFormControl, classes.w100)}
    >
      <Select
        native
        disabled={Disabled}
        variant='standard'
        value={Value ?? undefined}
        onChange={OnUpdate}
        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
        className={clsx(classes.w100, classes.mt10, Disabled ? classes.disabled : null)}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300
            },
          },
        }}
      >
        {/* @ts-ignore */}
        <option name={t('common.select')} value={null}>{t('common.select')}</option>
        <option value={ActivtyTimeInterval.LastWeek}>{t('common.lastWeek')}</option>
        <option value={ActivtyTimeInterval.Last2Weeks}>{t('common.last2Weeks')}</option>
        <option value={ActivtyTimeInterval.LastMonth}>{t('common.lastMonth')}</option>
        <option value={ActivtyTimeInterval.Last3Months}>{t('common.last3Months')}</option>
        <option value={ActivtyTimeInterval.Last6Months}>{t('common.last6Months')}</option>
        <option value={ActivtyTimeInterval.LastYear}>{t('common.lastYear')}</option>
        <option value={ActivtyTimeInterval.SpecificDates}>{t('common.specificDates')}</option>
        <option value={ActivtyTimeInterval.Ever}>{t('common.allTheTimes')}</option>
        <option value={ActivtyTimeInterval.DaysBack}>{t('common.daysBack')}</option>
      </Select>
    </FormControl>
  </>
}

export default SelectActivityInteval;