import clsx from 'clsx';
import { FormControl, MenuItem, Select } from '@material-ui/core'
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
        disabled={Disabled}
        variant='standard'
        value={Value}
        onChange={OnUpdate}
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
        <MenuItem value={ActivtyTimeInterval.Ever}>{t('common.allTheTimes')}</MenuItem>
      </Select>
    </FormControl>
  </>
}

export default SelectActivityInteval;