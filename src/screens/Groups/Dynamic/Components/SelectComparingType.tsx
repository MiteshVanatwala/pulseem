import clsx from 'clsx';
import { FormControl, Select } from '@material-ui/core'
import 'moment/locale/he';
import { IoIosArrowDown } from 'react-icons/io';
import { ActivityEvent } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';


interface IntervalArgs {
  classes: any | never;
  Value: string | any;
  Disabled: Boolean | any;
  OnUpdate: (event: any) => {} | void;
}

const SelectComparingType = (args: IntervalArgs) => {
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
        style={{ border: 'none' }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300
            },
          },
        }}
      >
        <option value={ActivityEvent.Any}>{t('common.any')}</option>
        <option value={ActivityEvent.MoreThan}>{t('common.moreThan')}</option>
        <option value={ActivityEvent.LessThan}>{t('common.lessThan')}</option>
        <option value={ActivityEvent.Range}>{t('common.range')}</option>
      </Select>
    </FormControl>
  </>
}

export default SelectComparingType;