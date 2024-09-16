import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import uniqid from 'uniqid';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import { Title } from '../../../components/managment/Title';
import { downloadRecipientsReportData, getRecipientsReportData } from '../../../redux/reducers/recipientsReportSlice';
import { useEffect, useState } from 'react';
import { GroupsIcon } from '../../../assets/images/managment';
import { ConvertClientStatus, ConvertNewsletterStatusText, ConvertSmsReceipientStatusText, SourceType } from '../../../helpers/UI/TableText';
import { PreviewIcon } from '../../../assets/images/managment';
import { FormatDate } from '../../../helpers/Export/ExportHelper';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { RandomID } from '../../../helpers/Functions/functions';
import { Preview } from '../../../components/Notifications/Preview/Preview.js';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import SummaryLine from './SummaryLine';
import moment from 'moment';
import { resetRecipientReportData } from "../../../redux/reducers/recipientsReportSlice";
import { ManagmentIcon, TablePagination } from '../../../components/managment';
import { getSmsByID } from '../../../redux/reducers/smsSlice';
import { Loader } from '../../../components/Loader/Loader';
import WhatsappMobilePreview from '../../Whatsapp/Editor/Components/WhatsappMobilePreview';
import { buttonsDataProps, callToActionProps, quickReplyButtonProps, savedTemplateCallToActionProps, savedTemplateCardProps, savedTemplateDataProps, savedTemplateMediaProps, savedTemplateQuickReplyProps, savedTemplateTextProps, templateDataProps, templateListAPIProps, toastProps } from '../../Whatsapp/Editor/Types/WhatsappCreator.types';
import { getSavedTemplatesPreviewById } from '../../../redux/reducers/whatsappSlice';
import { apiStatus, resetToastData } from '../../Whatsapp/Constant';
import Toast from '../../../components/Toast/Toast.component';
import { getCampaignInfo } from '../../../redux/reducers/newsletterSlice';
import { EmailPreview } from '../../../components/EmailPreview';
import { actionURL } from '../../../config';
import { IsValidEmail, IsValidPhone } from '../../../helpers/Utils/Validations';
import { FaEye, FaFileExcel } from 'react-icons/fa';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { DateFormats } from '../../../helpers/Constants';

