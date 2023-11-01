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
	MenuItem,
} from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { RightPaneProps, coreProps } from '../Types/WhatsappCampaign.types';
import { DateField } from '../../../../components/managment';
import { IoIosArrowDown } from 'react-icons/io';

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

	const { windowSize, isRTL, language } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	moment.locale(language);

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
							className={clsx(classes.dateBox, classes.pbt15)}
							style={{
								pointerEvents: sendType === '2' ? 'auto' : 'none',
							}}>
							<DateField
								minDate={moment()}
								maximumDate={moment().add(100, 'y')}
								classes={classes}
								value={sendType === '2' ? sendDate : null}
								onChange={handleDatePicker}
								placeholder={translator('notifications.date')}
								timePickerOpen={true}
								dateActive={sendType === '2' ? false : true}
								onTimeChange={() => {}}
								timeActive={false}
								buttons={[]}
							/>
						</Box>
						<Box
							className={clsx(classes.dateBox, classes.pbt15)}
							style={{
								marginTop: 10,
								pointerEvents: sendType === '2' ? 'auto' : 'none',
							}}>
							<DateField
								minDate={moment()}
								maximumDate={null}
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
							}}
						>
							<FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100, classes.mb10)}>
								<Select
									placeholder={translator('common.select')}
									variant="standard"
									displayEmpty
									disabled={sendType === '3' ? false : true}
									value={sendType === '3' ? spectialDateFieldID : '0'}
									onChange={(event: SelectChangeEvent) => handleSelectChange(event)}
									IconComponent={() => {
										return <IoIosArrowDown size={20}
											style={{
												position: 'absolute',
												pointerEvents: 'none'
											}} />
									}}
									className={classes.pbt5}
									MenuProps={{
										PaperProps: {
											style: {
												maxHeight: 300,
												direction: isRTL ? 'rtl' : 'ltr'
											},
										},
									}}
								>
									<MenuItem value='0'>{translator('common.select')}</MenuItem>
									<MenuItem value='1'>{translator('mainReport.birthday')}</MenuItem>
									<MenuItem value='2'>{translator('mainReport.creationDay')}</MenuItem>
									{specialDatedropDown &&
										Object.keys(specialDatedropDown).map((item, i) => {
											if (specialDatedropDown[item]) {
												return (
													item.toLowerCase().indexOf('extradate') > -1 && (
														<MenuItem value={i + 3} key={`extrakey_${i}`}>
															{Object.values(specialDatedropDown[item])}
														</MenuItem>
													)
												);
											}
										})
									}
								</Select>
							</FormControl>
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
								className={clsx(classes.ml5, classes.f14, classes.mb2)}
							>
								{translator('mainReport.days')}
							</span>

							{isRTL ? (
								<div style={{ display: 'flex' }}>
									<span
										className={
											sendType === '3'
												? isSpecialDateBefore
													? clsx(classes.whatsappSpecialDateAfterActive)
													: clsx(classes.whatsappSpecialDateAfter)
												: classes.disabledAfter
										}
										onClick={() => setIsSpecialDateBefore(true)}>
										<>{translator('mainReport.before')}</>
									</span>
									<span
										className={
											sendType === '3'
												? !isSpecialDateBefore
													? classes.whatsappSpecialDateBeforeActive
													: classes.whatsappSpecialDateBefore
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
							className={clsx(classes.dateBox, classes.pbt15)}
							style={{
								marginTop: 10,
								pointerEvents: sendType === '3' ? 'auto' : 'none',
								marginBottom: '1rem',
							}}>
							<DateField
								classes={classes}
								maximumDate={null}
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
