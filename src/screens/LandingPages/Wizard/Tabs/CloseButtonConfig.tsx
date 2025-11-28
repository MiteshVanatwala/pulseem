import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Paper } from '@material-ui/core';
import { ChromePicker } from 'react-color';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Close } from '@material-ui/icons';

interface CloseButtonConfigProps {
	classes: any;
	data: any;
	onUpdate: (data: any) => void;
}

interface CloseButtonSettings {
	color: string;
	bgcolor: string;
	size: number;
	position: 'Left' | 'Center' | 'Right';
}

const CloseButtonConfig: React.FC<CloseButtonConfigProps> = ({ classes, data, onUpdate }) => {
	const { t: translator } = useTranslation();
	const [closeButtonSettings, setCloseButtonSettings] = useState<CloseButtonSettings>({
		color: '#000000',
		bgcolor: '#fee6e6',
		size: 50,
		position: 'Right'
	});
  const { isRTL } = useSelector((state: any) => state.core)
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showBgColorPicker, setShowBgColorPicker] = useState(false);

	// Parse CloseButtonHtml to extract settings
	const parseCloseButtonHtml = (html: string): CloseButtonSettings | null => {
		try {
			// Create a temporary DOM element to parse the HTML
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			const closeButton = tempDiv.querySelector('[ID="PulseemCloseButton"]');
			
			if (closeButton) {
				const color = closeButton.getAttribute('data-color') || '#000000';
				const bgcolor = closeButton.getAttribute('data-bgcolor') || '#fee6e6';
				const size = parseInt(closeButton.getAttribute('data-Size') || '50');
				const position = (closeButton.getAttribute('data-Position') as 'Left' | 'Center' | 'Right') || 'Right';
				
				return {
					color,
					bgcolor,
					size,
					position
				};
			}
		} catch (error) {
			console.error('Error parsing CloseButtonHtml:', error);
		}
		return null;
	};

	// Initialize component with existing data
	useEffect(() => {
		if (data.closeButtonSettings) {
			setCloseButtonSettings(data.closeButtonSettings);
		} else if (data.CloseButtonHtml) {
			// Parse CloseButtonHtml to extract settings
			const settings = parseCloseButtonHtml(data.CloseButtonHtml);
			if (settings) {
				setCloseButtonSettings(settings);
			}
		}
	}, [data.closeButtonSettings, data.CloseButtonHtml]);

	const handleColorChange = (color: any) => {
		const newSettings = { ...closeButtonSettings, color: color.hex };
		setCloseButtonSettings(newSettings);
		onUpdate({
			...data,
			closeButtonSettings: newSettings,
			CloseButtonHtml: generateCloseButtonHTML(newSettings)
		});
	};

	const handleBgColorChange = (color: any) => {
		const newSettings = { ...closeButtonSettings, bgcolor: color.hex };
		setCloseButtonSettings(newSettings);
		onUpdate({
			...data,
			closeButtonSettings: newSettings,
			CloseButtonHtml: generateCloseButtonHTML(newSettings)
		});
	};

	const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const size = parseInt(event.target.value) || 50;
		const newSettings = { ...closeButtonSettings, size };
		setCloseButtonSettings(newSettings);
		onUpdate({
			...data,
			closeButtonSettings: newSettings,
			CloseButtonHtml: generateCloseButtonHTML(newSettings)
		});
	};

	const handlePositionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		const position = event.target.value as 'Left' | 'Center' | 'Right';
		const newSettings = { ...closeButtonSettings, position };
		setCloseButtonSettings(newSettings);
		onUpdate({
			...data,
			closeButtonSettings: newSettings,
			CloseButtonHtml: generateCloseButtonHTML(newSettings)
		});
	};

	const generateCloseButtonHTML = (settings?: CloseButtonSettings) => {
		const currentSettings = settings || closeButtonSettings;
		return `<div ID='PulseemCloseButton' data-color='${currentSettings.color}' data-bgcolor='${currentSettings.bgcolor}' data-Size='${currentSettings.size}' data-Position='${currentSettings.position}'>&times;</div>`;
	};

	const getPositionStyle = () => {
		switch (closeButtonSettings.position) {
			case 'Left':
				return { 
					justifyContent: 'flex-start',
					left: isRTL ? '-3px' : '3px'
				};
			case 'Center':
				return { justifyContent: 'center' };
			case 'Right':
				return { 
					justifyContent: 'flex-end',
					right: isRTL ? '-3px' : '3px'
				};
			default:
				return { justifyContent: 'flex-end' };
		}
	};

	return (
		<Box className={classes.container}>
			<Typography className={clsx(classes.bold, classes.font18, classes.mb20)}>
				{translator('PopupTriggers.closeButtonConfiguration')}
			</Typography>

			<Grid container spacing={3}>
				{/* Configuration Section */}
				<Grid item xs={12} md={6}>
					<Paper className={clsx(classes.p20, classes.mb20)}>

						{/* Color Picker */}
						<Box className={classes.mb20}>
							<Typography className={clsx(classes.bold, classes.mb10)}>
								{translator('PopupTriggers.closeButtonTextColor')}
							</Typography>
							<Box 
								onClick={() => setShowColorPicker(!showColorPicker)}
								style={{ 
									backgroundColor: closeButtonSettings.color,
									width: '40px',
									height: '40px',
									border: '2px solid #ccc',
									borderRadius: '4px',
									cursor: 'pointer',
									marginBottom: '10px'
								}}
							/>
							{showColorPicker && (
								<Box style={{ position: 'relative', zIndex: 1000 }}>
									<ChromePicker
										color={closeButtonSettings.color}
										onChange={handleColorChange}
									/>
								</Box>
							)}
						</Box>

						{/* Background Color Picker */}
						<Box className={classes.mb20}>
							<Typography className={clsx(classes.bold, classes.mb10)}>
								{translator('PopupTriggers.closeButtonBgColor')}
							</Typography>
							<Box 
								onClick={() => setShowBgColorPicker(!showBgColorPicker)}
								style={{ 
									backgroundColor: closeButtonSettings.bgcolor,
									width: '40px',
									height: '40px',
									border: '2px solid #ccc',
									borderRadius: '4px',
									cursor: 'pointer',
									marginBottom: '10px'
								}}
							/>
							{showBgColorPicker && (
								<Box style={{ position: 'relative', zIndex: 1000 }}>
									<ChromePicker
										color={closeButtonSettings.bgcolor}
										onChange={handleBgColorChange}
									/>
								</Box>
							)}
						</Box>

						{/* Size Input */}
						<Box className={classes.mb20}>
							<Typography className={clsx(classes.bold, classes.mb10)}>
								{translator('PopupTriggers.closeButtonSize')}
							</Typography>
							<TextField
								type="number"
								value={closeButtonSettings.size}
								onChange={handleSizeChange}
								variant="outlined"
								size="small"
								inputProps={{ min: 10, max: 100 }}
								className={classes.w100}
							/>
						</Box>

						{/* Position Dropdown */}
						<Box className={classes.mb20}>
							<Typography className={clsx(classes.bold, classes.mb10)}>
								{translator('PopupTriggers.closeButtonPosition')}
							</Typography>
							<FormControl variant="outlined" size="small" className={classes.w100}>
								<InputLabel>{translator('PopupTriggers.closeButtonPosition')}</InputLabel>
								<Select
									value={closeButtonSettings.position}
									onChange={handlePositionChange}
									label={translator('PopupTriggers.closeButtonPosition')}
								>
									<MenuItem value="Left">{translator('common.AlignLeft')}</MenuItem>
									<MenuItem value="Center">{translator('common.alignCenter')}</MenuItem>
									<MenuItem value="Right">{translator('common.AlignRight')}</MenuItem>
								</Select>
							</FormControl>
						</Box>

						{/* Generated HTML */}
						{/* <Box className={classes.mb20}>
							<Typography className={clsx(classes.bold, classes.mb10)}>
								{translator('PopupTriggers.generatedHTML')}
							</Typography>
							<Box 
								className={classes.p10}
								style={{ 
									backgroundColor: '#f5f5f5', 
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontFamily: 'monospace',
									fontSize: '12px'
								}}
							>
								{generateCloseButtonHTML()}
							</Box>
						</Box> */}
					</Paper>
				</Grid>

				{/* Preview Section */}
				<Grid item xs={12} md={6}>
					<Paper className={clsx(classes.p20, classes.mb20)}>
						<Typography className={clsx(classes.bold, classes.font16, classes.mb15)}>
							{translator('common.Preview')}
						</Typography>

						{/* Dummy Popup Preview with Close Button Overlay */}
						<Box 
							style={{
								position: 'relative',
								width: '300px',
								backgroundColor: '#ffffff',
								border: '2px solid #333',
								borderRadius: '8px',
								margin: '0 auto',
								overflow: 'visible'
							}}
						>
							{/* Popup Content */}
							<Box 
								style={{
									padding: '20px',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									textAlign: 'center'
								}}
							>
								<Typography variant="h6" style={{ marginBottom: '10px' }}>
									{translator('PopupTriggers.samplePopup')}
								</Typography>
								<Typography variant="body2" style={{ color: '#666' }}>
									{translator('PopupTriggers.closeButtonPreviewDescription')}
								</Typography>
							</Box>

							{/* Close Button - Positioned on top of popup */}
							<Box
								style={{
									position: 'absolute',
									top: '3px',
									width: '100%',
									display: 'flex',
									...getPositionStyle()
								}}
							>
							<Box
								style={{
									width: `${closeButtonSettings.size}px`,
									height: `${closeButtonSettings.size}px`,
									backgroundColor: closeButtonSettings.bgcolor,
									color: closeButtonSettings.color,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: '50%',
									cursor: 'pointer',
									fontWeight: 'bold',
									fontSize: `${Math.max(closeButtonSettings.size * 0.6, 12)}px`,
									boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
								}}
							>
								<Close style={{ fontSize: '1.25em' }} />
							</Box>
							</Box>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default CloseButtonConfig;
