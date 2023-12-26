import { createRef, useState } from 'react';
import { Typography, Grid, TextField, IconButton, Select } from '@material-ui/core'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { IoIosArrowDown } from 'react-icons/io';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { useSelector } from 'react-redux';

export const TablePagination = ({
  classes,
  rows = 0,
  page = 1,
  rowsPerPageOptions = [],
  rowsPerPage,
  onRowsPerPageChange = (val) => { },
  onPageChange = (val) => { },
  returnPageOne = true,
  style = null
}) => {
  const { t } = useTranslation()
  const { windowSize } = useSelector(state => state.core);
  const pages = Math.ceil(rows / rowsPerPage)
  const [innerPage, setPage] = useState('');
  const [isTyping, setTyping] = useState(false);
  const [rppIsOpen, setRppIsOpen] = useState(false);
  const rppSelectRef = createRef();

  const handleKeyPress = event => {
    var isNumber = /^[0-9]*$/;
    if (!event.key.match(isNumber) || event.key === 'e' || event.key === '.') {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }
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
      if (returnPageOne === true) {
        onPageChange(1)
      }
    }
  }

  const renderRowNumbers = () => {
    return rowsPerPageOptions.length > 0 ? (
      <Grid item className={clsx(classes.tablePadingtonGridItem, classes.tablePadington)}>
        <Typography>
          {t('common.rowNumber')}
        </Typography>
        <Select
          open={rppIsOpen}
          native
          className={classes.tablePaginationSelect}
          variant='standard'
          ref={rppSelectRef}
          IconComponent={() => <IoIosArrowDown className='MuiSelect-icon' onClick={() => { setRppIsOpen(!rppIsOpen) }} />}
          value={rowsPerPage}
          onFocus={() => setRppIsOpen(!rppIsOpen)}
          onChange={handleRowsPerPageChange}>
          {rowsPerPageOptions.map(option => (
            <option
              key={option.toString()}
              value={option}>
              {option}
            </option>
          ))}
        </Select>
        {/* <TextField
          select

          className={classes.tablePaginationSelect}
          variant='standard'
          SelectProps={{
            itemRef: rppSelectRef,
            native: true,
            IconComponent: () => <IoIosArrowDown className='MuiSelect-icon' onClick={() => { rppSelectRef.current?.focus() }} />
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
        </TextField> */}
      </Grid >
    ) : (<></>)
  }

  const renderPageNumbers = () => {
    const pageNum = innerPage ? innerPage.toString() : '';
    return (
      <Grid
        item
        className={clsx(classes.tablePadingtonGridItem, windowSize === "xs" ? classes.w100 : '')}
      >
        {page > 1 &&
          <IconButton
            onClick={() => {
              setTyping(false);
              onPageChange(page - 1)
            }}
            size='small'
            className={classes.tablePadingtonArrowOppisite}>
            <MdArrowBackIos />
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
          onKeyPress={handleKeyPress}
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
            <MdArrowBackIos />
          </IconButton>}
      </Grid>
    )
  }
  return (
    <Grid
      container
      justifyContent='space-between'
      className={classes.tablePadingtonGridContainer} style={style} >
      {rowsPerPageOptions.length > 0 && renderRowNumbers()}
      {renderPageNumbers()}
    </Grid>
  )
}