const RecipientReport = ({ classes }: any) => {
  const { windowSize, isRTL } = useSelector((state: any) => state.core);
  const { recipientsReportData } = useSelector((state: any) => state.recipientReports)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [openGroupModal, toggleGroupModal] = useState(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [isRecipientSearched, setIsRecipientSearched] = useState<boolean>(false);
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const headCellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) };
  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any
  } | null>(null);
  const [toastMessage, setToastMessage] =
    useState<toastProps['SUCCESS']>(resetToastData);
  const ToastMessages = useSelector(
    (state: { whatsapp: { ToastMessages: toastProps } }) => state.whatsapp.ToastMessages
  );
  const [buttonType, setButtonType] = useState<string>('');
  const [fileData, setFileData] = useState<{
    fileLink: string;
    fileType: string;
  }>({
    fileLink: '',
    fileType: '',
  });
  const [templateData, setTemplateData] = useState<templateDataProps>({
    templateText: '',
    templateButtons: [],
  });

  let updatedTemplateData: templateDataProps = {
    templateText: '',
    templateButtons: [],
  };
  let updatedButtonType: string = '';
  let updatedFileData: {
    fileLink: string;
    fileType: string;
  } = {
    fileLink: '',
    fileType: '',
  };

  type reportRequest = {
    Email: string;
    Cellphone: string;
    PageIndex: number;
    SmsPageIndex: number;
    WhatsappPageIndex: number;
    IsExport: boolean;
    ArchiveAccess?: boolean
  };

  const [filterRequest, setFilterRequest] = useState<reportRequest>({
    Email: '',
    Cellphone: '',
    PageIndex: 1,
    SmsPageIndex: 1,
    WhatsappPageIndex: 1,
    IsExport: false,
    ArchiveAccess: false
  });

  const [errors, setErrors] = useState<any>({
    Email: '',
    Cellphone: '',
  });

  const getReportData = async () => {
    const formErrors = {
      Email: filterRequest.Email && (IsValidEmail(filterRequest.Email) ? '' : t('recipient.errors.email')),
      Cellphone: filterRequest.Cellphone && (IsValidPhone(filterRequest.Cellphone) ? '' : t('recipient.errors.cellPhone'))
    };

    if ((filterRequest.Email && !formErrors.Email) || (filterRequest.Cellphone && !formErrors.Cellphone)) {
      setIsSearching(true);
      setShowLoader(true);
      setIsRecipientSearched(true);
      //@ts-ignore
      await dispatch(getRecipientsReportData(filterRequest));
      setShowLoader(false);
    }
    setErrors(formErrors);
  }

  const downloadRecipientReport = async (format: string) => {
    setDialogType(null);
    setShowLoader(true);
    //@ts-ignore
    const reportData = await dispatch(downloadRecipientsReportData({
      ...filterRequest,
      IsExport: true
    })) as any;

    const {
      Campaigns = [],
      SmsCampaigns = [],
      WhatsappCampaigns = []
    } = reportData?.payload?.Data;

    const CampaignsLength = Campaigns?.length || 0;
    const SmsCampaignsLength = SmsCampaigns?.length || 0;
    const WhatsappCampaignLength = WhatsappCampaigns?.length || 0;
    const exportData = [];

    if (CampaignsLength || SmsCampaignsLength || WhatsappCampaignLength) {
      for (let ind = 0, len = Math.max(CampaignsLength, SmsCampaignsLength, WhatsappCampaignLength); ind < len; ind++) {
        exportData.push({
          [`${t('common.newsletterCampaignName')}`]: ind < CampaignsLength ? `${Campaigns[ind]['Name']}` : '',
          [`${t('common.newsletterCampaignDates')}`]: ind < CampaignsLength ? FormatDate(Campaigns[ind]['SendDate']) : '',
          [`${t('common.newsletterCampaignStatus')}`]: ind < CampaignsLength ? t(ConvertNewsletterStatusText(Campaigns[ind]['Status'])) : '',
          [`${t('common.newsletterCampaignOpened')}`]: ind < CampaignsLength ? t(`common.${Campaigns[ind]['OpeningCount'] > 0 ? 'Yes' : 'No'}`) : '',
          "|": "|",
          [`${t('common.smsCampaignName')}`]: ind < SmsCampaignsLength ? `${SmsCampaigns[ind]['Name']}` : '',
          [`${t('common.smsCampaignDates')}`]: ind < SmsCampaignsLength ? FormatDate(SmsCampaigns[ind]['SendDate']) : '',
          [`${t('common.smsCampaignStatus')}`]: ind < SmsCampaignsLength ? renderSMSStatus(SmsCampaigns[ind]['SmsStatus']) : '',
          [`${t('common.smsCampaignClicked')}`]: ind < SmsCampaignsLength ? t(`common.${SmsCampaigns[ind]['ClicksCount'] > 0 ? 'Yes' : 'No'}`) : '',
          "||": "|",
          [`${t('common.whatsappCampaignName')}`]: ind < WhatsappCampaignLength ? `${WhatsappCampaigns[ind]['Name']}` : '',
          [`${t('common.whatsappCampaignDates')}`]: ind < WhatsappCampaignLength ? FormatDate(WhatsappCampaigns[ind]['SendDate']) : '',
          [`${t('common.whatsappCampaignStatus')}`]: ind < WhatsappCampaignLength ? renderSMSStatus(WhatsappCampaigns[ind]['SmsStatus']) : '',
          [`${t('common.whatsappCampaignClicked')}`]: ind < WhatsappCampaignLength ? t(`common.${WhatsappCampaigns[ind]['ClicksCount'] > 0 ? 'Yes' : 'No'}`) : ''
        })
      }

      try {
        await ExportFile({
          data: exportData,
          fileName: 'RecipientReport',
          exportType: format,
          fields: [
            t('common.newsletterCampaignName'),
            t('common.newsletterCampaignDates'),
            t('common.newsletterCampaignStatus'),
            t('common.newsletterCampaignOpened'),
            "|",
            t('common.smsCampaignName'),
            t('common.smsCampaignDates'),
            t('common.smsCampaignStatus'),
            t('common.smsCampaignClicked'),
            "||",
            t('common.whatsappCampaignName'),
            t('common.whatsappCampaignDates'),
            t('common.whatsappCampaignStatus'),
            t('common.whatsappCampaignClicked'),
          ]
        });
      } catch (error) {
        setToastMessage({
          ...ToastMessages.ERROR,
          message: t('common.fileDownloadError'),
        })
      }
      finally {
        setShowLoader(false);
      }
    } else {
      setShowLoader(false);
      setToastMessage({
        ...ToastMessages.ERROR,
        message: t('common.NoData'),
      })
    }
  }


  const resetFilter = () => {
    setIsSearching(false);
    setFilterRequest({
      IsExport: false,
      PageIndex: 1,
      SmsPageIndex: 1,
      WhatsappPageIndex: 1,
      Email: '',
      Cellphone: '',
      ArchiveAccess: false
    })
    setErrors({
      Email: '',
      Cellphone: '',
    })
  }

  useEffect(() => {
    getReportData();
  }, [filterRequest.PageIndex, filterRequest.SmsPageIndex, filterRequest.WhatsappPageIndex, filterRequest.ArchiveAccess]);

  const renderNewsLetterTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={headCellStyle} className={clsx(classes.flex3, classes.noPonSmallScreen)} align='center'>
            {t('campaigns.camapignName')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.noPonSmallScreen)} align='center'>
            {t('report.date')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2)} align='center'>
            {t('common.Status')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1)} align='center'>
            {t('common.opens')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1)} align='center' />
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
        {!recipientsReportData?.Campaigns ? (
          <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
            <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
              <Grid item md={6} className={classes.flexGrow1}>{t('common.NoDataTryFilter')}</Grid>
            </Grid>
          </Box>
        ) : (
          <>
            <>{recipientsReportData?.Campaigns?.map(windowSize === "xs" ? renderNewsletterPhoneRow : renderNewsletterRow)}</>
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
          className={clsx(classes.flex3, classes.f15, classes.reipientReportCampaignName)}>
          {row.Name}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex2, classes.f15)}>
          {FormatDate(row.SendDate)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
          <Typography className={clsx(
            classes.middleText,
            classes.recipientsStatus,
            classes.f15,
            {
              [classes.recipientsStatusSent]: row?.Status === 0,
              [classes.recipientsStatusCanceled]: row?.Status > 0
            }
          )}>
            {t(statusText)}
          </Typography>
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex1, classes.f15)}>
          {t(`common.${row.OpeningCount > 0 ? 'Yes' : 'No'}`)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          className={clsx(classes.flex1, classes.f15)}>
          <ManagmentIcon
            onClick={async () => {
              // pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${row.CampaignID}&fromreact=true`)
              setShowLoader(true);
              const response: any = await dispatch(getCampaignInfo(row.CampaignID));
              setShowLoader(false);
              setDialogType({
                type: 'newsletterpreview',
                data: row.CampaignID
              })
            }}
            classes={classes}
            icon={null}
            uIcon={<PreviewIcon width={18} height={20} className={'rowIcon'} />}
          />
        </TableCell>
      </TableRow>
    )
  }

  const renderNewsletterPhoneRow = (row: any) => {
    const statusText = ConvertNewsletterStatusText(row.Status);

    return (
      <TableRow key={RandomID()} component="div" classes={rowStyle}>
        <TableCell
          style={{ flex: 1 }}
          classes={{ root: classes.tableCellRoot }}
          className={classes.p20}
        >
          <Box className={classes.spaceBetween}>
            <Box className={classes.inlineGrid}>
              <Typography className={classes.bold}>{t('campaigns.camapignName')}</Typography>
              {row.Name}
            </Box>
            <Box>
              <Typography className={classes.bold}>{t('report.date')}</Typography>
              {FormatDate(row.SendDate)}
            </Box>
          </Box>
          <Box className={clsx(classes.mt1)}>
            <Box className={classes.flex}>
              <Box className={clsx(classes.flex6)}>
                <Typography className={classes.bold}>{t('common.Status')}</Typography>
                <Typography className={clsx(
                  classes.middleText,
                  classes.recipientsStatus,
                  classes.f15,
                  {
                    [classes.recipientsStatusCreated]: row?.Status === 1,
                    [classes.recipientsStatusSent]: row?.Status === 4,
                    [classes.recipientsStatusSending]: row?.Status === 2,
                    [classes.recipientsStatusCanceled]: row?.Status === 5
                  }
                )}>
                  {t(statusText)}
                </Typography>
              </Box>
              <Box className={clsx(classes.flex4)}>
                <Typography className={classes.bold}>{t('common.Opened')}</Typography>
                {t(`common.${row.OpeningCount > 0 ? 'Yes' : 'No'}`)}
              </Box>
              <Box className={clsx(classes.flex4, classes.pt5, classes.textRight)}>
                <ManagmentIcon
                  onClick={async () => {
                    setShowLoader(true);
                    const response: any = await dispatch(getCampaignInfo(row.CampaignID));
                    setShowLoader(false);
                    setDialogType({
                      type: 'newsletterpreview',
                      data: row.CampaignID
                    })
                  }}
                  classes={classes}
                  icon={null}
                  uIcon={<PreviewIcon width={18} height={20} className={'rowIcon'} style={{ paddingTop: 10 }} />}
                />
              </Box>
            </Box>
          </Box>
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
            {t('report.date')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex2, classes.f15)} align='center'>
            {t('common.Status')}
          </TableCell>

          <TableCell classes={headCellStyle} className={clsx(classes.flex1, classes.f15)} align='center'>
            {t('common.clicks')}
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
            {campaignType === 'sms' ? recipientsReportData?.SmsCampaigns?.map((row: any) => windowSize == "xs" ? renderPhoneRow(row, campaignType) : renderRow(row, campaignType)) : recipientsReportData?.WhatsappCampaigns?.map((row: any) => windowSize == "xs" ? renderPhoneRow(row, campaignType) : renderRow(row, campaignType))}
            {campaignType === 'sms' ? renderSmsPagination() : renderWhasappPagination()}
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

  const renderSMSStatus = (status: number) => {
    const statuses = {
      1: 'common.Created',
      2: 'common.Sending',
      3: 'campaigns.Stopped',
      4: 'common.Sent',
      5: 'campaigns.Canceled',
      6: 'campaigns.Optin',
      7: 'campaigns.Approve'
    } as any;

    return t(statuses[status]);
  }


  // Whatsapp
  const onSavedTemplateChange = (templateData: savedTemplateDataProps) => {
    if (templateData) {
      setUpdatedTemplateData(templateData);
    }
    setFileData(updatedFileData);
    setButtonType(updatedButtonType);
    setTemplateData(updatedTemplateData);
  };

  const setUpdatedTemplateData = (templateData: savedTemplateDataProps) => {
    if ('quick-reply' in templateData?.types) {
      saveQuickreplyTemplate(templateData);
    }
    if ('call-to-action' in templateData?.types) {
      saveCallToActionTemplate(templateData);
    } else if ('card' in templateData?.types) {
      saveCardTemplate(templateData);
    } else if ('media' in templateData?.types) {
      saveMediaTemplate(templateData);
    } else if ('text' in templateData?.types) {
      saveTextTemplate(templateData);
    }
  };

  const saveQuickreplyTemplate = (templateData: savedTemplateDataProps) => {
    const quickReplyData: savedTemplateQuickReplyProps =
      templateData?.types['quick-reply'];
    updatedButtonType = 'quickReply';
    const buttonData = setButtonsData('quickReply', quickReplyData?.actions);
    updatedTemplateData.templateText = quickReplyData?.body;
    updatedTemplateData.templateButtons = buttonData ? buttonData : [];
  };

  const saveCallToActionTemplate = (templateData: savedTemplateDataProps) => {
    const callToActionData: savedTemplateCallToActionProps =
      templateData?.types['call-to-action'];
    updatedButtonType = 'callToAction';
    const buttonData = setButtonsData(
      'callToAction',
      callToActionData?.actions
    );
    updatedTemplateData.templateText = callToActionData?.body;
    updatedTemplateData.templateButtons = buttonData ? buttonData : [];
  };

  const saveCardTemplate = (templateData: savedTemplateDataProps) => {
    const cardData: savedTemplateCardProps = templateData?.types['card'];
    updatedTemplateData.templateText = cardData?.title;
    if (cardData?.actions?.length > 0) {
      if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
        updatedButtonType = 'callToAction';
        const buttonData = setButtonsData('callToAction', cardData?.actions);
        updatedTemplateData.templateButtons = buttonData ? buttonData : [];
      } else {
        updatedButtonType = 'quickReply';
        const buttonData = setButtonsData('quickReply', cardData?.actions);
        updatedTemplateData.templateButtons = buttonData ? buttonData : [];
      }
    }
    if (cardData?.media?.length > 0) {
      updatedFileData.fileLink = cardData?.media[0];
    }
  };

  const saveMediaTemplate = (templateData: savedTemplateDataProps) => {
    const mediaData: savedTemplateMediaProps = templateData?.types['media'];
    updatedTemplateData.templateText = mediaData?.body;
    if (mediaData?.media?.length > 0) {
      updatedFileData.fileLink = mediaData?.media[0];
      updatedFileData.fileType = mediaData?.media_type;
    }
  };

  const saveTextTemplate = (templateData: savedTemplateDataProps) => {
    const textData: savedTemplateTextProps = templateData?.types['text'];
    updatedTemplateData.templateText = textData?.body;
  };

  const setButtonsData = (buttonType: string, data: buttonsDataProps[]) => {
    let buttonData: quickReplyButtonProps[] | callToActionProps = [];
    switch (buttonType) {
      case 'quickReply':
        buttonData = data?.map((button: buttonsDataProps) => {
          return {
            id: uniqid(),
            typeOfAction: '',
            fields: [
              {
                fieldName: 'whatsapp.websiteButtonText',
                type: 'text',
                placeholder: 'whatsapp.websiteButtonTextPlaceholder',
                value: button.title,
              },
            ],
          };
        });
        return buttonData ? buttonData : [];
      case 'callToAction':
        buttonData = data?.map((button: buttonsDataProps) => {
          if (button?.type === 'PHONE_NUMBER') {
            return {
              id: uniqid(),
              typeOfAction: 'phonenumber',
              fields: [
                {
                  fieldName: 'whatsapp.phoneButtonText',
                  type: 'text',
                  placeholder: 'whatsapp.phoneButtonTextPlaceholder',
                  value: button.title,
                },
                {
                  fieldName: 'whatsapp.country',
                  type: 'select',
                  placeholder: 'Select Your Country Code',
                  value: '+972',
                },
                {
                  fieldName: 'whatsapp.phoneNumber',
                  type: 'tel',
                  placeholder: 'whatsapp.phoneNumberPlaceholder',
                  value: button.phone,
                },
              ],
            };
          } else {
            return {
              id: uniqid(),
              typeOfAction: 'website',
              fields: [
                {
                  fieldName: 'whatsapp.websiteButtonText',
                  type: 'text',
                  placeholder: 'whatsapp.websiteButtonTextPlaceholder',
                  value: button.title,
                },
                {
                  fieldName: 'whatsapp.websiteURL',
                  type: 'text',
                  placeholder: 'whatsapp.websiteURLPlaceholder',
                  value: button.url,
                },
              ],
            };
          }
        });
        return buttonData ? buttonData : [];
    }
  };

  const renderRow = (row: any, campaignType: string) => {
    return (
      <TableRow
        key={RandomID()}
        classes={rowStyle}>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex3, classes.f15, classes.reipientReportCampaignName)}>
          {row.Name}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex2, classes.f15)}>
          {FormatDate(row.SendDate)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex2, classes.f15,
            {
              [classes.recipientsStatus]: row?.SmsStatus === -1,
              [classes.statusPending]: row?.SmsStatus === 1,
              [classes.recipientsStatusSending]: row?.SmsStatus === 2,
              [classes.recipientsStatusSent]: row?.SmsStatus === 3,
              [classes.statusFailed]: row?.SmsStatus === 4 || row?.SmsStatus === 5,
              [classes.statusStopped]: row?.SmsStatus === 6,
              [classes.recipientsStatusCanceled]: row?.SmsStatus > 6
            }
          )}>
          {t(`${ConvertSmsReceipientStatusText(`${row.SmsStatus}`)}`)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex1, classes.f15)}>
          {t(`common.${row?.ClicksCount > 0 ? 'Yes' : 'No'}`)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          className={classes.flex1}>
          <ManagmentIcon
            classes={classes}
            icon={null}
            uIcon={<PreviewIcon width={18} height={20} className={'rowIcon'} />}
            onClick={async () => {
              if (campaignType === 'sms') {
                setShowLoader(true);
                const sms: any = await dispatch(getSmsByID(row.SMSCampaignID));
                setShowLoader(false);
                setDialogType({
                  type: 'preview',
                  data: sms?.payload
                })
              } else if (campaignType === 'whatsapp') {
                if (row.TemplateID) {
                  setShowLoader(true);
                  const templateData: templateListAPIProps = await dispatch<any>(
                    getSavedTemplatesPreviewById({
                      templateId: row.TemplateID,
                    })
                  );
                  setShowLoader(false);
                  if (templateData.payload.Status === apiStatus.SUCCESS) {
                    const templates = templateData.payload?.Data?.Items;
                    if (templates && templates?.length > 0) {
                      const templateData: any = templates[0];
                      onSavedTemplateChange(templateData?.Data);
                      setDialogType({
                        type: 'whatsapp',
                        data: ''
                      })
                    }
                  } else {
                    templateData?.payload?.Message
                      ? setToastMessage({
                        ...ToastMessages.ERROR,
                        message: templateData?.payload?.Message,
                      })
                      : setToastMessage(ToastMessages.ERROR);
                  }
                }
              }
            }}
          />
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row: any, campaignType: string) => {
    return (
      <TableRow key={RandomID()} component="div" classes={rowStyle}>
        <TableCell
          style={{ flex: 1 }}
          classes={{ root: classes.tableCellRoot }}
          className={classes.p20}
        >
          <Box className={classes.spaceBetween}>
            <Box className={classes.inlineGrid}>
              <Typography className={classes.bold}>{t('campaigns.camapignName')}</Typography>
              {row.Name}
            </Box>
            <Box>
              <Typography className={classes.bold}>{t('report.date')}</Typography>
              {FormatDate(row.SendDate)}
            </Box>
          </Box>
          <Box className={clsx(classes.mt1)}>
            <Box className={classes.flex}>
              <Box className={clsx(classes.flex6)}>
                <Typography className={classes.bold}>{t('common.Status')}</Typography>
                {renderStatusCell(row.SmsStatus)}
              </Box>
              <Box className={clsx(classes.flex4)}>
                <Typography className={classes.bold}>{t('common.Clicked')}</Typography>
                {t(`common.${row?.ClicksCount > 0 ? 'Yes' : 'No'}`)}
              </Box>
              <Box className={clsx(classes.flex4, classes.pt5, classes.textRight)}>
                <ManagmentIcon
                  classes={classes}
                  icon={null}
                  uIcon={<PreviewIcon width={18} height={20} className={'rowIcon'} style={{ paddingTop: 10 }} />}
                  onClick={async () => {
                    if (campaignType === 'sms') {
                      setShowLoader(true);
                      const sms: any = await dispatch(getSmsByID(row.SMSCampaignID));
                      setShowLoader(false);
                      setDialogType({
                        type: 'preview',
                        data: sms?.payload
                      })
                    } else if (campaignType === 'whatsapp') {
                      if (row.TemplateID) {
                        setShowLoader(true);
                        const templateData: templateListAPIProps = await dispatch<any>(
                          getSavedTemplatesPreviewById({
                            templateId: row.TemplateID,
                          })
                        );
                        setShowLoader(false);
                        if (templateData.payload.Status === apiStatus.SUCCESS) {
                          const templates = templateData.payload?.Data?.Items;
                          if (templates && templates?.length > 0) {
                            const templateData: any = templates[0];
                            onSavedTemplateChange(templateData?.Data);
                            setDialogType({
                              type: 'whatsapp',
                              data: ''
                            })
                          }
                        } else {
                          templateData?.payload?.Message
                            ? setToastMessage({
                              ...ToastMessages.ERROR,
                              message: templateData?.payload?.Message,
                            })
                            : setToastMessage(ToastMessages.ERROR);
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
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
              return <li key={RandomID()} className={classes.p5}>{group.GroupName}</li>
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
          onChange={(e) => setFilterRequest({ ...filterRequest, Email: e.target.value })}
          onKeyDown={(e) => {
            if (e?.keyCode === 13) {
              getReportData()
            }
          }}
          className={clsx(classes.textField, classes.minWidth252)}
          error={!!errors.Email}
          placeholder={t('common.Mail')}
        />
        {
          errors.Email && (
            <Typography className={clsx(classes.pt5, classes.f13, classes.textRed)}>
              {errors.Email}
            </Typography>
          )
        }
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
          onChange={(e) => setFilterRequest({ ...filterRequest, Cellphone: e.target.value })}
          onKeyDown={(e) => {
            if (e?.keyCode === 13) {
              getReportData();
            }
          }}
          className={clsx(classes.textField, classes.minWidth252)}
          error={!!errors.Cellphone}
          placeholder={t('common.Cellphone')}
        />
        {
          errors.Cellphone && (
            <Typography className={clsx(classes.pt5, classes.f13, classes.textRed)}>
              {errors.Cellphone}
            </Typography>
          )
        }
      </Grid>

      <Grid item>
        <Button
          onClick={() => {
            getReportData()
          }}
          className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
          {t<string>('campaigns.btnSearchResource1.Text')}
        </Button>
        {isSearching &&
          <Button
            onClick={() => {
              dispatch(resetRecipientReportData());
              resetFilter();
            }}
            className={clsx(classes.btn, classes.btnRounded, classes.ml15)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        }
      </Grid>

      <Grid item style={{ display: 'none' }}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={() => setFilterRequest({
                ...filterRequest,
                ArchiveAccess: !filterRequest.ArchiveAccess
              })}
              checked={filterRequest.ArchiveAccess}
            />
          }
          label={t("common.ArchiveAccess")}
        />
      </Grid>

    </Grid>
  }

  const renderClientDetails = () => {
    const dateTimeFormat = 'DD/MM/YYYY, HH:mm a';
    return <Grid container spacing={2} className={clsx(classes.mgmtTitleContainer, classes.pr25, classes.pe25)}>
      <Grid item md='auto' xs={6} className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.first_name')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientFirstName}</div>
      </Grid>
      <Grid item md='auto' xs={6} className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.last_name')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientLastName}</div>
      </Grid>
      <Grid item md='auto' xs={6} className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.Mail')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientEmail}</div>
      </Grid>
      <Grid item md='auto' xs={6} className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.emailStatus')}</div>
        <div className={classes.pt10}>{t(ConvertClientStatus(SourceType.EMAIL, recipientsReportData?.ClientStatus))}</div>
      </Grid>
      <Grid item md='auto' xs={6} className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.cellphone')}</div>
        <div className={classes.pt10}>{recipientsReportData?.ClientCellphone}</div>
      </Grid>
      <Grid item md='auto' xs={6} className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.smsStatus')}</div>
        <div className={classes.pt10}>{t(ConvertClientStatus(SourceType.SMS, recipientsReportData?.ClientSMSStatus))}</div>
      </Grid>
      <Grid item md='auto' xs={6} className={classes.flexGrow1}>
        <div className={clsx(classes.bold)}>{t('common.createdDate')}</div>
        <div className={classes.pt10}>{moment(recipientsReportData?.ClientCreationDate).format(DateFormats.DATE_TIME_24)}</div>
      </Grid>
      <Grid item md={'auto'} xs={6} className={clsx(classes.flexGrow1, classes.pt15)}>
        {/* @ts-ignore */}
        <img src={GroupsIcon} style={{ height: 20 }} alt="" />
        <div
          className={clsx(classes.p5, classes.dInlineBlock, classes.link)}
          style={{ verticalAlign: 'super' }}
          onClick={() => toggleGroupModal(true)}
        >
          {t('common.recipientGroups')}
        </div>
      </Grid>
      <Grid item md={1} className={clsx(classes.flexGrow1, classes.pt20)}>
        <Button
          onClick={() => setDialogType({ type: 'exportFormat', data: '' })}
          className={clsx(classes.btn, classes.btnRounded, classes.mt1)}
          style={{ whiteSpace: 'nowrap' }}
          endIcon={<FaFileExcel className={clsx(classes.f25)} />}>
          {t('master.download')}
        </Button>
      </Grid>
    </Grid>
  }

  const getSMSPreviewDialog = (data: any = {}) => {
    return {
      title: `${t('notifications.preview')} - ${t('common.campaignID')}: ${data?.SMSCampaignID}`,
      childrenPadding: false,
      contentStyle: classes.pt2rem,
      showDivider: false,
      showDefaultButtons: false,
      icon: (
        <FaEye style={{ fontSize: 35, padding: 5, fill: '#fff' }} />
      ),
      content: (
        <Box>
          <Preview
            classes={classes}
            mobileFullsize={true}
            model={data}
            ShowRedirectButton={
              data?.RedirectButtonText && data?.RedirectButtonText !== ''
            }
            showTitle={false}
            showID={true}
            isSMS={true}
          />
        </Box>
      )
    };
  };

  const getWhatsappPreviewDialog = () => ({
    title: t('whatsappManagement.preview'),
    showDivider: false,
    showDefaultButtons: false,
    icon: (
      <FaEye style={{ fontSize: 35, padding: 5, fill: '#fff' }} />
    ),
    content: (
      <Box className={classes.alertModalContentMobile}>
        <WhatsappMobilePreview
          classes={classes}
          templateData={templateData}
          buttonType={buttonType}
          fileData={fileData}
        />
      </Box>
    ),
    onConfirm: async () => {
      setDialogType({
        type: '',
        data: ''
      });
    }
  })

  const getNewsletterPreviewDialog = (templateData: string = '') => ({
    title: `${t('notifications.preview')} - ${t('common.campaignID')}: ${templateData}`,
    showDivider: false,
    customContainerStyle: classes.beeTemplate,
    showDefaultButtons: false,
    icon: (
      <FaEye style={{ fontSize: 35, padding: 5, fill: '#fff' }} />
    ),
    content: (
      <Box style={{ minHeight: 'calc(70vh)', height: 'calc(70vh)' }}>
        <iframe
          src={`${actionURL}PreviewCampaign.aspx?CampaignID=${templateData}&fromreact=true`}
          style={{ border: "none !important", width: '100%', height: '100%' }}
        />
      </Box>
    ),
    onConfirm: async () => {
      setDialogType({
        type: '',
        data: ''
      });
    }
  })

  const renderDialog = () => {
    const { type, data } = dialogType || {}

    if (type) {
      const dialogContent: { [key: string]: {} } = {
        preview: getSMSPreviewDialog(data),
        whatsapp: getWhatsappPreviewDialog(),
        newsletterpreview: getNewsletterPreviewDialog(data),
      }
      if (dialogContent[type] === undefined) return <></>;
      const currentDialog: any = (type && dialogContent[type]) || {};
      return (
        dialogType && <BaseDialog
          classes={classes}
          open={dialogType}
          childrenStyle={classes.mb25}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}>
          {currentDialog.content}
        </BaseDialog>
      )
    }
  }

  const resetToast = () => {
    setToastMessage(resetToastData);
  };

  const renderToast = () => {
    if (toastMessage.message?.length > 0) {
      setTimeout(() => {
        resetToast();
      }, 4000);
      return <Toast data={toastMessage} />;
    }
    return null;
  };

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
            <Grid item md={6} className={classes.w100}>
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
            <Grid item md={6} className={classes.w100}>
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
            <Grid item md={12} className={classes.w100}>
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
      {
        isRecipientSearched && recipientsReportData?.ClientID === 0 && (
          <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue, classes.tableStyle)}>
            <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
              <Grid item md={6} className={classes.flexGrow1}>{t('common.NoDataTryFilter')}</Grid>
            </Grid>
          </Box>
        )
      }

      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialogType?.type === 'exportFormat'}
        title={t('campaigns.exportFile')}
        radioTitle={t('common.SelectFormat')}
        onConfirm={(format: string) => downloadRecipientReport(format)}
        onCancel={() => setDialogType(null)}
        cookieName={'exportFormat'}
        defaultValue="xlsx"
        options={ExportFileTypes}
      />
      {groupModal()}
      {renderDialog()}
      {renderToast()}
      {/* {previewCampaign.show && previewSmsCampaign()} */}
    </DefaultScreen>
  )
}

export default RecipientReport