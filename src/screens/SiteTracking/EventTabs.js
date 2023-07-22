import { EventsOptions } from '../../helpers/Constants'
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Tab, Button, Box, Link, Divider, Tabs } from '@material-ui/core'
import EventToGroups from './EventToGroups'
import { useDispatch, useSelector } from 'react-redux'
import { addMetaData } from '../../redux/reducers/siteTrackingSlice'
import PulseemSwitch from '../../components/Controlls/PulseemSwitch';
import clsx from 'clsx';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const EventTabs = ({ classes,
    setDialog,
    purchaseToggleDisabled = false,
    showButtons = () => null,
    onPurchaseChanged = () => null 
}) => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState('PAGE_VIEW');
    const { event, purchaseEnabled } = useSelector((state) => state.siteTracking);
    const { windowSize, isRTL } = useSelector((state) => state.core);
    const dispatch = useDispatch();
    const [metadataToShow, setMetadataToShow] = useState(10);
    const [togglePurchase, setTogglePurchase] = useState(false);

    const emptyMetaData = {
        operatorKey: "CONTAINS",
        operatorValue: "",
        groupIds: []
    };
    const handleEventTab = (event, newValue) => {
        setTabValue(newValue);
        showButtons(newValue !== 'PURCHASE')
    }
    const onAddEvent = () => {
        dispatch(addMetaData(emptyMetaData));
        setMetadataToShow(event.metadata.length + 1);
    }

    useEffect(() => {
        setTogglePurchase(purchaseEnabled);
    }, [purchaseEnabled]);

    const renderPageView = () => {
        return <>
            {event && event.metadata.map((mt, idx) => {
                if (idx < metadataToShow) {
                    return <><EventToGroups
                        id={mt.id}
                        key={idx}
                        index={idx}
                        currentEvent={mt}
                        eventsCount={event.metadata.length}
                        classes={classes}
                        onShowGroups={() => { setDialog({ type: 'showGroups' }) }}
                        onHideGroups={() => { setDialog(null) }}
                    />
                        {windowSize === 'xs' ? <Divider /> : null}
                    </>
                }
                return <></>
            })}
            <Box style={{ display: 'flex', flexDirection: 'row' }} className={classes.mt2}>
                <Button onClick={() => { onAddEvent() }} style={{ justifyContent: 'flex-start' }} className={clsx(classes.btn, classes.btnRounded)} endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
                    {t("siteTracking.addEvent")}
                </Button>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', maxWidth: 1135, width: '100%' }} className={classes.mb25}>
                {event?.metadata && event?.metadata.length > 10 &&
                    <Link onClick={() => setMetadataToShow(metadataToShow > 10 ? 10 : (event.metadata.length + 1))}
                        className={classes.alignCenter}
                        style={{ cursor: 'pointer', fontSize: 20 }}>{metadataToShow <= 10 ? t('common.SeeAll') : t('common.showTen')}</Link>}
            </Box>
        </>;
    }
    const renderPurchase = () => {
        return <Box style={{ marginBlock: 20 }}>
            <PulseemSwitch
                classes={classes}
                id="enablePurchase"
                onChange={async () => {
                    await onPurchaseChanged(!togglePurchase);
                }}
                checked={togglePurchase}
                isRTL={isRTL}
                switchType="ios"
                props={{ disabled: purchaseToggleDisabled }}
            />
            {t('siteTracking.enablePurchase')}
        </Box>
    }

    return <TabContext value={tabValue}>
        <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            className={classes.borderBottom1}
            item xs={12}>
            <Tabs
                value={tabValue}
                onChange={handleEventTab}
                className={clsx(classes.tab, classes.tablistRoot)}
                classes={{ indicator: classes.hideIndicator }}
            >
                {EventsOptions.map((eo, idx) => {
                    return <Tab
                        key={idx}
                        label={t(eo.value)}
                        classes={{ root: classes.btnTab, selected: classes.currentActiveTab }}
                        value={eo.key}
                    />
                })}
            </Tabs>
        </Grid>
        <TabPanel key={0} value={'PAGE_VIEW'} index={0} className={classes.p0}>
            {renderPageView()}
        </TabPanel>
        <TabPanel key={1} value={'PURCHASE'} index={1} className={classes.p0}>
            {renderPurchase()}
        </TabPanel>
    </TabContext>
}

export default EventTabs;