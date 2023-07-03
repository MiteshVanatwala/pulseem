import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Button, Grid, TextField } from '@material-ui/core';
import { SearchIcon } from '../../../assets/images/managment';
import { Title } from '../../../components/managment/Title';

const RecipientReport = ({ classes }: any) => {
  const { language, windowSize, rowsPerPage, isRTL } = useSelector((state: any) => state.core)
  const { t } = useTranslation();

  return (
    <DefaultScreen
      currentPage="downloadfiles"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Title Text={t('common.recipient')} Classes={classes} ShowDivider={true} />

      <Grid container spacing={2} className={classes.pt15}>
        <Grid item md={3}>
          <TextField
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            type="tel"
            variant='outlined'
            size='small'
            // value={searchRequest.FromNumber}
            // onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.Mail')}
          />
        </Grid>

        <Grid item md={2}>
          <TextField
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            type="tel"
            variant='outlined'
            size='small'
            // value={searchRequest.FromNumber}
            // onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.Cellphone')}
          />
        </Grid>

        <Grid item>
          <Button
            size='large'
            variant='contained'
            // onClick={handleSearch}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t<string>('campaigns.btnSearchResource1.Text')}
          </Button>
        </Grid>
      </Grid>
    </DefaultScreen>
  )
}

export default RecipientReport