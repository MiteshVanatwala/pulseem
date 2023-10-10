import React from 'react';
import {
  Button, FormControl, MenuItem
} from '@material-ui/core';
import clsx from 'clsx';
import { Select } from '@mui/material';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { SortDirection } from '../../Models/PushNotifications/Enums';

const Sort = ({
  classes,
  sortBySelected,
  sortItems,
  sortDirection,
  handleSortDirection,
  handleSortBySelected
}: any) => {
  const renderSortItems = () => {
    return sortItems.map((sortBy: any) => {
        return (<MenuItem key={sortBy.value} value={sortBy.value}>{sortBy.text}</MenuItem>)
    });
  }

  return (
    <>
      <FormControl className={clsx(classes.dropDown)} style={{ height: 'auto' }}>
        <Select
            id="groupOrder"
            value={sortBySelected}
            className={clsx(classes.sortBySelect)}
            onChange={handleSortBySelected}
        >
            {renderSortItems()}
        </Select>
      </FormControl>
      <Button className={clsx(classes.formControl, classes.dropDown, classes.controlField)} onClick={handleSortDirection} style={{ height: 40 }}>
          {sortDirection === SortDirection.DESC ? <BiSortDown /> : <BiSortUp />}
      </Button>  
    </>
  )
}


export default React.memo(Sort);