import exportFromJSON from 'export-from-json'
import { ExportType } from 'export-from-json';

const defaultData = { fileName: 'PulseemReport', exportType: 'csv' };

export type Options = {
    fileName: string;
    exportType: ExportType | any;
    data: any;
    fields: any;

}
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
                reject("No data has been found.");
            }

            exportFromJSON({
                data: options.data,
                fileName: options.fileName,
                exportType: options.exportType,
                fields: options.fields,
                withBOM: true
            });

            resolve("Success");

        }
        catch (e) {
            console.log('export error', e);
            resolve(false);
        }
    });

    ePromise.then((result) => {
        return result;
    })
}

export { ExportFile }