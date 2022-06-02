import { EventsOptions } from '../../helpers/PulseemArrays'
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Tab, Button, Box, Link, Divider } from '@material-ui/core'
import EventToGroups from './EventToGroups'
import { useDispatch, useSelector } from 'react-redux'
import { addMetaData } from '../../redux/reducers/siteTrackingSlice'
import { AiOutlinePlusCircle } from "react-icons/ai";
import PulseemSwitch from '../../components/Controlls/PulseemSwitch';

const EventTabs = ({ classes, setDialog, domain, showButtons = () => null, onPurchase = () => null }) => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState('PAGE_VIEW');
    const { event, purchaseEvent } = useSelector((state) => state.siteTracking);
    const { windowSize, isRTL } = useSelector((state) => state.core);
    const [purchaseEnabled, setPurchaseEnabled] = useState(false);
    const dispatch = useDispatch();
    const [metadataToShow, setMetadataToShow] = useState(10);

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
        //dispatch(addMetaData({ metadata: emptyMetaData, eventType: 'PAGE_VIEW' }));
        setMetadataToShow(event.metadata.length + 1);
    }

    useEffect(() => {
        setPurchaseEnabled(purchaseEvent !== null);
    }, []);

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
            <Box style={{ display: 'flex', flexDirection: 'row' }}>
                <Button onClick={() => { onAddEvent() }} style={{ justifyContent: 'flex-start' }}>
                    <AiOutlinePlusCircle className={classes.addOptionsIcon} />
                    {t("siteTracking.addEvent")}
                </Button>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', maxWidth: 1135, width: '100%' }} className={classes.mb25}>
                {event.metadata && event.metadata.length > 10 &&
                    <Link onClick={() => setMetadataToShow(metadataToShow > 10 ? 10 : (event.metadata.length + 1))}
                        className={classes.alignCenter}
                        style={{ cursor: 'pointer', fontSize: 20 }}>{metadataToShow <= 10 ? t('common.SeeAll') : t('common.showTen')}</Link>}
            </Box>
        </>;
    }
    const renderPurchase = () => {
        return <Box style={{ marginBlock: 20 }}><PulseemSwitch
            classes={classes}
            id="enablePurchase"
            onChange={() => {
                onPurchase(!purchaseEnabled);
                setPurchaseEnabled(!purchaseEnabled);
            }}
            checked={purchaseEnabled}
            isRTL={isRTL}
            switchType="ios"
        />
            Purchase enabled
        </Box>
    }

    return <TabContext value={tabValue}>
        <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            className={classes.borderBottom1}
            item xs={12}>
            <TabList
                onChange={handleEventTab}
                indicatorColor="primary"
            >
                {EventsOptions.map((eo, idx) => {
                    return <Tab
                        key={idx}
                        label={t(eo.value)}
                        classes={{ root: classes.minWidth100 }}
                        value={eo.key}
                    />
                })}
            </TabList>
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