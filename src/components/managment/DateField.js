import React from 'react';
import clsx from 'clsx';
import {CalendarIcon} from '../../assets/images/managment/index'
import {useSelector} from 'react-redux'
import {KeyboardDatePicker} from '@material-ui/pickers';
import moment from 'moment'
import 'moment/locale/he'

export const DateField=({
  classes,
  value,
  onChange=() => null,
  placeholder=''
}) => {
  const {isRTL,language}=useSelector(state => state.core)
  moment.locale(language)
  const direction={
    true: 'rtl',
    false: 'ltr'
  }

  return (
    <KeyboardDatePicker
      disableToolbar
      inputVariant="outlined"
      className={clsx(
        classes.textField,
        {[classes.textFieldPlaceholder]: !value}
      )}
      inputProps={{
        className: classes.datePickerInput,
      }}
      PopoverProps={{
        dir: direction[isRTL]
      }}
      variant='inline'
      keyboardIcon={<CalendarIcon />}
      format="L"
      margin='none'
      emptyLabel={placeholder}
      initialFocusedDate={moment()}
      value={value}
      onChange={date => onChange(date)}
      KeyboardButtonProps={{
        'aria-label': 'change date',
        className: classes.datePickerButton
      }}
    />
  )

}