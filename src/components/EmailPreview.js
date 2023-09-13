import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, Box, Tab, Tabs } from '@material-ui/core'
import clsx from 'clsx';
import { FaDesktop, FaMobile } from 'react-icons/fa';
import { RenderHtml } from '../helpers/Utils/HtmlUtils';


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export const EmailPreview = ({
  classes,
  data = '',
  showDevices = true,
}) => {
  const [previewDeviceSelected, setPreviewDevice] = useState(showDevices === false ? 0 : 0);
  
  const handleDeviceChange = (event, newValue) => {
    setPreviewDevice(newValue);
  };

  function a11yProps(index) {
    return {
      id: `scrollable-force-tab-${index}`,
      'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
  }

  // Desktop/Mobile Preview
  const desktopPreview = (isChrome) => {
    return (
      <div>
        <div className={clsx(classes.osScreen, classes.txtCenter)}>
          <div className={clsx(classes.desktop)}>
            <div class="ep_container">
              <div class="ep_screen ep_monitor">
                <div class="ep_div ep_content">
                  {RenderHtml(data)}
                </div>
                <div class="ep_base">
                  <div class="ep_div ep_grey-shadow"></div>
                  <div class="ep_div ep_foot ep_top"></div>
                  <div class="ep_div ep_foot ep_bottom"></div>
                  <div class="ep_div ep_shadow"></div>
                </div>
              </div>    
            </div>
          </div>
        </div>
      </div>
    )
  }

  const mobilePreview = () => {
    return (
      <div className={clsx(classes.mobileBG, 'mobileBg', classes.pt2rem)} style={{ margin: 'auto'}}>
        <Box className={classes.mobilePreviewContainer}>
          <div
            className={clsx(classes.pt50, classes.p50)}
            dangerouslySetInnerHTML={{ __html: data }}
            style={{transform: 'scale(0.7)'}}
          >
          </div>
        </Box>
      </div>
    )
  }

  return (
    <>
      <Grid className={classes.beeTemplate}>
        <Box className={clsx(classes.mt2, classes.dBlock)}>
          <Tabs
            value={previewDeviceSelected}
            onChange={handleDeviceChange}
            className={clsx(classes.tab, classes.tablistRoot)}
            classes={{ indicator: classes.hideIndicator }}
            scrollButtons="off"
            aria-label="Email Preview"
          >
            <Tab label={<FaDesktop style={{ fontSize: '24px' }} />} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }}  {...a11yProps(0)} />
            <Tab label={<FaMobile style={{ fontSize: '24px' }} />} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }}  {...a11yProps(1)} />
          </Tabs>
        </Box>
        <Box className={clsx(classes.mt2, classes.dBlock, classes.txtCenter)}>
          <TabPanel value={previewDeviceSelected} index={0}>
            {desktopPreview(true)}
          </TabPanel>
          <TabPanel value={previewDeviceSelected} index={1}>
            {mobilePreview()}
          </TabPanel>
        </Box>
      </Grid>
    </>
  )
}