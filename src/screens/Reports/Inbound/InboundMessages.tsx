import clsx from 'clsx'
import { Grid, Tab } from "@material-ui/core";
import { useParams } from "react-router-dom";
import { ClassesType } from "../../Classes.types";
import { InboundTypes } from "./Constants";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import SmsReplies from "./Sms/SmsReplies";
import Title from '../../../components/Wizard/WizardTitle';
import WhatsappInbound from './Whatsapp/WhatsappInbound';

const InboundMessages = ({ classes }: ClassesType) => {
    const params = useParams();
    const { type, id } = params;
    const { t: translator } = useTranslation();
    const [activeTab, setActiveTab] = useState<string>('0');

    useEffect(() => {
        if (type?.toLowerCase() === 'whatsapp') {
            setActiveTab('1');
        }
    }, []);

    const renderTabs = () => {
        return (
            <Grid container>
                <TabContext value={activeTab}>
                    <Grid
                        container
                        justifyContent='space-between'
                        alignItems='center'
                        item xs={12}
                        className={classes.borderBottom1}>
                        <TabList
                            onChange={(e, value) => { setActiveTab(value.toString()) }}
                            indicatorColor="primary"
                        >
                            {
                                InboundTypes.map((it, idx) => {
                                    const label = translator(it.name);
                                    return !it.disabled && <Tab
                                        key={it.key}
                                        classes={{ root: classes.minWidth100 }}
                                        value={it.value}
                                        title={translator(it.name)}
                                        label={label}
                                    />
                                })
                            }
                        </TabList>
                    </Grid>
                    <Grid item xs={12} className={classes.lastReportsTabPanels}>
                        <TabPanel value='0' className={classes.p0}>
                            <SmsReplies classes={classes} />
                        </TabPanel>
                        <TabPanel value='1' className={classes.p0}>
                            <WhatsappInbound classes={classes} />
                        </TabPanel>
                    </Grid>
                </TabContext>

            </Grid>
        )
    }

    return <DefaultScreen
        key="inboundMessages"
        subPage={'inboundMessages'}
        currentPage='reports'
        classes={classes}
        containerClass={clsx(classes.management, classes.mb50)}
    >
        <Title
            classes={classes}
            stepNumber={null}
            subTitle={null}
            title={translator('master.smsReplies')}
            key="Inbound_reports"
            tooltip={null}
            topZero={undefined}
        />
        {renderTabs()}
    </DefaultScreen>


}

export default InboundMessages;