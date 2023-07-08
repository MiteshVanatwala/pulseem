import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Table, TableBody, TableRow, TableHead, TableCell, TableContainer } from '@material-ui/core';
import { SearchIcon } from '../../../assets/images/managment';
import { Title } from '../../../components/managment/Title';
import { getRecipientsReportData } from '../../../redux/reducers/recipientsReportSlice';
import { useState } from 'react';
import { GroupsIcon } from '../../../assets/images/managment';
import { ConvertEmailStatusText, ConvertSmsStatusText } from '../../../helpers/UI/TableText';
import { PreviewIcon } from '../../../assets/images/managment';
import { FormatDate } from '../../../helpers/Export/ExportHelper';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { pulseemNewTab } from '../../../helpers/Functions/functions';
import { Preview } from '../../../components/Notifications/Preview/Preview';

const RecipientReport = ({ classes }: any) => {
  const { language, windowSize, rowsPerPage, isRTL } = useSelector((state: any) => state.core);
  const { recipientsReportData } = useSelector((state: any) => state.recipientReports)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ searchFields, setSearchFields ] = useState({
    Email: 'mitesh@pulseem.com',
    Cellphone: ''
  });
  const [ openGroupModal, toggleGroupModal ] = useState(false);
  const [ openSMSCampaignPreviewModal, toggleSMSCampaignPreviewModal ] = useState(false);
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) };
  const headCellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.tableCellRootResponsive) }
  console.log(recipientsReportData)

  const getReportData = async () => {
    const body = {
      SubAccountId: 1,
      Email: searchFields.Email,
      Cellphone: searchFields.Cellphone,
      PageIndex: 0,
      IsExport: false
    };
    // dispatch(getRecipientsReportData(body));
  }

  const renderNewsLetterTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={headCellStyle} className={clsx(classes.flex3, classes.f15)} align='center'>
            {t('campaigns.camapignName')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.f15)} align='center'>
            {t('common.Dates')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.f15)} align='center'>
            {t('common.Status')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1, classes.f15)} align='center'>
            {t('common.Opened')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1, classes.f15)} align='center' />
        </TableRow>
      </TableHead>
    )
  }

  const renderNewsLetterTableBody = () => {
    return (
      <TableBody>
        {recipientsReportData?.Campaigns?.map(renderNewsletterRow)}
        <TableRow classes={rowStyle} onClick={() => {}} className={classes.cursorPointer}>
          <TableCell className={classes.p10}>
            {t('common.loadMore')}
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  const renderNewsletterRow = (row: any) => {
    console.log(row);
    return (
      <TableRow
        key={row.CampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex3}>
            {row.Name}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
            {FormatDate(row.SendDate)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
          {t(`${ConvertEmailStatusText(row.Status)}`)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {t(`common.${row.OpeningCount > 0 ? 'Yes' : 'No'}`)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{ root: classes.tableCellRoot }}
          className={classes.flex1}>
            <img
              src={PreviewIcon}
              className={clsx(classes.managmentIcon, classes.cursorPointer)}
              onClick={() => pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${row?.CampaignID}&fromreact=true`)}
            />
        </TableCell>
      </TableRow>
    )
  }

  const renderSMSTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={headCellStyle} className={clsx(classes.flex3, classes.f15)} align='center'>
            {t('campaigns.camapignName')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.f15)} align='center'>
            {t('common.Dates')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.f15)} align='center'>
            {t('common.Status')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1, classes.f15)} align='center'>
            {t('common.Clicked')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1, classes.f15)} align='center' />
        </TableRow>
      </TableHead>
    )
  }

  const renderSMSTableBody = () => {
    return (
      <TableBody>
        {recipientsReportData?.SmsCampaigns?.map(renderSMSRow)}
        <TableRow classes={rowStyle} onClick={() => {}} className={classes.cursorPointer}>
          <TableCell className={classes.p10}>
            {t('common.loadMore')}
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  const renderSMSRow = (row: any) => {
    console.log(row);
    return (
      <TableRow
        key={row.CampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex3}>
            {row.Name}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
            {FormatDate(row.SendDate)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
          {t(`${ConvertSmsStatusText(`${row.SmsStatus}`)}`)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {t(`common.${row?.ClicksCount > 0 ? 'Yes' : 'No'}`)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{ root: classes.tableCellRoot }}
          className={classes.flex1}>
          <img
            src={PreviewIcon}
            className={clsx(classes.managmentIcon, classes.cursorPointer)}
            onClick={() => toggleSMSCampaignPreviewModal(true)}
          />
        </TableCell>
      </TableRow>
    )
  }

  const groupModal = () => {
    return (
      <BaseDialog
        classes={classes}
        // customContainerStyle={classes.beeTemplate}
        // contentStyle={classes.beeTemplate}
        open={openGroupModal}
        showDivider={false}
        onClose={() => toggleGroupModal(false)}
        onCancel={() => toggleGroupModal(false)}
        onConfirm={() => toggleGroupModal(false)}
        // reduceTitle
        title={t('common.recipientGroups')}
        showDefaultButtons={false}
        exitButton={true}
        maxHeight='50vh'
      >
        <div>
          {
            recipientsReportData?.ClientToGroups.map((group: any) => {
              return <li className={classes.p5}>{group.GroupName}</li>
            })
          }
        </div>
      </BaseDialog>
    )
  }

  const SMSCampaignPreviewModal = () => {
    return (
      <BaseDialog
        classes={classes}
        // customContainerStyle={classes.beeTemplate}
        // contentStyle={classes.beeTemplate}
        open={openSMSCampaignPreviewModal}
        showDivider={false}
        onClose={() => toggleSMSCampaignPreviewModal(false)}
        onCancel={() => toggleSMSCampaignPreviewModal(false)}
        onConfirm={() => toggleSMSCampaignPreviewModal(false)}
        // reduceTitle
        // title={t('common.recipientGroups')}
        showDefaultButtons={false}
        exitButton={true}
        maxHeight='50vh'
      >
        <Preview
          classes={classes}
          mobileFullsize={true}
          model={{}}
          ShowRedirectButton={
            false
            // data.RedirectButtonText && data.RedirectButtonText !== ''
          }
          showTitle={false}
          showID={true}
          isSMS={true}
        />
      </BaseDialog>
    )
  }
  
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
            value={searchFields.Email}
            onChange={(e) => setSearchFields({ ...searchFields, Email: e.target.value })}
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
            value={searchFields.Cellphone}
            onChange={(e) => setSearchFields({ ...searchFields, Cellphone: e.target.value })}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.Cellphone')}
          />
        </Grid>

        <Grid item>
          <Button
            size='large'
            variant='contained'
            // onClick={getReportData}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t<string>('campaigns.btnSearchResource1.Text')}
          </Button>
        </Grid>
      </Grid>

      <Box className={clsx(classes.p10, classes.mt20, classes.colorBlue, classes.bgLightGray)}>
        <Grid container spacing={2} className={clsx(classes.greyBorderAround, classes.pr25, classes.pe25)}>
          <Grid item md='auto' className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.first_name')}</div>
            <div className={classes.pt10}>{recipientsReportData.ClientFirstName}</div>
          </Grid>
          <Grid item md='auto' className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.last_name')}</div>
            <div className={classes.pt10}>{recipientsReportData.ClientLastName}</div>
          </Grid>
          <Grid item md='auto' className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.Mail')}</div>
            <div className={classes.pt10}>{recipientsReportData.ClientEmail}</div>
          </Grid>
          <Grid item md='auto' className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.cellphone')}</div>
            <div className={classes.pt10}>{recipientsReportData.ClientCellphone}</div>
          </Grid>
          <Grid item md='auto' className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.createdDate')}</div>
            <div className={classes.pt10}>{recipientsReportData.ClientCreationDate}</div>
          </Grid>
          <Grid item md='auto' className={clsx(classes.flexGrow1, classes.pt15)}>
            <img src={GroupsIcon} style={{ height: 20 }} />
            <div
              className={clsx(classes.p5, classes.dInlineBlock, classes.link)}
              style={{ verticalAlign: 'super' }}
              onClick={() => toggleGroupModal(true)}
            >
              {t('common.recipientGroups')}
            </div>
          </Grid>
          <Grid item md='auto' className={clsx(classes.flexGrow1, classes.pt20)}>
            
          </Grid>
        </Grid>
      </Box>

      <Box className={clsx(classes.p10, classes.mt10, classes.colorBlue)}>
        <Grid container spacing={2} className={clsx(classes.greyBorderAround, classes.pr25, classes.pe25)}>
          <Grid item md={2} className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.Sent')}</div>
            <div className={classes.pt10}>{recipientsReportData?.CampaignStatistics?.Sent}</div>
          </Grid>
          <Grid item md={2} className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.Opened')}</div>
            <div className={classes.pt10}>{recipientsReportData?.CampaignStatistics?.Opened}</div>
          </Grid>
          <Grid item md={2} className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.NoOpened')}</div>
            <div className={classes.pt10}>{recipientsReportData?.CampaignStatistics?.UnOpened}</div>
          </Grid>
          <Grid item md={2} className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('common.Clicks')}</div>
            <div className={classes.pt10}>{recipientsReportData?.CampaignStatistics?.Clicks}</div>
          </Grid>
          <Grid item md={4} className={classes.flexGrow1}>
            <div className={clsx(classes.bold)}>{t('recipient.Bounced')}</div>
            <div className={classes.pt10}>{recipientsReportData?.CampaignStatistics?.ErrorCount}</div>
          </Grid>
        </Grid>
      </Box>

      <Box className={clsx(classes.mt20)}>
        <Grid container>
          <Grid md={6}>
            <Box className={classes.p5}>
              <div className={classes.bold}>{t('recipient.newsletterCampaign')}</div>
              <TableContainer className={clsx(classes.tableStyle, classes.pt10)}>
                <Table className={classes.tableContainer}>
                  {windowSize !== 'xs' && renderNewsLetterTableHead()}
                  {renderNewsLetterTableBody()}
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          <Grid md={6}>
            <Box className={classes.p5}>
              <div className={classes.bold}>{t('recipient.smsCampaign')}</div>
              <TableContainer className={clsx(classes.tableStyle, classes.pt10)}>
                <Table className={classes.tableContainer}>
                  {windowSize !== 'xs' && renderSMSTableHead()}
                  {renderSMSTableBody()}
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {groupModal()}
      {SMSCampaignPreviewModal()}
    </DefaultScreen>
  )
}

export default RecipientReport