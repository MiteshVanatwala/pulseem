import React, { BaseSyntheticEvent, useMemo, useRef, useState } from 'react';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import {
	Box,
	Grid,
	Link,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormGroup,
	Switch,
	Typography,
	TextField,
	Button,
} from '@material-ui/core';
import { Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { WhatsappCampaignProps, coreProps } from './WhatsappCampaign.types';
import { ClassesType } from '../../Classes.types';
import CampaignFields from './CampaignFields';
import clsx from 'clsx';
import WhatsappMobilePreview from '../Editor/WhatsappMobilePreview';
import {
	callToActionFieldProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	templateDataProps,
} from '../Editor/WhatsappCreator.types';
import Highlighter from 'react-highlight-words';
import DynamicModal from './DynamicModal';
import Buttons from './Buttons';

const WhatsappCampaign = ({ classes }: WhatsappCampaignProps & ClassesType) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [isDynamcFieldModal, setIsDynamcFieldModal] = useState<boolean>(false);
	const [isCampaign, setIsCampaign] = useState<boolean>(false);
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([
		'and',
		'the',
	]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		string[]
	>(['or']);
	const [linkCount, setlinkCount] = useState(0);
	const [messageCount, setMessageCount] = useState(0);

	const handleSubmit = () => {};

	const isUpdatedVaraiable = (variable: string) => {
		return updatedDynamicVariable.includes(variable?.toLowerCase())
			? true
			: false;
	};

	const highlightText = ({ children, highlightIndex }: any) => {
		console.log('children::', children);

		return (
			<strong
				className={clsx(
					classes.whatsappCampainHighlightText,
					`${isUpdatedVaraiable(children) && 'updated'}`
				)}
				onClick={() => setIsDynamcFieldModal(true)}>
				{children}
			</strong>
		);
	};

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			{/* <b>
        <div style={{ textAlign: "right", color: "#DC3D1B" }}>
          {translator("whatsappCampaign.note")}
          <br />
          <span style={{ marginRight: 300 }}>
            Check your limit <Link>here</Link>
          </span>
        </div>
      </b> */}

			<Title
				Text={translator('whatsappCampaign.header')}
				Classes={classes.WhatsappCampainP1Title}
				ContainerStyle={{}}
				Element={null}
			/>

			<DynamicModal
				classes={classes}
				isDynamcFieldModal={isDynamcFieldModal}
				onDynamcFieldModalClose={() => setIsDynamcFieldModal(false)}
			/>
			<br />
			<form onSubmit={handleSubmit}>
				<Grid container className={classes.WhatsappCampainP1}>
					<Grid className={classes.WhatsappCampainP1Left} item md={12} lg={6}>
						<Grid container>
							<Grid className={classes.WhatsappCampainFields} md={12} lg={12}>
								<CampaignFields classes={classes} />
							</Grid>
							<Grid className={classes.WhatsappCampainTextarea} md={12} lg={12}>
								<div className={classes.whatsappCampainHighlightContent}>
									<div className={classes.whatsappCampainHighlightTextWrapper}>
										<Highlighter
											searchWords={[
												...dynamicVariable,
												...updatedDynamicVariable,
											]}
											autoEscape={true}
											textToHighlight="The dog is chasing the cat. Or perhaps they're just playing?"
											highlightTag={highlightText}
										/>
									</div>
									<Box
										className={classes.whatsappActionButtonsWrapper}
										id='buttons-wrapper'>
										{templateData.templateButtons?.map(
											(button: quickReplyButtonProps | callToActionRowProps) =>
												button.fields.map(
													(
														field:
															| quickReplyButtonsFieldProps
															| callToActionFieldProps
													) =>
														field.fieldName === 'Button Text' && (
															<Box
																key={button.id}
																className={classes.whatsappActionButtonsBox}>
																<Button
																	className={classes.whatsappActionButtons}>
																	{field.value}
																</Button>
															</Box>
														)
												)
										)}
									</Box>
								</div>
								<Box className={classes.whatsappSmallInfoDiv}>
									<span className={classes.textInfoWrapper}>
										<span className={classes.textInfo}>
											{linkCount === 1
												? translator('whatsappCampaign.link')
												: translator('whatsappCampaign.links')}
										</span>
										&nbsp;{linkCount}
									</span>

									<span className={classes.textInfoWrapper}>
										<span className={classes.textInfo}>
											{messageCount === 1
												? translator('whatsappCampaign.dfield')
												: translator('whatsappCampaign.dfields')}
										</span>
										&nbsp;{messageCount}
									</span>

									<span className={classes.textInfoWrapper}>
										{/* {templateText?.length} */}
										<span className={classes.textInfo}>
											{translator('whatsappCampaign.char')}
										</span>
										&nbsp;0/1024
									</span>
								</Box>
							</Grid>
						</Grid>
					</Grid>
					<Grid className={classes.WhatsappCampainP1Right} item md={12} lg={6}>
						<Grid container>
							<Grid item xs={12} sm={12} md={12} lg={12}>
								<Box>
									<WhatsappMobilePreview
										classes={classes}
										campaignNumber='1'
										templateData={templateData}
										buttonType={buttonType}
									/>
								</Box>
							</Grid>
							<Grid item xs={12} sm={12} md={12} lg={12}>
								<Box className={classes.switchDiv}>
									<FormGroup>
										<Switch
											checked={true}
											className={clsx(
												{ [classes.rtlSwitch]: isRTL },
												classes.WhatsappCampainSwitch
											)}
										/>
									</FormGroup>

									<Box className={classes.radio}>
										<Typography style={{ fontSize: '18px' }}>
											{translator('whatsappCampaign.tsend')}
										</Typography>
										<Typography className={classes.descSwitch}>
											{translator('whatsappCampaign.tsendDesc')}
										</Typography>
									</Box>
								</Box>

								<Box className={classes.radio}>
									<RadioGroup
										aria-labelledby='demo-controlled-radio-buttons-group'
										defaultValue='female'
										name='radio-buttons-group'>
										<FormControlLabel
											value='female'
											control={
												<Radio className={classes.WhatsappCampainRadioButton} />
											}
											label={
												<Typography style={{ fontSize: 18 }}>
													Send to one contact
												</Typography>
											}
										/>
										<Stack direction='row' spacing={0.5} height={40}>
											<TextField
												required
												size='small'
												id='templateName'
												placeholder={translator(
													'whatsappCampaign.oneContactPlaceholder'
												)}
												className={
													isCampaign
														? clsx(classes.buttonField, classes.error)
														: clsx(classes.buttonField, classes.success)
												}
												//   onChange={onTemplateNameChange}
												//   value={templateName}
											/>
											<Button variant='outlined' color='primary'>
												SEND
											</Button>
										</Stack>
										<br />
										<Stack direction='row' spacing={0.5} height={40}>
											<FormControlLabel
												value='male'
												control={
													<Radio
														className={classes.WhatsappCampainRadioButton}
													/>
												}
												label={
													<Typography style={{ fontSize: 18 }}>
														Send to test groups
													</Typography>
												}
											/>
											{/* <Chip
                        label="New!"
                        size="small"
                        color="primary"
                        style={{ position: "relative", top: 10 }}
                      /> */}
											<span className={classes.iconNew}>
												{translator('mainReport.newFeature')}
											</span>
										</Stack>
									</RadioGroup>
								</Box>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid container>
					<Buttons classes={classes} />
				</Grid>
			</form>
		</DefaultScreen>
	);
};

export default WhatsappCampaign;
