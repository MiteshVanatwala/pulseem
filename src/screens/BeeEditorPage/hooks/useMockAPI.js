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
    ref.current = [...rows, JSON.parse(row)];
    setRows(prevRows => [...prevRows, JSON.parse(row)])
    return new Promise((resolve) => resolve);
  }

  const getRows = async (handle) => {
    let items = ref.current;
    if (ref?.current.length > 0) {
      items = ref?.current.filter((row) => {
        return row.metadata.tags.split(',').find((tag) => {
          return tag.trim() === handle
        });
      });
      items = items.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === items.findIndex(obj => {
          return JSON.stringify(obj) === _value;
        });
      });
    }

    return new Promise((resolve) => {
      resolve(items)
    })
  }

  const getTags = () => {
    let tempTags = [...new Set(ref?.current.map(item => item?.metadata?.tags))];
    return tempTags;
  }

  return {
    handleDeleteRow,
    handleEditRow,
    getRows,
    setRow,
    getTags
  }
}

export default useMockAPI
