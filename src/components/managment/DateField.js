import { React, useState } from 'react';
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
  maximumDate = undefined,
  timePickerOpen = false,
  rootStyle = null,
  timeActive = null,
  dateActive = null
}) => {
  const { isRTL, language } = useSelector(state => state.core)
  moment.locale(language)
  const direction = {
    true: 'rtl',
    false: 'ltr'
  }
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
      cancellabel={buttons && buttons.cancel}
      oklabel={buttons && buttons.ok}
      ampm={ampm}
      id="timePicker"
      disabled={timeActive}
      onClose={() => setIsTimePickerOpen(false)}
      open={isTimePickerOpen || timePickerOpen}
      onClick={() => setIsTimePickerOpen(true)}
      InputProps={{ readOnly: true }}
      autoOk={true}
    />
  ) :

    (<KeyboardDatePicker
      classes={{ root: rootStyle }}
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
      format={"DD/MM/YYYY"}
      margin='none'
      minDate={minDate}
      placeholder={placeholder}
      initialFocusedDate={moment()}
      value={value}
      onChange={onChange}
      KeyboardButtonProps={{
        'aria-label': 'change date',
        className: classes.datePickerButton
      }}
      cancellabel={buttons && buttons.cancel}
      oklabel={buttons && buttons.ok}
      id="datePicker"
      maxDate={maximumDate}
      disabled={dateActive}
      onClose={() => setIsDatePickerOpen(false)}
      open={isDatePickerOpen}
      onClick={() => setIsDatePickerOpen(true)}
      InputProps={{ readOnly: true }}
      autoOk={true}
    />
    )

}