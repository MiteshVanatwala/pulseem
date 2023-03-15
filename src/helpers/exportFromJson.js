import exportFromJSON from 'export-from-json'
import * as XLSX from 'xlsx';

export const exportFile = ({ data = [], fileName = 'PulseemReport', exportType = exportFromJSON.types.csv, fields = null }) => {
    exportFromJSON({
        data,
        fileName,
        exportType,
        fields,
        withBOM: true
    })
}

export const exportAsXLSX = async (jsonObject, heading = null, fileName = "pulseemExport.XLSX", sheetName = 'Sheet1') => {
    return new Promise((resolve) => {
        const ws = XLSX.utils.json_to_sheet(jsonObject, { origin: 'A2', skipHeader: true });
        const wb = XLSX.utils.book_new();

        if (heading) {
            const newHeading = Object.entries(Object.values(heading));
            const finalHeading = newHeading.map(e => { return e[1] });
            XLSX.utils.sheet_add_aoa(ws, [finalHeading], { origin: 'A1' });
        }

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, fileName, { bookType: 'xlsx', type: 'buffer' });

        resolve();
    })
}