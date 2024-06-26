import clsx from 'clsx';
import { FormControl, Select } from '@material-ui/core'
import 'moment/locale/he';
import { IoIosArrowDown } from 'react-icons/io';
import { CondType } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';


interface IntervalArgs {
  classes: any | never;
  Value: string | any;
  Disabled: Boolean | any;
  OnUpdate: (event: any) => {} | void;
}

const SelectConditionType = (args: IntervalArgs) => {
  const { t } = useTranslation();

  const { classes, Value, Disabled, OnUpdate }: IntervalArgs = args;

  return <>
    <FormControl
      variant="standard"
      className={clsx(classes.selectInputFormControl, classes.w100)}
    >
      <Select
        native
        variant='standard'
        value={Value ?? undefined}
        onChange={OnUpdate}
        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
        className={clsx(classes.w100, classes.mt20)}
        style={{ border: 'none' }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300
            },
          },
        }}
      >
        {/* @ts-ignore */}
        <option name={t('common.select')} value={CondType.Undefined}>{t('common.select')}</option>
        <option value={CondType.Equal} disabled={Disabled}>{t('common.equal')}</option>
        <option value={CondType.Like} disabled={Disabled}>{t('common.contains')}</option>
        <option value={CondType.NotEqual} disabled={Disabled}>{t('common.notEqual')}</option>
        <option value={CondType.StartsWith} disabled={Disabled}>{t('common.startsWith')}</option>
        <option value={CondType.NoValue}>{t('common.noValue')}</option>
      </Select>
    </FormControl>
  </>
}

export default SelectConditionType;