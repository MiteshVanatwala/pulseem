import { useEffect, useState } from 'react';
import clsx from "clsx";
import { Box, Tab, Grid, Tabs, Typography, Button, Tooltip } from "@material-ui/core";
import "moment/locale/he";
import { Loader } from '../../components/Loader/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { useParams } from 'react-router-dom';
import DefaultScreen from '../DefaultScreen';
import { getNewsletterPreview } from '../../redux/reducers/newsletterSlice';
import { getLandingPagePreview } from '../../redux/reducers/landingPagesSlice';
import { useTranslation } from 'react-i18next';
import { Title } from '../../components/managment/Title';


const HtmlPreview = ({ classes }: any) => {
  const params = useParams();
  const { id, type } = params;
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [details, setDetails] = useState<any>(null);

  const [html, setHtml] = useState<string>('');
  const dispatch = useDispatch();

  const getNewsletterHtml = async () => {
    // @ts-ignore
    const response = await dispatch(getNewsletterPreview(id)) as any;
    setHtml(response?.payload?.Data?.HTMLtoSend);
    const d = {
      Name: response?.payload?.Data?.Name,
      ID: response?.payload?.Data?.CampaignID,
      FromEmail: response?.payload?.Data?.FromEmail,
      FromName: response?.payload?.Data?.FromName
    }
    setDetails(d);
    setShowLoader(false);
  }
  const getLandingPageHtml = async () => {
    // @ts-ignore
    const response = await dispatch(getLandingPagePreview(id)) as any;
    const d = {
      PageName: response?.payload?.Data?.PageName,
      ID: response?.payload?.Data?.ID
    }
    setDetails(d);
    setHtml(response?.payload?.Data?.HtmlData);
    setShowLoader(false);
  }
  const renderTitleText = () => {
    switch (type?.toLowerCase()) {
      case 'landingpage': {
        return <Box>
          {t('common.Preview')}
          <Typography style={{ fontSize: 14 }}><b>{t('master.lblContactNameResource1.Text')}:</b> {details?.PageName}</Typography>
          <Typography style={{ fontSize: 14 }}><b>{t('common.campaignID')}:</b> {details?.ID}</Typography>
        </Box>
      }
      default: {
        return <Box>
          {t('common.Preview')}
          <Typography style={{ fontSize: 14 }}><b>{t('common.CampaignName')}:</b> {details?.Name}</Typography>
          <Typography style={{ fontSize: 14 }}><b>{t('common.campaignID')}:</b> {details?.ID}</Typography>
          <Typography style={{ fontSize: 14 }}><b>{t('report.FromEmail')}:</b> {details?.FromEmail}</Typography>
          <Typography style={{ fontSize: 14 }}><b>{t('report.FromName')}:</b> {details?.FromName}</Typography>
        </Box>
      }
    }


  }

  useEffect(() => {
    switch (type?.toLowerCase()) {
      case 'newsletter': {
        getNewsletterHtml();
        break;
      }
      case 'landingpage': {
        getLandingPageHtml();
        break;
      }
    }
  }, [])
  return <DefaultScreen
    currentPage="previewer"
    key="previewer"
    classes={classes}
    hideSideImages={true}
    containerClass={clsx(classes.mb50, classes.mt50)}
  >
    <Box className={'topSection'}>
      <Title Text={renderTitleText()} classes={classes} />
      <Box style={{ maxWidth: 1540, margin: '0 auto', position: 'relative' }} className={classes.p20}>
        {RenderHtml(html)}
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} />
    </Box>
  </DefaultScreen>
}

export default HtmlPreview;