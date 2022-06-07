import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const jsonToCSV = async (data) => {
    try {
        const { array } = data;

        const p = Papa.unparse(array, {
            quotes: false, //or array of booleans
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ",",
            header: false,
            newline: "\r\n",
            skipEmptyLines: true, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
            columns: null, //or array of strings
            encoding: "UTF-8"
        });

        const output = stringToArrayBuffer(p);
        return output;
    }
    catch (e) {
        console.error('jsonToCsv', e);
    }
}

export const createCSV = async (data) => {
    const promise = new Promise((resolve, reject) => {
        try {
            var workbook = XLSX.read(data, { type: "array" });
            var csv = XLSX.utils.sheet_to_csv(
                workbook.Sheets[workbook.SheetNames[0]]
                , { header: 1 });
            resolve(csv);
        } catch (e) {
            console.error('createCSV', e);
            reject(null);
        }
    });
    promise.then((csvOutput) => {
        return csvOutput;
    })

}

export const stringToArrayBuffer = (str) => {
    try {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    } catch (e) {
        console.error('stringToArrayBuffer', e);
        return null;
    }
}