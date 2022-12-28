import { ClassesType } from '../../../Classes.types';
import {
	Grid,
	Box,
	FormControlLabel,
	FormControl,
	RadioGroup,
	Radio,
	FormHelperText,
	Divider,
} from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseSyntheticEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import { RightPaneProps, coreProps } from '../Types/WhatsappCampaign.types';
import { FiClock } from 'react-icons/fi';
import { CalendarIcon } from '../../../../assets/images/managment/index';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

const RightPane = ({ classes }: ClassesType & RightPaneProps) => {
	const { t: translator } = useTranslation();
	const [sendType, setSendType] = useState<string>('1');
	const [sendDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
		null
	);
	const [sendTime, setsendTime] = useState<MaterialUiPickersDate | null>(null);

	const [timePickerOpen, setTimePickerOpen] = useState<boolean>(false);
	const [toggleB, settoggleB] = useState<boolean>(true);
	const [toggleA, settoggleA] = useState<boolean>(false);
	const [daysBeforeAfter, setdaysBeforeAfter] = useState<string>('');
	const [spectialDateFieldID, setDateFieldID] = useState<string>('0');
	const [model, setModel] = useState<{}>({ ID: 0 });
	const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
	const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);
	const [toastMessage, setToastMessage] = useState<string>('');

	const { windowSize, isRTL, language } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	moment.locale(language);
	const direction: any = {
		true: 'rtl',
		false: 'ltr',
	};

	const handleSendType = (event: BaseSyntheticEvent) => {
		if (event.target.value === '1') {
			setModel({ ...model, SendDate: null });
			handleFromDate(null);
		} else if (event.target.value === '3') {
			setModel({ ...model, SendDate: null });
			handleFromDate(null);
			// setTimeInterval(-1);
			// setPulseAmount(-1);
		}
		setSendType(event.target.value);
	};

	const handleDatePicker = (value: MaterialUiPickersDate | null) => {
		handleFromDate(value);
	};

	const handleTimePicker = (value: MaterialUiPickersDate | null) => {
		var date = moment(sendDate);
		var time = moment(value, 'HH:mm');

		date.set({
			hour: time.get('hour'),
			minute: time.get('minute'),
		});

		if (date < moment()) {
			date = moment();
			setToastMessage('ToastMessages.DATE_PASS');
		}

		// handleFromDate(date);
		setTimePickerOpen(false);
	};

	const handlePulseDialog = () => {};

	const handlebef = () => {
		// setafterClick(false);
		settoggleA(false);
		settoggleB(true);
	};

	const handleaf = () => {
		// setafterClick(true);
		settoggleA(true);
		settoggleB(false);
	};

	const handleSpecialDayChange = (e: BaseSyntheticEvent) => {
		const re = /^[0-9\b]+$/;
		if (
			(e.target.value === '' || re.test(e.target.value)) &&
			Number(e.target.value <= 999)
		) {
			setdaysBeforeAfter(e.target.value);
		}
	};

	const handleRadioTime = (value: MaterialUiPickersDate | null) => {
		setsendTime(value);
	};

	const handleSelectChange = (e: BaseSyntheticEvent) => {
		if (e.target.value === '0') {
			//   setDateFieldID("0");
		} else {
			//   setDateFieldID(e.target.value);
		}
	};

	const renderToast = () => {
		if (toastMessage) {
			setTimeout(() => {
				setToastMessage('');
			}, 4000);
			return 'Error';
		}
		return null;
	};

	return (
		<div>
			{renderToast()}
			<Grid item md={10} xs={12}>
				<h2
					className={classes.sectionTitle}
					style={{ marginTop: windowSize === 'xs' ? 15 : '' }}>
					{translator('notifications.whenToSend')}
				</h2>
				<FormControl component='fieldset'>
					<RadioGroup
						aria-label='gender'
						name='sendType'
						onChange={handleSendType}
						value={sendType}>
						<FormControlLabel
							value='1'
							control={
								<Radio
									color='primary'
									className={
										sendType !== '1'
											? classes.radioButtonDisabled
											: classes.radioButtonActive
									}
								/>
							}
							label={
								<span className={classes.radioText}>
									{translator('notifications.immediateSend')}
								</span>
							}
						/>
						<FormHelperText className={classes.helpText}>
							{translator('notifications.immediateDescription')}
						</FormHelperText>
						<FormControlLabel
							value='2'
							control={
								<Radio
									color='primary'
									className={
										sendType !== '2'
											? classes.radioButtonDisabled
											: classes.radioButtonActive
									}
								/>
							}
							label={
								<span className={classes.radioText}>
									{translator('notifications.futureSend')}
								</span>
							}
						/>
						<Box
							className={classes.dateBox}
							style={{
								pointerEvents: sendType === '2' ? 'auto' : 'none',
							}}>
							<KeyboardDatePicker
								inputVariant='outlined'
								className={clsx(classes.textField)}
								inputProps={{
									className: classes.datePickerInput,
								}}
								PopoverProps={{
									dir: direction['isRTL'],
								}}
								variant='inline'
								keyboardIcon={<CalendarIcon />}
								format={'DD/MM/YYYY'}
								margin='none'
								minDate={moment()}
								placeholder={translator('notifications.date')}
								initialFocusedDate={moment()}
								value={sendType === '2' ? sendDate : null}
								onChange={handleDatePicker}
								KeyboardButtonProps={{
									'aria-label': 'change date',
									className: classes.datePickerButton,
								}}
								cancelLabel={translator('common.cancel')}
								okLabel={translator('common.confirm')}
								id='datePicker'
								disabled={sendType === '2' ? false : true}
								onClose={() => setIsDatePickerOpen(false)}
								open={isDatePickerOpen}
								onClick={() => setIsDatePickerOpen(true)}
								invalidDateMessage={translator('common.invalidDate')}
								maxDateMessage={translator('common.maximalDateRequired')}
								minDateMessage={translator('common.minimalDateRequired')}
								autoOk={true}
							/>
						</Box>
						<Box
							className={classes.dateBox}
							style={{
								marginTop: 10,
								pointerEvents: sendType === '2' ? 'auto' : 'none',
							}}>
							<KeyboardTimePicker
								disableToolbar={false}
								inputVariant='outlined'
								className={clsx(classes.textField, {
									[classes.textFieldPlaceholder]: !sendDate,
								})}
								inputProps={{
									className: classes.datePickerInput,
								}}
								PopoverProps={{
									dir: direction['isRTL'],
								}}
								format={'HH:mm a'}
								margin='none'
								placeholder={translator('notifications.hour')}
								initialFocusedDate={moment().hours(0).minutes(0)}
								value={sendType === '2' ? sendDate : null}
								keyboardIcon={<FiClock style={{ fontSize: 16 }} />}
								onChange={(date) => handleTimePicker(date)}
								KeyboardButtonProps={{
									'aria-label': 'change time',
									className: classes.datePickerButton,
								}}
								cancelLabel={translator('common.cancel')}
								okLabel={translator('common.confirm')}
								ampm={false}
								id='timePicker'
								disabled={sendType === '2' ? false : true}
								onClose={() => setIsTimePickerOpen(false)}
								open={isTimePickerOpen || timePickerOpen}
								onClick={() => setIsTimePickerOpen(true)}
								// InputProps={{
								//   readOnly: true,
								//   style: { borderRadius: isRoundedOnMobile === true ? 50 : "" },
								// }}
								autoOk={false}
								// style={{ borderRadius: isRoundedOnMobile === true ? 50 : "" }}
							/>
						</Box>
						<FormControlLabel
							value='3'
							control={
								<Radio
									color='primary'
									className={
										sendType !== '3'
											? classes.radioButtonDisabled
											: classes.radioButtonActive
									}
								/>
							}
							label={
								<span className={classes.radioText}>
									{translator('mainReport.specialDate')}
								</span>
							}
						/>
						<Box
							className={classes.dateBox}
							style={{
								marginTop: 10,
								pointerEvents: sendType === '3' ? 'auto' : 'none',
							}}>
							<select
								placeholder={translator('common.select')}
								style={{
									border: '1px solid #818181',
									backgroundColor: 'white',
									padding: '10px',
									borderRadius: '4px',
									width: 300,
									outline: 'none',
									marginBottom: '10px',
								}}
								disabled={sendType === '3' ? false : true}
								onChange={(e) => {
									handleSelectChange(e);
								}}
								value={sendType === '3' ? spectialDateFieldID : '0'}>
								<option value='0'>{translator('common.select')}</option>
								<option value='1'>{translator('mainReport.birthday')}</option>
								<option value='2'>
									{translator('mainReport.creationDay')}
								</option>
							</select>
						</Box>

						<Box
							className={classes.dateBox}
							style={{
								marginTop: 10,
								display: 'flex',
								alignItems: 'center',
								width: '370px',
								pointerEvents: sendType === '3' ? 'auto' : 'none',
							}}>
							<input
								type='text'
								className={classes.inputDays}
								placeholder='0'
								disabled={sendType === '3' ? false : true}
								value={sendType === '3' ? daysBeforeAfter : ''}
								onChange={(e) => {
									handleSpecialDayChange(e);
								}}
								maxLength={3}
							/>

							<span
								style={{
									marginInlineEnd: '8px',
									marginBottom: '8px',
									fontSize: 14,
								}}>
								{translator('mainReport.days')}
							</span>

							{isRTL ? (
								<div style={{ display: 'flex' }}>
									<span
										className={
											sendType === '3'
												? toggleB
													? clsx(classes.afterActive)
													: clsx(classes.after)
												: classes.disabledAfter
										}
										onClick={() => {
											handlebef();
										}}>
										{translator('mainReport.before')}
									</span>
									<span
										className={
											sendType === '3'
												? toggleA
													? classes.beforeActive
													: classes.before
												: classes.disabledBefore
										}
										onClick={() => {
											handleaf();
										}}>
										{translator('mainReport.after')}
									</span>
								</div>
							) : (
								<div style={{ display: 'flex' }}>
									<span
										className={
											sendType === '3'
												? toggleB
													? classes.beforeActive
													: classes.before
												: classes.disabledBefore
										}
										onClick={() => {
											handlebef();
										}}>
										{translator('mainReport.before')}
									</span>
									<span
										className={
											sendType === '3'
												? toggleA
													? clsx(classes.afterActive)
													: clsx(classes.after)
												: classes.disabledAfter
										}
										onClick={() => {
											handleaf();
										}}>
										{translator('mainReport.after')}
									</span>
								</div>
							)}
						</Box>
						<Box
							className={classes.dateBox}
							style={{
								marginTop: 10,
								pointerEvents: sendType === '3' ? 'auto' : 'none',
								marginBottom: '1rem',
							}}>
							<KeyboardTimePicker
								disableToolbar={false}
								inputVariant='outlined'
								className={clsx(classes.textField, {
									[classes.textFieldPlaceholder]: !sendTime,
								})}
								inputProps={{
									className: classes.datePickerInput,
								}}
								PopoverProps={{
									dir: direction[isRTL?.toString()],
								}}
								format={'HH:mm a'}
								margin='none'
								placeholder={translator('notifications.hour')}
								initialFocusedDate={moment().hours(0).minutes(0)}
								value={sendType === '3' ? sendTime : null}
								keyboardIcon={<FiClock style={{ fontSize: 16 }} />}
								onChange={(date) => handleRadioTime(date)}
								KeyboardButtonProps={{
									'aria-label': 'change time',
									className: classes.datePickerButton,
								}}
								cancelLabel={translator('common.cancel')}
								okLabel={translator('common.confirm')}
								ampm={false}
								id='timePicker'
								disabled={sendType === '3' ? false : true}
								onClose={() => setIsTimePickerOpen(false)}
								open={isTimePickerOpen || timePickerOpen}
								onClick={() => setIsTimePickerOpen(true)}
								autoOk={false}
							/>
						</Box>
					</RadioGroup>
				</FormControl>
			</Grid>
			<Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
		</div>
	);
};

export default RightPane;
