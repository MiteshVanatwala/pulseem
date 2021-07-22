import exportFromJSON from 'export-from-json'

export const exportFile=({ data=[], fileName='PulseemReport', exportType='xls' }) => {
  exportFromJSON({
    data,
    fileName,
    exportType
  })
}