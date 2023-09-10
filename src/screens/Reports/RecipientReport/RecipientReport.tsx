import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Typography } from '@material-ui/core';
import { Title } from '../../../components/managment/Title';
import { getRecipientsReportData } from '../../../redux/reducers/recipientsReportSlice';
import { useEffect, useState } from 'react';
import { GroupsIcon } from '../../../assets/images/managment';
import { ConvertColorStatus, ConvertNewsletterStatusText, ConvertSmsStatusText } from '../../../helpers/UI/TableText';
import { PreviewIcon } from '../../../assets/images/managment';
import { FormatDate } from '../../../helpers/Export/ExportHelper';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { RandomID, pulseemNewTab } from '../../../helpers/Functions/functions';
import { Preview } from '../../../components/Notifications/Preview/Preview.js';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import SummaryLine from './SummaryLine';
import moment from 'moment';
import { resetRecipientReportData } from "../../../redux/reducers/recipientsReportSlice";
import { ManagmentIcon, TablePagination } from '../../../components/managment';
import { getSmsByID } from '../../../redux/reducers/smsSlice';
import { Loader } from '../../../components/Loader/Loader';

const RecipientReport = ({ classes }: any) => {
  const { windowSize, isRTL } = useSelector((state: any) => state.core);
  const { recipientsReportData } = useSelector((state: any) => state.recipientReports)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [openGroupModal, toggleGroupModal] = useState(false);
  const [smsPreviewModel, setSmsPreviewModel] = useState<any>(null);
  const [previewCampaign, setPreviewCampaign] = useState<any>({ isSms: false, campaignId: null, show: false });
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const headCellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }

  type reportRequest = {
    Email: string;
    Cellphone: string;
    PageIndex: number;
    SmsPageIndex: number;
    WhatsappPageIndex: number;
    IsExport: boolean;
  };

  const [filterRequest, setFilterRequest] = useState<reportRequest>({
    Email: '',
    Cellphone: '',
    PageIndex: 1,
    SmsPageIndex: 1,
    WhatsappPageIndex: 1,
    IsExport: false
  });

  const getReportData = async () => {
    setShowLoader(true);
    //@ts-ignore
    await dispatch(getRecipientsReportData(filterRequest));
    setShowLoader(false);
  }


  const resetFilter = () => {
    setFilterRequest({
      IsExport: false,
      PageIndex: 1,
      SmsPageIndex: 1,
      WhatsappPageIndex: 1,
      Email: '',
      Cellphone: ''
    })
  }

  useEffect(() => {
    if (!isSearching && (filterRequest.Email !== '' || filterRequest.Cellphone !== '')) {
      dispatch(resetRecipientReportData());
      resetFilter();
    }
    if (isSearching) {
      getReportData();
    }
  }, [isSearching])

  useEffect(() => {
    getReportData();
  }, [filterRequest.PageIndex, filterRequest.SmsPageIndex, filterRequest.WhatsappPageIndex]);

  const renderNewsLetterTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={headCellStyle} className={clsx(classes.flex3, classes.noPonSmallScreen, classes.f16)} align='center'>
            {t('campaigns.camapignName')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.noPonSmallScreen, classes.f16)} align='center'>
            {t('common.Dates')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.f16)} align='center'>
            {t('common.Status')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1, classes.f16)} align='center'>
            {t('common.Opened')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1, classes.f16)} align='center' />
        </TableRow>
      </TableHead>
    )
  }

  const renderNewsletterPagination = () => {
    return (
      <Box className={clsx(classes.flexJustifyCenter, classes.paddingInline25)}>
        <TablePagination
          style={{ 'justifyContent': 'center' } as any}
          classes={classes}
          rows={recipientsReportData?.CampaignStatistics?.Sent ?? 0}
          rowsPerPage={5}
          page={filterRequest.PageIndex}
          onPageChange={e => setFilterRequest({ ...filterRequest, PageIndex: e })}
        />
      </Box>
    )
  }
  const renderSmsPagination = () => {
    return (
      <Box className={clsx(classes.flexJustifyCenter, classes.paddingInline25)}>
        <TablePagination
          style={{ 'justifyContent': 'center' } as any}
          classes={classes}
          rows={recipientsReportData?.SmsCampaignStatistics?.Sent ?? 0}
          rowsPerPage={5}
          page={filterRequest.SmsPageIndex}
          onPageChange={e => setFilterRequest({ ...filterRequest, SmsPageIndex: e })}
        />
      </Box>
    )
  }
  const renderWhasappPagination = () => {
    return (
      <Box className={clsx(classes.flexJustifyCenter, classes.paddingInline25)}>
        <TablePagination
          style={{ 'justifyContent': 'center' } as any}
          classes={classes}
          rows={recipientsReportData?.WhatsappCampaignStatistics?.Sent ?? 0}
          rowsPerPage={5}
          page={filterRequest.WhatsappPageIndex}
          onPageChange={e => setFilterRequest({ ...filterRequest, WhatsappPageIndex: e })}
        />
      </Box>
    )
  }

  const renderNewsLetterTableBody = () => {
    return (
      <TableBody>
        {recipientsReportData?.campaigns?.length === 0 ? (
          <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
            <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
              <Grid item md={6} className={classes.flexGrow1}>{t('common.NoDataTryFilter')}</Grid>
            </Grid>
          </Box>
        ) : (
          <>
            <>{recipientsReportData?.Campaigns?.map(renderNewsletterRow)}</>
            {renderNewsletterPagination()}
          </>
        )}
      </TableBody>
    )
  }

  const renderNewsletterRow = (row: any) => {
    const statusText = ConvertNewsletterStatusText(row.Status);

    return (
      <TableRow
        key={RandomID()}
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
          <Typography className={clsx(
            classes.middleText,
            classes.recipientsStatus,
            {
              [classes.recipientsStatusCreated]: row?.Status === 1,
              [classes.recipientsStatusSent]: row?.Status === 4,
              [classes.recipientsStatusSending]: row?.Status === 2,
              [classes.recipientsStatusCanceled]: row?.Status === 5
            }
          )}>
            {t(statusText)}
          </Typography>
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {t(`common.${row.OpeningCount > 0 ? 'Yes' : 'No'}`)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          className={classes.flex1}>
          <ManagmentIcon
            // onClick={}
            classes={classes}
            icon={null}
            uIcon={<PreviewIcon width={18} height={20} className={'rowIcon'} />}
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

  const renderTableBody = (campaignType: string) => {
    return (
      <TableBody>
        {(campaignType === 'sms' && !recipientsReportData?.SmsCampaigns) || (campaignType === 'whatsapp' && (!recipientsReportData?.WhatsappCampaigns)) ? (
          <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
            <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
              <Grid item md={6} className={classes.flexGrow1}>{t('common.NoDataTryFilter')}</Grid>
            </Grid>
          </Box>
        ) : (
          <>
            <>{campaignType === 'sms' ? recipientsReportData?.SmsCampaigns?.map(renderRow) : recipientsReportData?.WhatsappCampaigns?.map(renderRow)}</>
            <>{campaignType === 'sms' ? renderSmsPagination() : renderWhasappPagination()}</>
          </>
        )}
      </TableBody>
    )
  }

  const renderStatusCell = (status: number) => {
    const statuses = {
      1: 'common.Created',
      2: 'common.Sending',
      3: 'campaigns.Stopped',
      4: 'common.Sent',
      5: 'campaigns.Canceled',
      6: 'campaigns.Optin',
      7: 'campaigns.Approve'
    } as any;

    return (
      <Typography className={clsx(classes.middleText, classes.recipientsStatus,
        {
          [classes.recipientsStatusCreated]: status === 1,
          [classes.recipientsStatusSent]: status === 4,
          [classes.recipientsStatusSending]: status === 2,
          [classes.recipientsStatusCanceled]: status === 5
        }
      )}
      >
        {t(statuses[status])}
      </Typography>
    )
  }
  const renderRow = (row: any) => {
    return (
      <TableRow
        key={RandomID()}
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
          {renderStatusCell(row.SmsStatus)}
          {/* {t(`${ConvertSmsStatusText(`${row.SmsStatus}`)}`)} */}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {t(`common.${row?.ClicksCount > 0 ? 'Yes' : 'No'}`)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          className={classes.flex1}>
          <ManagmentIcon
            classes={classes}
            icon={null}
            uIcon={<PreviewIcon width={18} height={20} className={'rowIcon'} />}
          />
        </TableCell>
      </TableRow>
    )
  }

  const groupModal = () => {
    return (
      <BaseDialog
        classes={classes}
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
            recipientsReportData?.ClientToGroups?.map((group: any) => {
              return <li className={classes.p5}>{group.GroupName}</li>
            })
          }
        </div>
      </BaseDialog>
    )
  }

  // const SMSCampaignPreviewModal = async () => {
  //   const sms = await dispatch({ type: "getSmsByID", payload: previewCampaign.campaignId });
  //   setSmsPreviewModel(sms?.payload);
  //   return (
  //     <BaseDialog
  //       classes={classes}
  //       // customContainerStyle={classes.beeTemplate}
  //       // contentStyle={classes.beeTemplate}
  //       open={openSMSCampaignPreviewModal}
  //       showDivider={false}
  //       onClose={() => toggleSMSCampaignPreviewModal(false)}
  //       onCancel={() => toggleSMSCampaignPreviewModal(false)}
  //       onConfirm={() => toggleSMSCampaignPreviewModal(false)}
  //       // reduceTitle
  //       // title={t('common.recipientGroups')}
  //       showDefaultButtons={false}
  //       exitButton={true}
  //       maxHeight='50vh'
  //     >
  //       <Preview
  //         classes={classes}
  //         mobileFullsize={true}
  //         model={{}}
  //         ShowRedirectButton={
  //           false
  //           // data.RedirectButtonText && data.RedirectButtonText !== ''
  //         }
  //         showTitle={false}
  //         showID={true}
  //         isSMS={true}
  //       />
  //     </BaseDialog>
  //   )
  // }

  const renderSearchSection = () => {
    return <Grid container spacing={2}
      className={clsx(classes.lineTopMarging, 'searchLine')}>
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
          value={filterRequest.Email}
          onChange={(e) => {
            setFilterRequest({ ...filterRequest, Email: e.target.value })
            setIsSearching(false);
          }}
          onKeyDown={(e) => {
            if (e?.keyCode === 13) {
              setIsSearching(true);
            }
          }}
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
          value={filterRequest.Cellphone}
          onChange={(e) => {
            setFilterRequest({ ...filterRequest, Cellphone: e.target.value })
            setIsSearching(false);
          }}
          onKeyDown={(e) => {
            if (e?.keyCode === 13) {
              setIsSearching(true);
            }
          }}
          className={clsx(classes.textField, classes.minWidth252)}
          placeholder={t('common.Cellphone')}
        />
      </Grid>

      <Grid item md={3}>
        <Button
          onClick={() => {
            setIsSearching(true);
          }}
          className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
          {t<string>('campaigns.btnSearchResource1.Text')}
        </Button>
        {isSearching &&
          <Button
            onClick={() => {
              setIsSearching(false);
            }}
            className={clsx(classes.btn, classes.btnRounded, classes.ml15)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        }
      </Grid>

    </Grid>
  }

  const renderClientDetails = () => {
    const dateTimeFormat = 'DD/MM/YYYY, HH:mm a';
    return <Grid container spacing={2} className={clsx(classes.mgmtTitleContainer, classes.pr25, classes.pe25)}>
      <Grid item md='auto' className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.first_name')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientFirstName}</div>
      </Grid>
      <Grid item md='auto' className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.last_name')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientLastName}</div>
      </Grid>
      <Grid item md='auto' className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.Mail')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientEmail}</div>
      </Grid>
      <Grid item md='auto' className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.cellphone')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientCellphone}</div>
      </Grid>
      <Grid item md='auto' className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.createdDate')}</div>
        <div className={classes.pt10}>{moment(recipientsReportData?.ClientCreationDate).format(dateTimeFormat)}</div>
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
      <Grid item md='auto' className={clsx(classes.flexGrow1, classes.pt20)}></Grid>
    </Grid>
  }

  return (
    <DefaultScreen
      currentPage="downloadfiles"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={'topSection'}>
        <Title Text={t('common.recipient')} classes={classes} />
        {renderSearchSection()}
      </Box>
      <Loader isOpen={showLoader} />
      {recipientsReportData?.ClientID > 0 && <>
        <Box className={clsx(classes.p10, classes.mt20, classes.colorBlue, classes.bgLightGray)}>
          {renderClientDetails()}
        </Box>
        <Box className={clsx(classes.mt20)}>
          <Grid container>
            <Grid md={6}>
              <Box className={classes.p5}>
                <Title Text={t('recipient.newsletterCampaign')} classes={classes} isIcon={false} />
                <SummaryLine classes={classes} Stats={recipientsReportData?.CampaignStatistics} CampaignType={'email'} />
                <TableContainer className={clsx(classes.tableStyle)}>
                  <Table className={classes.tableContainer}>
                    {windowSize !== 'xs' && renderNewsLetterTableHead()}
                    {renderNewsLetterTableBody()}
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
            <Grid md={6}>
              <Box className={classes.p5}>
                <Title Text={t('recipient.smsCampaign')} classes={classes} isIcon={false} />
                <SummaryLine classes={classes} Stats={recipientsReportData?.SmsCampaignStatistics} CampaignType={'sms'} />
                <TableContainer className={clsx(classes.tableStyle)}>
                  <Table className={classes.tableContainer}>
                    {windowSize !== 'xs' && renderSMSTableHead()}
                    {renderTableBody('sms')}
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
            <Grid md={12}>
              <Box className={classes.p5}>
                <Title Text={t('recipient.whatsappCampaign')} classes={classes} isIcon={false} />
                <SummaryLine classes={classes}
                  Stats={recipientsReportData?.WhatsappCampaignStatistics?.Sent > 0 ? recipientsReportData?.WhatsappCampaignStatistics : null}
                  CampaignType={'whatsapp'} />
                <TableContainer className={clsx(classes.tableStyle)}>
                  <Table className={classes.tableContainer}>
                    {windowSize !== 'xs' && renderSMSTableHead()}
                    {renderTableBody('whatsapp')}
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </>}

      {groupModal()}
      {/* {previewCampaign.show && previewSmsCampaign()} */}
    </DefaultScreen>
  )
}

export default RecipientReport