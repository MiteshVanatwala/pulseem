import React from 'react';
import { Box, FormControlLabel, Checkbox } from '@material-ui/core'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

export const RestorDialogContent = ({
  classes,
  data = [],
  currentChecked = [],
  dataIdVar = 'ID',
  dataLabeleVar = 'Name',
  onChange,
  title = 'common.noCampaignToRestore'
}) => {
  const { t } = useTranslation()

  if (!Array.isArray(data) || !data || data?.length === 0)
    return <Box
      style={{ minHeight: 200 }}
      className={classes.restorDialogContent}>{t(title)}</Box>

  return (
    <Box
      style={{ minHeight: 200 }}
      className={classes.restorDialogContent}>
      {data.map((row, index) => {
        const checked = currentChecked.includes(row[dataIdVar])
        return (
          <FormControlLabel
            key={index}
            className={classes.restoreDialogCheckBoxLable}
            control={
              <Checkbox
                checked={checked}
                onChange={onChange(row[dataIdVar])}
                className={clsx(classes.checkbox, classes.restoreDialogCheckBox)}
                size='small'
              />
            }
            label={row[dataLabeleVar]}
          />
        )
      })}
    </Box>
  )
}