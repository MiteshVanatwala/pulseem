import exportFromJSON from 'export-from-json';
import { ExportType } from 'export-from-json';
import * as XLSX from 'xlsx';

const defaultData = { fileName: 'PulseemReport', exportType: 'csv' };

export type Options = {
	fileName: string;
	exportType: ExportType | any;
	data: any;
	fields: any;
};
const ExportFile = (options: Options) => {
	if (options.fileName === '') {
		options.fileName = defaultData.fileName;
	}
	if (!options.exportType) {
		options.exportType = defaultData.exportType as ExportType;
	}

	const ePromise = new Promise((resolve, reject) => {
		try {
			if (!options?.data || (options?.data && options?.data?.length === 0)) {
				reject('No data has been found.');
			}

			exportFromJSON({
				data: options.data,
				fileName: options.fileName,
				exportType: 'csv',
				fields: options.fields,
				extension: options.exportType,
				withBOM: true,
			});

			resolve('Success');
		} catch (e) {
			console.log('export error', e);
			resolve(false);
		}
	});

	ePromise.then((result) => {
		return result;
	});
};
const exportAsXLSX = async (
	jsonObject: any,
	heading: any = null,
	fileName = 'pulseemExport.XLSX',
	sheetName = 'Sheet1'
) => {
	return new Promise((resolve: Function) => {
		const options: any = {
			origin: 'A2',
			skipHeader: true,
		};
		const ws = XLSX.utils.json_to_sheet(jsonObject, options);
		const wb = XLSX.utils.book_new();

		if (heading) {
			const newHeading = Object.entries(Object.values(heading));
			const finalHeading = newHeading.map((e) => {
				return e[1];
			});
			XLSX.utils.sheet_add_aoa(ws, [finalHeading], { origin: 'A1' });
		}

		XLSX.utils.book_append_sheet(wb, ws, sheetName);
		XLSX.writeFile(wb, fileName, { bookType: 'xlsx', type: 'buffer' });

		resolve();
	});
};

export { ExportFile, exportAsXLSX };
