import { Box, Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { FileUploadProps, coreProps } from '../Types/WhatsappCreator.types';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

const FileUpload = ({
	classes,
	fileData,
	buttonType,
	setFileData,
	sourceFileSize = ''
}: FileUploadProps) => {
	const { t: translator } = useTranslation();
	const [fileSize, setFileSize] = useState<string>('');
	const [alert, setAlert] = useState<string>('');

	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

	const units = ['bytes', 'KB', 'MB'];

	useEffect(() => {
		if (sourceFileSize !== '') {
			setFileSize(niceBytes(sourceFileSize));
		}
	}, [sourceFileSize])

	const checkFileUploadAvailability = (e: BaseSyntheticEvent) => {
		if (buttonType === 'quickReply') {
			e.preventDefault();
			e.stopPropagation();
			setAlert(translator('whatsapp.alertModal.fileUploadAlert'));
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
				setAlert(translator('whatsapp.alertModal.fileSizeAlert'));
			}
		}
	};

	const onFileDeselect = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		setFileData(undefined);
	};

	const renderDialog = () => {
    if (alert) {
			return (
				<BaseDialog
					classes={classes}
					open={!!alert}
					onCancel={() => setAlert('')}
					onClose={() => setAlert('')}
					onConfirm={() => setAlert('')}
					renderButtons={null}
				>
					<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        		{alert}
      		</Typography>
				</BaseDialog>
			)
		}
  }

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
								cursor: 'auto',
							}}>
							{fileData?.fileLink
								?.split('/')
							[fileData?.fileLink?.split('/')?.length - 1]?.substring(0, 25) +
								'...'}
							&emsp;
							<i
								style={{
									padding: '2px 4px',
									cursor: 'pointer',
								}}
								onClick={(e) => onFileDeselect(e)}
								className='zmdi zmdi-close'></i>
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
			{renderDialog()}
		</Box>
	);
};

export default FileUpload;
