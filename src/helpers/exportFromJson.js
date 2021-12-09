import exportFromJSON from 'export-from-json'

export const exportFile = ({ data = [], fileName = 'PulseemReport', exportType = 'xls', fields = null }) => {
  // let table = '<table>';
  // let tr;
  // for (var i = 0; i < data.length; i++) {
  //   tr = '<tr>';
  //   let tds = '';
  //   Object.keys(data[i]).forEach((k, index) => {
  //     tds += "<td>" + data[i][k] + "</td>";
  //   });
  //   tr += tds;
  //   tr += '</tr>';
  //   table += tr;
  // }
  // table += '</table>'

  // table = table.replace('##tableData##', tr);
  exportFromJSON({
    data,
    fileName,
    exportType,
    fields,
    withBOM: true
  })
}