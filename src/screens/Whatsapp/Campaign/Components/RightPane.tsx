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
import { useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import { RightPaneProps, coreProps } from '../Types/WhatsappCampaign.types';
import { FiClock } from 'react-icons/fi';
import { CalendarIcon } from '../../../../assets/images/managment/index';
import { DateField } from '../../../../components/managment';

const RightPane = ({
	classes,
	handleDatePicker,
	sendDate,
	sendTime,
	handleRadioTime,
	sendType,
	handleSendType,
	timePickerOpen,
	handleTimePicker,
	daysBeforeAfter,
	handleSpecialDayChange,
	spectialDateFieldID,
	handleSelectChange,
	isSpecialDateBefore,
	setIsSpecialDateBefore,
	specialDatedropDown,
}: ClassesType & RightPaneProps) => {
	const { t: translator } = useTranslation();
	const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
	const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);

	const { windowSize, isRTL, language } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	moment.locale(language);
	const direction: any = {
		true: 'rtl',
		false: 'ltr',
	};

	return (
		<div>
			<Grid item md={10} xs={12}>
				<h2
					className={classes.sectionTitle}
					style={{ marginTop: windowSize === 'xs' ? 15 : '' }}>
					<>{translator('notifications.whenToSend')}</>
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
									<>{translator('notifications.immediateSend')}</>
								</span>
							}
						/>
						<FormHelperText className={classes.helpText}>
							<>{translator('notifications.immediateDescription')}</>
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
									<>{translator('notifications.futureSend')}</>
								</span>
							}
						/>
						<Box
							className={classes.dateBox}
							style={{
								pointerEvents: sendType === '2' ? 'auto' : 'none',
							}}>
							<DateField
								minDate={moment()}
								classes={classes}
								value={sendType === '2' ? sendDate : null}
								onChange={handleDatePicker}
								placeholder={translator('notifications.date')}
								timePickerOpen={true}
								dateActive={sendType === '2' ? false : true}
								onTimeChange={undefined}
								timeActive={undefined}
								buttons={undefined}
							/>
						</Box>
						<Box
							className={classes.dateBox}
							style={{
								marginTop: 10,
								pointerEvents: sendType === '2' ? 'auto' : 'none',
							}}>
							<DateField
								minDate={moment()}
								classes={classes}
								value={sendType === '2' ? sendDate : null}
								onTimeChange={handleTimePicker}
								placeholder={translator('notifications.hour')}
								isTimePicker={true}
								ampm={false}
								timeActive={sendType === '2' ? false : true}
								timePickerOpen={timePickerOpen}
								onChange={undefined}
								dateActive={undefined}
								buttons={undefined}
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
									<>{translator('mainReport.specialDate')}</>
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
								{specialDatedropDown?.map(
									(specialDate: string, index: number) => (
										<option
											key={'specialDate' + specialDate + index}
											value={index + 3}>
											{specialDate}
										</option>
									)
								)}
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
								<>{translator('mainReport.days')}</>
							</span>

							{isRTL ? (
								<div style={{ display: 'flex' }}>
									<span
										className={
											sendType === '3'
												? isSpecialDateBefore
													? clsx(classes.afterActive)
													: clsx(classes.after)
												: classes.disabledAfter
										}
										onClick={() => setIsSpecialDateBefore(true)}>
										<>{translator('mainReport.before')}</>
									</span>
									<span
										className={
											sendType === '3'
												? !isSpecialDateBefore
													? classes.beforeActive
													: classes.before
												: classes.disabledBefore
										}
										onClick={() => setIsSpecialDateBefore(false)}>
										<>{translator('mainReport.after')}</>
									</span>
								</div>
							) : (
								<div style={{ display: 'flex' }}>
									<span
										className={
											sendType === '3'
												? isSpecialDateBefore
													? classes.beforeActive
													: classes.before
												: classes.disabledBefore
										}
										onClick={() => setIsSpecialDateBefore(true)}>
										<>{translator('mainReport.before')}</>
									</span>
									<span
										className={
											sendType === '3'
												? !isSpecialDateBefore
													? clsx(classes.afterActive)
													: clsx(classes.after)
												: classes.disabledAfter
										}
										onClick={() => setIsSpecialDateBefore(false)}>
										<>{translator('mainReport.after')}</>
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
							<DateField
								classes={classes}
								value={sendType === '3' ? sendTime : null}
								onTimeChange={handleRadioTime}
								placeholder={translator('notifications.hour')}
								isTimePicker={true}
								buttons={{
									ok: translator('common.confirm'),
									cancel: translator('common.cancel'),
								}}
								ampm={false}
								timePickerOpen={timePickerOpen}
								timeActive={sendType === '3' ? false : true}
								disabled={sendType === '3' ? false : true}
								autoOk
								minDate={undefined}
								onChange={undefined}
								dateActive={undefined}
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
