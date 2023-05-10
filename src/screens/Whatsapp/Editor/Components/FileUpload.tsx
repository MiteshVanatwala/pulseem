import { Box, Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { FileUploadProps, coreProps } from '../Types/WhatsappCreator.types';
import { BaseSyntheticEvent, useState } from 'react';
import AlertModal from '../Popups/AlertModal';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

const FileUpload = ({
	classes,
	fileData,
	buttonType,
	setFileData,
}: FileUploadProps) => {
	const { t: translator } = useTranslation();
	const [isFileUploadAlert, setIsFileUploadAlert] = useState<boolean>(false);
	const [isFileSizeAlert, setIsFileSizeAlert] = useState<boolean>(false);
	const [fileSize, setFileSize] = useState<string>('');

	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

	const units = ['bytes', 'KB', 'MB'];

	const checkFileUploadAvailability = (e: BaseSyntheticEvent) => {
		if (buttonType === 'quickReply') {
			e.preventDefault();
			e.stopPropagation();
			setIsFileUploadAlert(true);
		}
	};

	function niceBytes(x: string) {
		let l = 0,
			n = parseInt(x, 10) || 0;

		while (n >= 1024 && ++l) {
			n = n / 1024;
		}
		return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
	}

	const onFileUploadChange = (e: BaseSyntheticEvent) => {
		if (e.target.files?.length > 0) {
			if (e.target.files[0].size < 16777216) {
				setFileData(e.target.files[0]);
				setFileSize(niceBytes(e.target.files[0].size));
			} else {
				setIsFileSizeAlert(true);
			}
		}
	};

	const onFileDeselect = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		setFileData(undefined);
	};

	return (
		<Box className={clsx(classes.buttonForm, classes.fileUpload)}>
			<Typography className={classes.buttonHead}>
				<>{translator('whatsapp.uploadFileTitle')}</>
			</Typography>
			<label
				className={classes.customFileUpload}
				style={{
					padding:
						fileData?.fileLink?.length > 0
							? '14px 15px 12px 7px'
							: '17px 15px 15px 7px',
				}}>
				<input
					type='file'
					className={classes.formFieldInput}
					accept='image/png, image/jpeg, application/pdf, video/mp4'
					onClick={(e) => checkFileUploadAvailability(e)}
					onChange={(e) => onFileUploadChange(e)}
				/>
				{fileData?.fileLink?.length > 0 ? (
					<div style={{ marginRight: 'auto', width: '100%' }}>
						<Button
							variant='contained'
							color='primary'
							size='small'
							style={{
								borderRadius: '22px',
								padding: '0px 10px 0px 10px',
								width: '100%',
							}}
							onClick={(e) => onFileDeselect(e)}>
							{fileData?.fileLink
								?.split('/')
								[fileData?.fileLink?.split('/')?.length - 1]?.substring(0, 25) +
								'...'}
							&emsp;
							<i className='zmdi zmdi-close'></i>
						</Button>
					</div>
				) : (
					<i className='zmdi zmdi-upload'></i>
				)}
			</label>

			<Typography className={classes.buttonContent}>
				{fileData?.fileLink?.length > 0 ? (
					<>
						{isRTL
							? `${fileSize} ${translator('whatsapp.totalSize')}`
							: `${translator('whatsapp.totalSize')} ${fileSize}`}
					</>
				) : (
					<>{translator('whatsapp.fileDescription')}</>
				)}
			</Typography>

			<AlertModal
				classes={classes}
				isOpen={isFileSizeAlert}
				onClose={() => setIsFileSizeAlert(false)}
				title={translator('whatsapp.alertModal.alert')}
				subtitle={translator('whatsapp.alertModal.fileSizeAlert')}
				type='alert'
				onConfirmOrYes={() => setIsFileSizeAlert(false)}
			/>

			<AlertModal
				classes={classes}
				isOpen={isFileUploadAlert}
				onClose={() => setIsFileUploadAlert(false)}
				title={translator('whatsapp.alertModal.alert')}
				subtitle={translator('whatsapp.alertModal.fileUploadAlert')}
				type='alert'
				onConfirmOrYes={() => setIsFileUploadAlert(false)}
			/>
		</Box>
	);
};

export default FileUpload;
