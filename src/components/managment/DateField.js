import React from 'react';
import clsx from 'clsx';
import { CalendarIcon } from '../../assets/images/managment/index'
import { useSelector } from 'react-redux'
import { KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import moment from 'moment'
import 'moment/locale/he'
import { FiClock } from 'react-icons/fi'

export const DateField = ({
  minDate,
  classes,
  value,
  onChange = () => null,
  onTimeChange = () => null,
  placeholder = '',
  isTimePicker = false,
  buttons = null,
  ampm = true
}) => {
  const { isRTL, language } = useSelector(state => state.core)
  moment.locale(language)
  const direction = {
    true: 'rtl',
    false: 'ltr'
  }

  return isTimePicker ? (
    <KeyboardTimePicker
      disableToolbar={false}
      inputVariant="outlined"
      className={clsx(
        classes.textField,
        { [classes.textFieldPlaceholder]: !value }
      )}
      inputProps={{
        className: classes.datePickerInput,
      }}
      popoverprops={{
        dir: direction[isRTL]
      }}
      variant={buttons ? 'dialog' : 'inline'}
      margin='none'
      emptyLabel={placeholder}
      initialFocusedDate={moment()}
      value={value}
      keyboardIcon={<FiClock style={{ fontSize: 16 }} />}
      onChange={date => onTimeChange(date)}
      KeyboardButtonProps={{
        'aria-label': 'change time',
        className: classes.datePickerButton
      }}
      cancelLabel={buttons && buttons.cancel}
      okLabel={buttons && buttons.ok}
      ampm={ampm}
    />
  ) :

    (<KeyboardDatePicker
      disableToolbar
      inputVariant="outlined"
      className={clsx(
        classes.textField,
        { [classes.textFieldPlaceholder]: !value }
      )}
      inputProps={{
        className: classes.datePickerInput,
      }}
      popoverprops={{
        dir: direction[isRTL]
      }}
      variant={buttons ? 'dialog' : 'inline'}
      keyboardIcon={<CalendarIcon />}
      format="L"
      margin='none'
      minDate={minDate}
      emptyLabel={placeholder}
      initialFocusedDate={moment()}
      value={value}
      disablePast={true}
      onChange={date => onChange(date)}
      KeyboardButtonProps={{
        'aria-label': 'change date',
        className: classes.datePickerButton
      }}
      cancelLabel={buttons && buttons.cancel}
      okLabel={buttons && buttons.ok}
    />
    )

}