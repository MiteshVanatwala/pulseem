import { EventsOptions } from '../../helpers/PulseemArrays'
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Tab, Button } from '@material-ui/core'
import EventToGroups from './EventToGroups'
import { useDispatch, useSelector } from 'react-redux'
import { addMetaData } from '../../redux/reducers/siteTrackingSlice'
import { AiOutlinePlusCircle } from "react-icons/ai";

const EventTabs = ({ classes, setDialog }) => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState('PAGE_VIEW');
    const { event } = useSelector((state) => state.siteTracking);
    const dispatch = useDispatch();

    const emptyMetaData = {
        operatorKey: "CONTAINS",
        operatorValue: "",
        groupIds: []
    };
    const handleEventTab = (val) => {
        setTabValue(val);
    }
    const onAddEvent = () => {
        dispatch(addMetaData(emptyMetaData));
    }
    return <TabContext value={tabValue}>
        <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            className={classes.borderBottom1}
            item xs={12}>
            <TabList
                onChange={(e, value) => handleEventTab(value)}
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
        {EventsOptions.map((eo, idx) => {
            return <TabPanel key={idx} value={eo.key} index={idx} className={classes.p0}>
                {
                    event && event.metadata ?
                        <>
                            {event.metadata.map((mt, idx) => {
                                return <EventToGroups
                                    id={mt.id}
                                    key={idx}
                                    index={idx}
                                    currentEvent={mt}
                                    eventsCount={event.metadata.length}
                                    classes={classes}
                                    onShowGroups={() => { setDialog({ type: 'showGroups' }) }}
                                    onHideGroups={() => { setDialog(null) }}
                                />
                            })}

                        </>
                        :
                        <></>
                }
                <Button onClick={onAddEvent}>
                    <AiOutlinePlusCircle className={classes.addOptionsIcon} />
                    {t("siteTracking.addEvent")}
                </Button>
            </TabPanel>
        })}
    </TabContext>
}

export default EventTabs;