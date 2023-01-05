import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { manualUploadProps } from '../Types/WhatsappCampaign.types';
import { BaseSyntheticEvent } from 'react';
import * as XLSX from 'xlsx';

const ManualUpload = ({
	classes,
	highlighted,
	areaData,
	setHighlighted,
	setAreaData,
	setContacts,
	setTypedData,
	setTotalRecords,
	totalRecords,
	setInitialHeadState,
	setHeaders,
	setIsColumnAdjustmentModal,
	setAlertModalSubtitle,
	setIsAlert,
}: manualUploadProps) => {
	const { t: translator } = useTranslation();

	const areaChange = (e: BaseSyntheticEvent) => {
		let enteredValue: string[] = e.target.value.split('\n');
		const records = enteredValue.filter((r: string) => {
			return r !== '';
		});
		setTotalRecords(records.length);
		setAreaData(e.target.value);
	};

	const handleFiles = (e: React.DragEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		setHighlighted(false);
		if (e?.dataTransfer?.files && e?.dataTransfer?.files?.length > 0) {
			if (e?.dataTransfer?.files?.length === 1) {
				const file: File = e.dataTransfer.files[0];
				const reader = new FileReader();
				return new Promise((resolve, reject) => {
					try {
						if (file.name.toLowerCase().indexOf('xls') > -1) {
							reader.onload = function (e: ProgressEvent<FileReader>) {
								if (e?.target?.result) {
									var data = new Uint8Array(
										e?.target?.result as ArrayBufferLike
									);
									setTimeout(() => {
										var workbook = XLSX.read(data, { type: 'array' });
										var csv: string = XLSX.utils.sheet_to_csv(
											workbook.Sheets[workbook.SheetNames[0]]
										);

										let temp: string = csv;
										let a: string[] = temp.split('\n');
										let b: string[][] = [];
										for (let i = 0; i < a.length; i++) {
											b.push(a[i].split(','));
										}
										b.pop();
										setTypedData(b);
										setTotalRecords(b.length);
										setAreaData(b.join('\n'));
										let dummyArr = [];
										for (let i = 0; i < b[0].length; i++) {
											dummyArr.push(translator('sms.adjustTitle'));
										}
										setInitialHeadState(dummyArr);
										setHeaders(dummyArr);

										setIsColumnAdjustmentModal(true);
									}, 0);
								}
							};
							reader.readAsArrayBuffer(file);
						} else if (file.name.toLowerCase().indexOf('csv') > -1) {
							reader.readAsText(file);
							reader.onload = function (e: ProgressEvent<FileReader>) {
								if (e?.target?.result) {
									const lines = e.target.result?.toString()?.split('\n');
									const linesWithoutCommas = lines.map((line: string) =>
										line.replace(/"[^"]+"/g, function (v) {
											return v.replace(/,/g, '');
										})
									);
									const updatedData: string[][] = [];
									linesWithoutCommas?.forEach((line: string) => {
										if (line?.length > 0) {
											updatedData.push(line?.split(';'));
										}
									});
									setTypedData(updatedData);
									setTotalRecords(updatedData?.length);
									setAreaData(
										linesWithoutCommas
											.filter((line: string) => line?.length > 0)
											.join('\n')
											?.replace(/;/g, ',')
									);
									setIsColumnAdjustmentModal(true);
								}
							};
						} else {
							setAlertModalSubtitle('File type is not supported');
							setIsAlert(true);
							return false;
						}
					} catch (error) {
						reject(error);
					}
				});
			} else {
				setAlertModalSubtitle('Multiple files are not supported');
				setIsAlert(true);
			}
		}
	};

	const handlePasted = () => {
		let temp = areaData;
		let splittedAreaData: string[] = temp
			?.split('\n')
			.filter((empty: string) => empty);
		let updatedTypedData = [];
		let cols = 0;
		if (temp?.indexOf('\t') > -1) {
			for (let i = 0; i < splittedAreaData.length; i++) {
				let splitted = splittedAreaData[i].split('\t');
				updatedTypedData.push(splitted);
				if (splitted.length > cols) {
					cols = splitted.length;
				}
			}
		} else {
			const records = splittedAreaData.filter((r: string) => {
				return r !== '';
			});
			for (let i = 0; i < records.length; i++) {
				let splitted = splittedAreaData[i].split(',');
				updatedTypedData.push(splitted);
				if (splitted.length > cols) {
					cols = splitted.length;
				}
			}
		}
		setTypedData(updatedTypedData);

		let dummyArr = [];
		for (let i = 0; i < cols; i++) {
			dummyArr.push(translator('sms.adjustTitle'));
		}
		setInitialHeadState(dummyArr);
		setHeaders(dummyArr);
		setIsColumnAdjustmentModal(true);
	};

	return (
		<>
			<Grid
				item
				md={12}
				xs={12}
				className={
					highlighted ? clsx(classes.greenManual) : clsx(classes.areaManual)
				}>
				<textarea
					placeholder={translator('sms.dragXlOrCsv')}
					spellCheck='false'
					autoComplete='off'
					className={
						highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon)
					}
					value={areaData}
					onDragEnter={() => {
						setHighlighted(true);
					}}
					onChange={areaChange}
					onDragLeave={() => {
						setHighlighted(false);
					}}
					onDragOver={(e) => {
						e.preventDefault();
					}}
					onPaste={areaChange}
					onDrop={(e: React.DragEvent<HTMLTextAreaElement>) => {
						handleFiles(e);
					}}
				/>
			</Grid>

			<Grid
				container
				className={classes.manualChild}
				style={{
					justifyContent: areaData === '' ? 'flex-end' : 'space-between',
				}}>
				{areaData && areaData?.length > 0 && (
					<div>
						<span
							className={classes.addManualDiv}
							onClick={() => {
								handlePasted();
							}}>
							{translator('sms.editFields')}
						</span>
						<span
							className={classes.clearDiv}
							onClick={() => {
								setAreaData('');
								setContacts([]);
								setTypedData([]);
								setTotalRecords(0);
							}}>
							{translator('sms.clearList')}
						</span>
					</div>
				)}
				<span>
					{translator('sms.totalRecords')}: {totalRecords}
				</span>
			</Grid>
		</>
	);
};
export default ManualUpload;
