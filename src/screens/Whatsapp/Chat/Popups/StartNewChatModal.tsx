import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { coreProps } from '../../Campaign/Types/WhatsappCampaign.types';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { BsX } from 'react-icons/bs';
import {
	sendWhatsAppMessage,
	getSavedTemplates,
} from '../../../../redux/reducers/whatsappSlice';
import { getDynamicFields, formatUpdatedDynamicVariable, getTemplateName } from '../../Common';
import { apiStatus, fieldIDs, fieldNames, whatsappRoutes } from '../../Constant';
import { PhoneNumberRegEx } from '../../../../helpers/Constants';
import {
	APISendWhatsappChat,
	APISendWhatsAppChatReqPayload,
	StartNewChatModalProps,
	StartNewChatStep,
} from '../Types/WhatsappChat.type';
import { savedTemplateListProps } from '../../Editor/Types/WhatsappCreator.types';
import { updatedVariable } from '../../Campaign/Types/WhatsappCampaign.types';
import { templateTypes } from '../../Constant';
import DynamicModalFields from '../../Campaign/Popups/DynamicModalFields';
import { StateType } from '../../../../Models/StateTypes';

// ── Local types ───────────────────────────────────────────────────────────────

interface QuickResponseProps {
	ID: number;
	Text: string;
	CreatedAt?: number;
}

// ── Tab styles (mirrors ChatTemplateModal) ────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

const getTemplateBodyText = (template: savedTemplateListProps): string => {
	if (!template?.Data?.types) return '';
	const types = template.Data.types;
	if (templateTypes.QUICK_REPLY in types)
		return (types as any)[templateTypes.QUICK_REPLY]?.body ?? '';
	if (templateTypes.CALL_TO_ACTION in types)
		return (types as any)[templateTypes.CALL_TO_ACTION]?.body ?? '';
	if (templateTypes.MEDIA in types)
		return (types as any)[templateTypes.MEDIA]?.body ?? '';
	if (templateTypes.CARD in types)
		return (types as any)[templateTypes.CARD]?.title ?? '';
	if (templateTypes.TEXT in types)
		return (types as any)[templateTypes.TEXT]?.body ?? '';
	return '';
};

const STEP_COUNT = 4;
const stepIndex = (step: StartNewChatStep): number => {
	const map: Record<StartNewChatStep, number> = {
		phone: 0,
		template: 1,
		variables: 2,
		review: 3,
	};
	return map[step];
};

// Extract numeric index from {{1}}, {{2}}, etc.
const getVarIndex = (v: string): number =>
	parseInt(v.replace(/[{}]/g, ''), 10);

