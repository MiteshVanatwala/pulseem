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
  ampm = true,
  maximumDate = undefined
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
      format={"hh:mm a"}
      margin='none'
      placeholder={placeholder}
      initialFocusedDate={moment().hours(0).minutes(0)}
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
      id="timePicker"
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
      format={isRTL ? "DD/MM/yyyy" : "MM/DD/yyyy"}
      margin='none'
      minDate={moment(minDate).add(1, 'days')}
      placeholder={placeholder}
      initialFocusedDate={moment()}
      value={value}
      onChange={date => onChange(date)}
      KeyboardButtonProps={{
        'aria-label': 'change date',
        className: classes.datePickerButton
      }}
      cancelLabel={buttons && buttons.cancel}
      okLabel={buttons && buttons.ok}
      id="datePicker"
      maxDate={maximumDate}
    />
    )

}