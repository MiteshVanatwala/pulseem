import exportFromJSON from 'export-from-json'

export const exportFile=({ data=[], fileName='PulseemReport', exportType='csv' }) => {
  exportFromJSON({
    data,
    fileName,
    exportType
  })
}