const dynamicButtons = [
	{ tooltipTitle: 'whatsappCampaign.pField', buttonTitle: 'whatsappCampaign.pField' },
	{ tooltipTitle: 'whatsappCampaign.text', buttonTitle: 'whatsappCampaign.text' },
	{ tooltipTitle: 'whatsappCampaign.link', buttonTitle: 'whatsappCampaign.link' },
	{ tooltipTitle: 'whatsappCampaign.lPage', buttonTitle: 'whatsappCampaign.lPage' },
	{ tooltipTitle: 'whatsappCampaign.navigation', buttonTitle: 'whatsappCampaign.navigation' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const StartNewChatModal = ({
	classes,
	open,
	onClose,
	savedTemplateList,
	activePhoneNumber,
	onSendSuccess,
	personalFields,
	landingPageData,
}: StartNewChatModalProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

	// ── Template list (refreshed each time modal opens) ──────────────────────
	const [localTemplateList, setLocalTemplateList] = useState<savedTemplateListProps[]>(
		savedTemplateList ?? []
	);
	const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

	useEffect(() => {
		if (open) {
			setIsLoadingTemplates(true);
			dispatch<any>(getSavedTemplates({ templateStatus: 3 })).then((templateResult: any) => {
				const items: savedTemplateListProps[] =
					templateResult?.payload?.Data?.Items;
				setLocalTemplateList(items ?? savedTemplateList ?? []);
				setIsLoadingTemplates(false);
			});
		}
	}, [open]);

	// ── Wizard step ───────────────────────────────────────────────────────────
	const [step, setStep] = useState<StartNewChatStep>('phone');

	// ── Step 1: phone ─────────────────────────────────────────────────────────
	const [toNumber, setToNumber] = useState('');
	const [phoneError, setPhoneError] = useState('');

	// ── Step 2: template / QR selection ──────────────────────────────────────
	const [selectedTemplate, setSelectedTemplate] =
		useState<savedTemplateListProps | null>(null);
	const [templateSearch, setTemplateSearch] = useState('');
	const [dynamicVariables, setDynamicVariables] = useState<string[]>([]);

	// ── Step 3: variables (inline clickable placeholder approach) ────────────
	// activeVarKey — which {{N}} chip is currently open for editing (null = none)
	const [activeVarKey, setActiveVarKey] = useState<string | null>(null);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariable[]
	>([]);
	const [activeDynamicButton, setActiveDynamicButton] = useState(
		'whatsappCampaign.pField'
	);
	const [isTrackLink, setIsTrackLink] = useState(false);
	const [navApp, setNavApp] = useState('Google Maps');
	const [dynamicProductType, setDynamicProductType] = useState('');
	const [dynamicProductFallbackURL, setDynamicProductFallbackURL] = useState('');

	// ── Step 4: send ──────────────────────────────────────────────────────────
	const [isSending, setIsSending] = useState(false);

	// ── Helpers ───────────────────────────────────────────────────────────────

	const handleModalClose = () => {
		setStep('phone');
		setToNumber('');
		setPhoneError('');
		setSelectedTemplate(null);
		setTemplateSearch('');
		setDynamicVariables([]);
		setActiveVarKey(null);
		setUpdatedDynamicVariable([]);
		setActiveDynamicButton('whatsappCampaign.pField');
		setIsTrackLink(false);
		setNavApp('Google Maps');
		setDynamicProductType('');
		setDynamicProductFallbackURL('');
		setIsSending(false);
		onClose();
	};

	// Phone validation — uses app-wide PhoneNumberRegEx (/^\+?[0-9]*$/)
	const validatePhone = (value: string): string => {
		if (!value || value.trim() === '') {
			return translator('whatsappChat.phoneRequired');
		}
		if (value.length < 7) {
			return translator('whatsappChat.phoneTooShort');
		}
		if (value.length > 15) {
			return translator('whatsappChat.phoneTooLong');
		}
		if (!PhoneNumberRegEx.test(value)) {
			return translator('whatsappChat.invalidPhoneNumber');
		}
		return '';
	};

	// Mirror SMS "Send to one contact" — only allow digits on change
	const handleNumberChange = (value: string) => {
		if (value === '' || /^[0-9\b]+$/.test(value)) {
			setToNumber(value);
			if (phoneError) setPhoneError('');
		}
	};

	const handlePhoneBlur = () => {
		if (toNumber) {
			setPhoneError(validatePhone(toNumber));
		}
	};

	const handlePhoneNext = () => {
		const error = validatePhone(toNumber);
		if (error) {
			setPhoneError(error);
			return;
		}
		setPhoneError('');
		setStep('template');
	};

	// Template selected — check for variables, advance accordingly
	const handleTemplateSelect = (template: savedTemplateListProps) => {
		setSelectedTemplate(template);
		const bodyText = getTemplateBodyText(template);
		const vars = Array.from(new Set(getDynamicFields(bodyText)));
		setDynamicVariables(vars);
		setActiveVarKey(null);
		setUpdatedDynamicVariable([]);
		setActiveDynamicButton('whatsappCampaign.pField');
		setStep(vars.length > 0 ? 'variables' : 'review');
	};

	// Clicking a {{N}} chip — open/close its editor panel
	const typeMap: Record<number, string> = {
		1: 'whatsappCampaign.pField',
		2: 'whatsappCampaign.text',
		3: 'whatsappCampaign.link',
		4: 'whatsappCampaign.lPage',
		5: 'whatsappCampaign.navigation',
	};
	const handleVarChipClick = (varKey: string) => {
		// Toggle off if already active
		if (activeVarKey === varKey) {
			setActiveVarKey(null);
			return;
		}
		setActiveVarKey(varKey);
		// Restore editor state from any previously saved value for this var
		const varIndex = getVarIndex(varKey);
		const existing = updatedDynamicVariable.find((u) => u.VariableIndex === varIndex);
		if (existing) {
			setActiveDynamicButton(typeMap[existing.FieldTypeId] ?? 'whatsappCampaign.pField');
			if (existing.FieldTypeId === 3) {
				setIsTrackLink(existing.IsStatastic ?? false);
				setDynamicProductFallbackURL(existing.FallbackUrl ?? '');
			} else {
				setIsTrackLink(false);
				setDynamicProductFallbackURL('');
			}
		} else {
			setActiveDynamicButton('whatsappCampaign.pField');
			setIsTrackLink(false);
			setDynamicProductType('');
			setDynamicProductFallbackURL('');
		}
	};

	// Mirrors DynamicModal.updateDynamicVariables — scoped to varIndex
	const updateDynamicVariables = (
		field: string,
		value: string,
		varIndex: number,
		isTrack: boolean = false,
		fallbackUrl: string = ''
	) => {
		if (field === 'link' || field === 'landingPage') setIsTrackLink(isTrack);

		const getFieldTypeId = (f: string): number => {
			switch (f) {
				case fieldNames.PERSONALFIELD:
					return fieldIDs['personalField'];
				case fieldNames.TEXT:
					return fieldIDs['text'];
				case fieldNames.LINK:
					return fieldIDs['link'];
				case fieldNames.LANDINGPAGE:
					return fieldIDs['landingPage'];
				case fieldNames.NAVIGATION:
					return fieldIDs['navigation'];
				default:
					return 2;
			}
		};

		setUpdatedDynamicVariable((prev) => {
			const exists = prev.find((u) => u.VariableIndex === varIndex);
			const entry: updatedVariable = {
				FieldTypeId: getFieldTypeId(field),
				VariableIndex: varIndex,
				VariableValue: value,
				IsStatastic:
					field === 'link' || field === 'landingPage' ? isTrack : false,
				FallbackUrl: fallbackUrl,
			};
			if (exists) {
				return prev.map((u) => (u.VariableIndex === varIndex ? entry : u));
			}
			return [...prev, entry];
		});
	};

	// Get a field value for the current variable — mirrors DynamicModal.getFieldValueByID
	const getFieldValueByID = (fieldID: number, varIndex: number): string => {
		return (
			updatedDynamicVariable.find(
				(u) => u.VariableIndex === varIndex && u.FieldTypeId === fieldID
			)?.VariableValue ?? ''
		);
	};

	const handleVarsNext = () => {
		setActiveVarKey(null);
		setStep('review');
	};

	const buildInterpolatedText = (): string => {
		let text = getTemplateBodyText(selectedTemplate!);
		dynamicVariables.forEach((v) => {
			const varIndex = getVarIndex(v);
			const entry = updatedDynamicVariable.find(
				(u) => u.VariableIndex === varIndex
			);
			text = text.split(v).join(entry?.VariableValue || v);
		});
		return text;
	};

	const handleSend = async () => {
		setIsSending(true);

		if (!selectedTemplate) {
			setIsSending(false);
			return;
		}

		const payload: APISendWhatsAppChatReqPayload = {
			FromNumber: activePhoneNumber,
			ToNumber: toNumber,
			IsFreeFormChat: false,
			TemplateId: selectedTemplate.TemplateId,
			Variables: formatUpdatedDynamicVariable(updatedDynamicVariable),
		};

		const result: APISendWhatsappChat = await dispatch<any>(
			sendWhatsAppMessage(payload)
		);
		setIsSending(false);
		if (result?.payload?.Status === apiStatus.SUCCESS) {
			onSendSuccess(toNumber);
			handleModalClose();
		}
	};

	const handleNewTemplate = () => {
		handleModalClose();
		navigate(whatsappRoutes.CREATE_TEMPLATE);
	};

	const filteredTemplates = (localTemplateList ?? []).filter(
		(t) =>
			t != null &&
			getTemplateName(t)
				.toLowerCase()
				.includes(templateSearch.toLowerCase())
	);

	// ── Renderers ─────────────────────────────────────────────────────────────

	const renderStepIndicator = () => (
		<Box
			className={classes.startNewChatStepIndicator}
			style={{
				direction: isRTL ? 'rtl' : 'ltr',
				justifyContent: 'flex-start',
			}}>
			{Array.from({ length: STEP_COUNT }).map((_, i) => (
				<Box
					key={i}
					className={`${classes.startNewChatStepDot}${
						i <= stepIndex(step)
							? ` ${classes.startNewChatStepDotActive}`
							: ''
					}`}
				/>
			))}
		</Box>
	);

	const renderPhoneStep = () => (
		<Box style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
			<Typography
				variant="body2"
				style={{ marginBottom: '12px', fontWeight: 600, textAlign: isRTL ? 'right' : 'left' }}>
				{translator('whatsappChat.enterPhoneNumber')}
			</Typography>
			<TextField
				className={classes.startNewChatSearchField}
				variant="outlined"
				size="small"
				fullWidth
				placeholder={translator('whatsappChat.phoneNumberPlaceholder')}
				value={toNumber}
				onChange={(e) => handleNumberChange(e.target.value)}
				onBlur={handlePhoneBlur}
				error={!!phoneError}
				helperText={phoneError}
				inputProps={{ inputMode: 'numeric', maxLength: 15, style: { textAlign: isRTL ? 'right' : 'left' } }}
			/>
		</Box>
	);

	// ── Approved Templates tab ────────────────────────────────────────────────
	const renderTemplatesTab = () => (
		<Box style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
			<Box
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '8px',
					flexDirection: isRTL ? 'row-reverse' : 'row',
				}}>
				<TextField
					className={classes.startNewChatSearchField}
					variant="outlined"
					size="small"
					fullWidth
					placeholder={translator('whatsappChat.searchTemplates')}
					value={templateSearch}
					onChange={(e) => setTemplateSearch(e.target.value)}
					style={{ marginRight: isRTL ? '0' : '8px', marginLeft: isRTL ? '8px' : '0' }}
					inputProps={{ style: { textAlign: isRTL ? 'right' : 'left' } }}
				/>
				<Button
					className={classes.startNewChatNewTemplateButton}
					onClick={handleNewTemplate}
					size="small"
					style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
					{translator('whatsappChat.newTemplate')}
				</Button>
			</Box>

			{isLoadingTemplates ? (
				<Box style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
					<CircularProgress size={24} />
				</Box>
			) : filteredTemplates.length === 0 ? (
				<Typography
					variant="body2"
					style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
					{translator('whatsappChat.noTemplatesFound')}
				</Typography>
			) : (
				<ul
					className={classes.startNewChatTemplateList}
					style={{ maxHeight: '240px', overflowY: 'auto' }}>
					{filteredTemplates.map((template) => {
						const bodyText = getTemplateBodyText(template);
						return (
							<li
								key={template.TemplateId}
								style={{
									display: 'flex',
									alignItems: 'center',
									padding: '10px 12px',
									borderBottom: '1px solid #f0f0f0',
									gap: '8px',
									flexDirection: isRTL ? 'row-reverse' : 'row',
								}}>
								<Box style={{ flex: 1, minWidth: 0, textAlign: isRTL ? 'right' : 'left' }}>
									<Typography variant="body2" style={{ fontWeight: 600 }}>
										{getTemplateName(template)}
									</Typography>
									{bodyText && (
										<Typography
											variant="caption"
											style={{ color: '#888', display: 'block', marginTop: '2px' }}>
											{bodyText.substring(0, 80)}
											{bodyText.length > 80 ? '...' : ''}
										</Typography>
									)}
								</Box>
								<Button
									variant="contained"
									color="primary"
									size="small"
									className={clsx(classes.btn, classes.btnRounded)}
									onClick={() => handleTemplateSelect(template)}>
									{translator('whatsappChat.select')}
								</Button>
							</li>
						);
					})}
				</ul>
			)}
		</Box>
	);

	// ── Template step — templates only (Quick Responses require a 24h inbound
	//    window and cannot be used to initiate a new conversation)
	const renderTemplateStep = () => renderTemplatesTab();

	// ── Variable editor panel — shown below the message when a chip is clicked ─
	const renderVarEditor = (varKey: string) => {
		const varIndex = getVarIndex(varKey);
		return (
			<Box
				style={{
					borderTop: '1px solid #f0f0f0',
					paddingTop: '12px',
					marginTop: '4px',
					direction: isRTL ? 'rtl' : 'ltr',
				}}>
				<Typography
					variant="caption"
					style={{ color: '#888', display: 'block', marginBottom: '8px', textAlign: isRTL ? 'right' : 'left' }}>
					{`${translator('whatsappChat.editing')} ${varKey}`}
				</Typography>

				{/* Type-selector pill buttons — identical to DynamicModal */}
				<Box className={classes.whatsappCampaignDynamicFieldContentText}>
					<Stack direction="row" spacing={0} className={classes.dBlock}>
						{dynamicButtons.map((button, index) => (
							<Button
								key={index}
								variant="outlined"
								color="primary"
								size="small"
								style={{
									margin: '0px 6px 6px 0px',
									padding: '3px 9px',
									borderRadius: '20px',
								}}
								className={
									button.buttonTitle === activeDynamicButton
										? classes.whatsappCampaignDynamicFieldButtonActive
										: classes.whatsappCampaignDynamicFieldButton
								}
								onClick={() => {
									setActiveDynamicButton(button.buttonTitle);
									setDynamicProductType('');
									setDynamicProductFallbackURL('');
									updateDynamicVariables('link', '', varIndex);
								}}>
								{translator(button.buttonTitle)}
							</Button>
						))}
					</Stack>
				</Box>

				{/* Field input */}
				<DynamicModalFields
					classes={classes}
					activeDynamicButton={activeDynamicButton}
					personalField={getFieldValueByID(fieldIDs['personalField'], varIndex)}
					textInput={getFieldValueByID(fieldIDs['text'], varIndex)}
					linkInput={getFieldValueByID(fieldIDs['link'], varIndex)}
					navApp={navApp}
					landPage={getFieldValueByID(fieldIDs['landingPage'], varIndex)}
					navAddress={getFieldValueByID(fieldIDs['navigation'], varIndex)}
					setTextInput={(value: string) =>
						updateDynamicVariables('text', value, varIndex)
					}
					setPersonalField={(value: string) =>
						updateDynamicVariables('personalField', value, varIndex)
					}
					onAddRemovalLink={(isTrack: boolean) =>
						updateDynamicVariables('link', '##WHATSAPPUnsubscribelink##', varIndex, isTrack)
					}
					setLinkInput={(value: string, isTrack: boolean) =>
						updateDynamicVariables('link', value, varIndex, isTrack, dynamicProductFallbackURL)
					}
					setLandPage={(value: string, isTrack: boolean = false) =>
						updateDynamicVariables('landingPage', value, varIndex, isTrack)
					}
					setNavApp={setNavApp}
					setNavAddress={(value: string) =>
						updateDynamicVariables('navigation', value, varIndex)
					}
					personalFields={personalFields}
					landingPageData={landingPageData}
					isTrackLink={isTrackLink}
					dynamicProductType={dynamicProductType}
					setDynamicProductType={(value: string) => {
						setDynamicProductType(value);
						updateDynamicVariables('link', value, varIndex, true, dynamicProductFallbackURL);
					}}
					dynamicProductFallbackURL={dynamicProductFallbackURL}
					setDynamicProductFallbackURL={(val: string) => {
						setDynamicProductFallbackURL(val);
						updateDynamicVariables('link', dynamicProductType, varIndex, true, val);
					}}
				/>
			</Box>
		);
	};

	// ── Variables step — full message with clickable {{N}} placeholder chips ──
	const renderVariablesStep = () => {
		const bodyText = getTemplateBodyText(selectedTemplate!);
		// Split body into alternating text / placeholder segments
		const parts = bodyText.split(/({{[0-9]+}})/g);

		return (
			<Box style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
				{/* Hint */}
				<Typography
					variant="caption"
					style={{ color: '#888', display: 'block', marginBottom: '6px', textAlign: isRTL ? 'right' : 'left' }}>
					{translator('whatsappChat.clickPlaceholderHint') ||
						'Click a highlighted placeholder to fill it in.'}
				</Typography>

				{/* Full message with inline clickable placeholder chips */}
				<Box
					style={{
						background: '#f9f9f9',
						border: '1px solid #e0e0e0',
						borderRadius: '8px',
						padding: '12px 16px',
						lineHeight: 2.2,
						fontSize: '14px',
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-word',
						textAlign: isRTL ? 'right' : 'left',
					}}>
					{parts.map((part, i) => {
						if (/^{{[0-9]+}}$/.test(part)) {
							const varIndex = getVarIndex(part);
							const existing = updatedDynamicVariable.find(
								(u) => u.VariableIndex === varIndex
							);
							const isFilled = !!(existing?.VariableValue);
							const isActive = activeVarKey === part;
							const displayValue = isFilled ? existing!.VariableValue : part;

							return (
								<Button
									key={`chip-${i}`}
									variant="outlined"
									size="small"
									onClick={() => handleVarChipClick(part)}
									style={{
										borderRadius: '12px',
										padding: '0px 10px',
										margin: '0 3px',
										minWidth: 'auto',
										textTransform: 'none',
										fontSize: '13px',
										lineHeight: '1.6',
										verticalAlign: 'middle',
										border: isActive
											? '2px solid #FF3343'
											: isFilled
											? '1.5px solid #4caf50'
											: '1.5px dashed #ff9800',
										backgroundColor: isActive
											? '#fff0f0'
											: isFilled
											? '#e8f5e9'
											: '#fff8e1',
										color: isActive
											? '#FF3343'
											: isFilled
											? '#2e7d32'
											: '#e65100',
										fontWeight: isActive ? 700 : 500,
										transition: 'all 0.15s ease',
									}}>
									{displayValue}
								</Button>
							);
						}
						// Plain text segment
						return <span key={`text-${i}`}>{part}</span>;
					})}
				</Box>

				{/* Editor panel — expands below when a chip is active */}
				{activeVarKey && renderVarEditor(activeVarKey)}
			</Box>
		);
	};

	const renderReviewStep = () => (
		<Box style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
			<Typography
				variant="body2"
				style={{ marginBottom: '8px', fontWeight: 600, textAlign: isRTL ? 'right' : 'left' }}>
				{translator('whatsappChat.reviewAndSend')}
			</Typography>
			<Box
				className={classes.startNewChatPreviewBox}
				style={{ textAlign: isRTL ? 'right' : 'left' }}>
				{buildInterpolatedText()}
			</Box>
			<Box
				className={classes.startNewChatDisclaimerBox}
				style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
				{translator('whatsappChat.sendDirectMessageDisclaimer')}
			</Box>
		</Box>
	);

	const renderStep = () => {
		switch (step) {
			case 'phone':
				return renderPhoneStep();
			case 'template':
				return renderTemplateStep();
			case 'variables':
				return renderVariablesStep();
			case 'review':
				return renderReviewStep();
		}
	};

	const renderActions = () => (
		<DialogActions className={classes.startNewChatDialogActions} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
			{/* Back / Previous variable */}
			<Box>
				{step === 'template' && (
					<Button onClick={() => setStep('phone')} disabled={isSending}>
						{translator('common.back') || 'Back'}
					</Button>
				)}
				{step === 'variables' && (
					<Button onClick={() => { setActiveVarKey(null); setStep('template'); }} disabled={isSending}>
						{translator('common.back') || 'Back'}
					</Button>
				)}
				{step === 'review' && (
					<Button
						onClick={() => {
							setActiveVarKey(null);
							setStep(dynamicVariables.length > 0 ? 'variables' : 'template');
						}}
						disabled={isSending}>
						{translator('common.back') || 'Back'}
					</Button>
				)}
			</Box>

			{/* Forward */}
			<Box>
				{step === 'phone' && (
					<Button
						variant="contained"
						color="primary"
						className={clsx(classes.btn, classes.btnRounded)}
						onClick={handlePhoneNext}>
						{translator('common.next') || 'Next'}
					</Button>
				)}
				{/* No Next button on template step — "Select" buttons in the list handle advancement */}
				{step === 'variables' && (
					<Button
						variant="contained"
						color="primary"
						className={clsx(classes.btn, classes.btnRounded, classes.redButton)}
						onClick={handleVarsNext}>
						{translator('common.next') || 'Next'}
					</Button>
				)}
				{step === 'review' && (
					<Button
						variant="contained"
						color="primary"
						className={clsx(
							classes.btn,
							classes.btnRounded,
							classes.redButton
						)}
						onClick={handleSend}
						disabled={isSending}>
						{isSending ? (
							<Box
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
								}}>
								<CircularProgress size={16} color="inherit" />
								<span>{translator('common.Sending') || 'Sending...'}</span>
							</Box>
						) : (
							translator('whatsappChat.sendNewChat')
						)}
					</Button>
				)}
			</Box>
		</DialogActions>
	);

	return (
		<Dialog open={open} onClose={handleModalClose} maxWidth="sm" fullWidth>
			<DialogTitle
				disableTypography
				className={classes.startNewChatDialogTitle}
				style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
				<span>{translator('whatsappChat.startNewChat')}</span>
				<IconButton
					onClick={handleModalClose}
					size="small"
					style={{ color: '#fff' }}>
					<BsX size={20} />
				</IconButton>
			</DialogTitle>
			{renderStepIndicator()}
			<DialogContent className={classes.startNewChatDialogContent}>
				{renderStep()}
			</DialogContent>
			{renderActions()}
		</Dialog>
	);
};

export default StartNewChatModal;
