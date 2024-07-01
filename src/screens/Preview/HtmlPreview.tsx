import { useEffect, useState } from 'react';
import clsx from "clsx";
import { Box, Tab, Grid, Tabs, Typography, Button, Tooltip, Divider } from "@material-ui/core";
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
import { PopMassage } from '../../components/managment';
import { CopyIcon } from '../../assets/images/managment';
import CopyToClipboard from 'react-copy-to-clipboard';


const HtmlPreview = ({ classes }: any) => {
  const params = useParams();
  const { id, type } = params;
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<any>();
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [details, setDetails] = useState<any>(null);
  const [html, setHtml] = useState<string>('');
  const dispatch = useDispatch();


  const implementAmpScripts = async (isAmp: boolean) => {

    return new Promise((resolve: any) => {
      if (isAmp) {
        const script = document.createElement("script");
        script.src = "https://cdn.ampproject.org/rtv/012406131415000/v0/amp-loader-0.1.js";
        script.setAttribute('custom-element', 'amp-loader');
        script.setAttribute('data-script', 'amp-loader');
        script.setAttribute('i-amphtml-inserted', '');
        script.setAttribute('crossorigin', 'anonymous');
        script.async = true;
        document.getElementsByTagName('head')[0].appendChild(script);
        const script1 = document.createElement("script");
        script1.src = "https://cdn.ampproject.org/v0.js";
        document.getElementsByTagName('head')[0].appendChild(script1);

        const script2 = document.createElement("script");
        script2.src = "https://cdn.ampproject.org/v0/amp-selector-0.1.js";
        script2.setAttribute('custom-element', 'amp-selector');
        document.getElementsByTagName('head')[0].appendChild(script2);

        const script3 = document.createElement("script");
        script3.src = "https://cdn.ampproject.org/v0/amp-carousel-0.1.js";
        script3.setAttribute('custom-element', 'amp-carousel');
        document.getElementsByTagName('head')[0].appendChild(script3);
      }

      resolve();
    });

  }

  const getNewsletterHtml = async () => {
    // @ts-ignore
    const response = await dispatch(getNewsletterPreview(id)) as any;

    implementAmpScripts(response?.payload?.Data?.AmpData !== null).then(() => {
      setHtml(response?.payload?.Data?.AmpData || response?.payload?.Data?.HTMLtoSend || response?.payload?.Data?.HTML);
      const d = {
        PageName: response?.payload?.Data?.Name,
        ID: response?.payload?.Data?.CampaignID,
        FromEmail: response?.payload?.Data?.FromEmail,
        FromName: response?.payload?.Data?.FromName,
        PageUrl: response?.payload?.Data?.PageUrl
      }
      setDetails(d);
      setShowLoader(false);
    });
  }
  const getLandingPageHtml = async () => {
    // @ts-ignore
    const response = await dispatch(getLandingPagePreview(id)) as any;
    const d = {
      PageName: response?.payload?.Data?.PageName,
      ID: response?.payload?.Data?.ID,
      PageUrl: response?.payload?.Data?.PageUrl
    }
    setDetails(d);
    setHtml(response?.payload?.Data?.HtmlData);
    setShowLoader(false);
  }

  const handleCopyScript = () => {
    setCopyStatus(true);
    setTimeout(() => {
      setCopyStatus(false);
    }, 1000);
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


  const C_Title = () => {
    return <Box style={{ width: '100%' }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <>{t('notifications.preview')}</>
        <><CopyToClipboard text={details?.PageUrl} onCopy={handleCopyScript}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<div className={classes.copyIcon}>{copyStatus ? '\uE134' : '\ue0b0'}</div>}
          >
            {copyStatus ? t('notifications.copied') : t('notifications.copy')}
          </Button>
        </CopyToClipboard></>
      </Box>
      <Divider style={{ marginBlock: 10 }} />
      <Typography style={{ fontSize: 14 }}><b>{t('master.lblContactNameResource1.Text')}:</b> {details?.PageName}</Typography>
      <Typography style={{ fontSize: 14 }}><b>{t('common.campaignID')}:</b> {details?.ID}</Typography>
      {type?.toLowerCase() === 'newsletter' && <>
        <Typography style={{ fontSize: 14 }}><b>{t('report.FromEmail')}:</b> {details?.FromEmail}</Typography>
        <Typography style={{ fontSize: 14 }}><b>{t('report.FromName')}:</b> {details?.FromName}</Typography>
      </>}
    </Box>
  }

  return <DefaultScreen
    currentPage="previewer"
    key="previewer"
    classes={classes}
    hideSideImages={true}
    containerClass={clsx(classes.mb50, classes.mt50)}
  >
    <Box className={'topSection'}>
      <Title isIcon={false} Element={C_Title} classes={classes} />
      <Box style={{ maxWidth: 1540, margin: '0 auto', position: 'relative', direction: 'ltr', pointerEvents: 'none' }} className={classes.p20}>
        {RenderHtml(html)}
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} />
    </Box>
  </DefaultScreen>
}

export default HtmlPreview;