import exportFromJSON from 'export-from-json'

export const exportFile = ({ data = [], fileName = 'PulseemReport', exportType = 'csv', fields = null }) => {
  exportFromJSON({
    data,
    fileName,
    exportType,
    fields,
    withBOM: true
  })
}