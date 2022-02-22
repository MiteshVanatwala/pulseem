import { EventsOptions } from '../../helpers/PulseemArrays'
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Tab } from '@material-ui/core'
import EventToGroups from './EventToGroups'
import { useSelector } from 'react-redux'

const EventTabs = ({ classes, setDialog }) => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState('PAGE_VIEW');
    const { event } = useSelector((state) => state.siteTracking);

    const handleEventTab = (val) => {
        setTabValue(val);
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
                                    key={idx}
                                    index={idx}
                                    currentEvent={mt}
                                    // onUpdate={(k, v) => deepUpdate(k, v)}
                                    classes={classes}
                                    onShowGroups={() => { setDialog({ type: 'showGroups' }) }}
                                    onHideGroups={() => { setDialog(null) }}
                                />
                            })}

                        </>
                        :
                        <></>
                }
            </TabPanel>
        })}
    </TabContext>
}

export default EventTabs;