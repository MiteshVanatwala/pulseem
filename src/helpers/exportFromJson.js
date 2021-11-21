import exportFromJSON from 'export-from-json'

export const exportFile=({ data=[], fileName='PulseemReport', exportType='xls', fields = null }) => {
  exportFromJSON({
    data,
    fileName,
    exportType,
    fields
  })
}