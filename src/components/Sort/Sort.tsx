import React from 'react';
import {
  Button, FormControl, MenuItem
} from '@material-ui/core';
import clsx from 'clsx';
import { Select } from '@mui/material';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { SortDirection } from '../../Models/PushNotifications/Enums';
import { IoIosArrowDown } from 'react-icons/io';
import { useSelector } from 'react-redux';

const Sort = ({
  classes,
  sortBySelected,
  sortItems,
  sortDirection,
  handleSortDirection,
  handleSortBySelected
}: any) => {
  const { isRTL } = useSelector((state: any) => state.core)
  const renderSortItems = () => {
    return sortItems.map((sortBy: any) => {
      return (<MenuItem key={sortBy.value} value={sortBy.value}>{sortBy.text}</MenuItem>)
    });
  }

  return (
    <>
      <FormControl className={clsx(classes.dropDown)} style={{ border: '2px solid #F65026', borderRadius: 25, paddingBottom: 5, paddingInline: 10 }}>
        <Select
          id="groupOrder"
          value={sortBySelected}
          className={clsx(classes.sortBySelect)}
          onChange={handleSortBySelected}
          IconComponent={() => <IoIosArrowDown size={20} className={clsx(classes.dropdownIconComponent, isRTL ? classes.left10 : classes.right10)} />}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                direction: isRTL ? 'rtl' : 'ltr'
              },
            },
          }}
        >
          {renderSortItems()}
        </Select>
      </FormControl>
      <Button className={clsx(classes.formControl, classes.dropDown, classes.controlField)} onClick={handleSortDirection} style={{ height: 40, border: '2px solid #F65026', borderRadius: 25 }}>
        {sortDirection === SortDirection.DESC ? <BiSortDown /> : <BiSortUp />}
      </Button>
    </>
  )
}


export default React.memo(Sort);