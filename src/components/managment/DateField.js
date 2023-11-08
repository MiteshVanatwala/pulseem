import { React, useState } from 'react';
import clsx from 'clsx';
import { CalendarIcon } from '../../assets/images/managment/index'
import { useSelector } from 'react-redux'
import { KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import moment from 'moment'
import 'moment/locale/he'
import { FiClock } from 'react-icons/fi'
import { useTranslation } from 'react-i18next';

export const DateField = ({
  minDate,
  classes,
  value,
  onChange,
  onTimeChange,
  placeholder = '',
  isTimePicker = false,
  buttons,
  ampm = true,
  maximumDate,
  timePickerOpen = false,
  rootStyle = null,
  timeActive,
  dateActive,
  toolbarDisabled = true,
  isRoundedOnMobile = false,
  datePickerView,
  openTo,
  ...props
}) => {
  const { isRTL, language } = useSelector(state => state.core)
  moment.locale(language)
  const direction = {
    true: 'rtl',
    false: 'ltr'
  }
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { t } = useTranslation();

  return isTimePicker ? (
    <KeyboardTimePicker
      disableToolbar={false}
      inputVariant="outlined"
      className={clsx(
        classes.textField,
        props.removePadding ? classes.NoPaddingtextField : '',
        { [classes.textFieldPlaceholder]: !value }
      )}
      inputProps={{
        className: classes.datePickerInput,
      }}
      popoverprops={{
        dir: direction[isRTL]
      }}
      format={"HH:mm a"}
      margin='none'
      placeholder={placeholder}
      initialFocusedDate={moment().hours(0).minutes(0)}
      value={value}
      keyboardIcon={<FiClock style={{ fontSize: 16 }} />}
      onChange={date => onTimeChange(date)}
      KeyboardButtonProps={{
        'aria-label': 'change time',
        className: classes.datePickerButton,
      }}
      cancellabel={buttons && buttons?.cancel}
      oklabel={buttons && buttons?.ok}
      ampm={ampm}
      id="timePicker"
      disabled={timeActive}
      onClose={() => setIsTimePickerOpen(false)}
      open={isTimePickerOpen || timePickerOpen}
      onClick={() => setIsTimePickerOpen(true)}
      helperText={props?.errorMessage}
      InputProps={{
        readOnly: true,
        style: { borderRadius: isRoundedOnMobile === true ? 50 : null, border: props?.errorMessage ? '1px solid #f44336' : null }
      }}
      autoOk={true}
      style={{ borderRadius: isRoundedOnMobile === true ? 50 : null }}
    />
  ) :

    (<KeyboardDatePicker
      views={datePickerView}
      openTo={openTo}
      classes={{ root: rootStyle }}
      disableToolbar={toolbarDisabled}
      inputVariant="outlined"
      className={clsx(
        classes.textField,
        props.removePadding ? classes.NoPaddingtextField : '',
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
      // InputAdornmentProps={{
      //   style: {
      //     maxWidth: isRTL ? 10 : 'auto'
      //   }
      // }}
      KeyboardButtonProps={{
        'aria-label': 'change date',
        className: classes.datePickerButton
      }}
      cancellabel={buttons && buttons?.cancel}
      oklabel={buttons && buttons?.ok}
      id="datePicker"
      maxDate={maximumDate}
      disabled={dateActive}
      onClose={() => setIsDatePickerOpen(false)}
      open={isDatePickerOpen}
      onClick={() => setIsDatePickerOpen(true)}
      invalidDateMessage={props?.hideInvalidDateMessage ? '' : t("common.invalidDate")}
      maxDateMessage={props.errorMessage || t("common.maximalDateRequired")}
      minDateMessage={props.errorMessage || t("common.minimalDateRequired")}
      InputProps={{
        readOnly: true,
        style: { borderRadius: isRoundedOnMobile === true ? 50 : null }
      }}
      autoOk={true}
    />
    )

}