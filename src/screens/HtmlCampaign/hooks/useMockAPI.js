import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react'

const useMockAPI = () => {
  const [rows, setRows] = useState([])

  const ref = React.useRef()
  React.useEffect(() => {
    ref.current = rows
  }, [rows])

  const handleDeleteRow = async (args) => setRows(prevRows => [...prevRows.filter(row => (row?.metadata?.uuid === args?.row?.metadata?.uuid) ? false : true)])

  const handleEditRow = async (args, newValue, newTag) => setRows(prevRows => {
    const newRows = prevRows.map(
      row => (row.metadata.name === args.row.metadata.name || row.metadata.uuid === args?.row?.metadata?.uuid
        ? {
          ...row,
          metadata: {
            ...row.metadata,
            name: `${newValue}`,
            tags: `${newTag}`,
            uuid: row.metadata?.uuid ?? uuidv4()
          }
        }
        : row)
    )
    return [...newRows]
  })

  const setRow = async (row) => {
    setRows(prevRows => [...prevRows, JSON.parse(row)])
  }

  const getRows = async (handle) => {
    let items = ref.current;
    if (ref?.current.length > 0) {
      items = ref?.current.filter((row) => {
        return row.metadata.tags.split(',').find((tag) => {
          return tag.trim() === handle
        });
      });
    }
    return new Promise((resolve) => {
      resolve(items)
    })
  }

  return {
    handleDeleteRow,
    handleEditRow,
    getRows,
    setRow,
  }
}

export default useMockAPI
