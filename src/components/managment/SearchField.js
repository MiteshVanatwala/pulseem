import React from 'react';
import { IconButton, InputAdornment, Input } from '@material-ui/core'
import { SearchIcon } from '../../assets/images/managment/index'


export const SearchField = ({
  classes,
  value,
  onChange = () => null,
  onClick = () => null,
  onKeyPress = () => null,
  placeholder = ''
}) => {
  return (
    <Input
      classes={{
        underline: classes.phoneSearchBar
      }}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      endAdornment={
        <InputAdornment position="start">
          <IconButton
            onClick={onClick}
            className={classes.phoneSearchBarIcon}>
            <SearchIcon />
          </IconButton>
        </InputAdornment>
      }>
    </Input>
  )
}