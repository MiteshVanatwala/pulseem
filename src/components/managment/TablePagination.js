import React, { useState } from 'react';
import { Typography, Grid, TextField, IconButton, FormControl, Select, InputLabel } from '@material-ui/core'
import { PageArrowIcon } from '../../assets/images/managment/index'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux';


export const TablePagination = ({
  classes,
  rows = 0,
  page = 1,
  rowsPerPageOptions = [],
  rowsPerPage,
  onRowsPerPageChange = () => null,
  onPageChange = () => null,
  returnPageOne = true
}) => {

  const { t } = useTranslation()
  const pages = Math.ceil(rows / rowsPerPage)
  const [innerPage, setPage] = useState('');
  const [isTyping, setTyping] = useState(false);
  const { isRTL } = useSelector(state => state.core)

  const handelPageChange = event => {
    let currentPage = parseInt(event.target.value)
    if (currentPage > pages) {
      currentPage = pages;
    }
    if (currentPage >= 1 && currentPage <= pages) {
      onPageChange(currentPage)
    }
    setTyping(true);
    setPage(currentPage)
  }

  const handleRowsPerPageChange = event => {
    const value = parseInt(event.target.value)
    if (value !== rowsPerPage) {
      onRowsPerPageChange(value)
      if (returnPageOne) {
        onPageChange(1)
      }
    }
  }

  const renderRowNumbers = () => {
    return (
      <Grid item className={classes.tablePadingtonGridItem}>
        <Typography>
          {t('common.rowNumber')}
        </Typography>
        <TextField
          select
          className={classes.tablePaginationSelect}
          variant='standard'
          SelectProps={{
            native: true,
          }}
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}>
          {rowsPerPageOptions.map(option => (
            <option
              key={option.toString()}
              value={option}>
              {option}
            </option>
          ))}
        </TextField>
      </Grid>
    )
  }

  const renderPageNumbers = () => {
    const pageNum = innerPage ? innerPage.toString() : '';
    return (
      <Grid
        item
        className={classes.tablePadingtonGridItem}>
        {page > 1 &&
          <IconButton
            onClick={() => {
              setTyping(false);
              onPageChange(page - 1)
            }}
            size='small'
            className={classes.tablePadingtonArrowOppisite}>
            <PageArrowIcon />
          </IconButton>}
        <Typography>
          {t('common.page')}
        </Typography>
        <TextField
          dir='ltr'
          error={isTyping && innerPage > page}
          type="number"
          value={isTyping ? pageNum : page.toString()}
          onBlur={() => setTyping(false)}
          onChange={handelPageChange}
          variant='outlined'
          margin='none'
          size='small'
          className={classes.tablePadingtonTextFeild}
        />
        <Typography>
          {t('common.outOf')} {pages === 0 ? 1 : pages}
        </Typography>
        {page < pages &&
          <IconButton
            onClick={() => {
              setTyping(false);
              onPageChange(page + 1)
            }}
            size='small'
            className={classes.tablePadingtonArrow}>
            <PageArrowIcon />
          </IconButton>}
      </Grid>
    )
  }
  return (
    <Grid
      container
      justifyContent='space-between'
      className={classes.tablePadingtonGridContainer} >
      {renderRowNumbers()}
      {renderPageNumbers()}
    </Grid>
  )
}