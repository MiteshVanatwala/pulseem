import { Button, Grid, Tab } from "@material-ui/core";
import { useParams } from "react-router-dom";
import { ClassesType } from "../../Classes.types";
import { InboundTypes } from "./Constants";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { useState, useEffect } from 'react';
import { coreProps } from "../../../model/Core/corePros.types";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import ConfirmRadioDialog from "../../../components/DialogTemplates/ConfirmRadioDialog";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import clsx from 'clsx';
import { ExportIcon } from "../../../assets/images/managment";
import SmsInbound from "./Sms/SmsInbound";

const InboundMessages = ({ classes }: ClassesType) => {
    const params = useParams();
    const { type, id } = params;
    const { t: translator } = useTranslation();
    const { isRTL, windowSize, accountFeatures } = useSelector((state: { core: coreProps }) => state.core);
    const [activeTab, setActiveTab] = useState<string>('0');
    const [dialogType, setDialog] = useState<Object | null>(null);
    const [exportEnable, setExportEnable] = useState(false);

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
                                    return !it.disabled && <Tab
                                        key={it.key}
                                        label={translator(it.name)}
                                        classes={{ root: classes.minWidth100 }}
                                        value={it.value}
                                    />
                                })
                            }
                        </TabList>
                        {/* <Grid item>
                            {accountFeatures.indexOf('13') === -1 && windowSize !== 'xs' && <CustomTooltip
                                style={{ fontSize: 14 }}
                                text={translator('report.ExportLimitation')}
                                icon={<Button
                                    variant='contained'
                                    size='medium'
                                    className={clsx(
                                        classes.actionButton,
                                        classes.actionButtonGreen,
                                        classes.exportButton, exportEnable === false ? classes.disabled : ''
                                    )}
                                    onClick={() => setDialog('exportFormat')}
                                    startIcon={<ExportIcon />}
                                >
                                    {translator('campaigns.exportFile')}
                                </Button>}
                            >

                            </CustomTooltip>
                            }
                        </Grid> */}
                    </Grid>
                    <Grid item xs={12} className={classes.lastReportsTabPanels}>
                        <TabPanel value='0' className={classes.p0}>
                            <SmsInbound
                                classes={classes}
                            />
                        </TabPanel>
                        <TabPanel value='1' className={classes.p0}>
                            {/* <DirectWhatsappReportTab
                                classes={classes}
                                dispatch={dispatch}
                                windowSize={windowSize}
                                isRTL={isRTL}
                                handleSearchInput={handleSearchInput}
                                handleSearching={handleSearching}
                                handlePageChange={setPageWhatsapp}
                                handleAdvanceSearch={setAdvanceSearch}
                                clearSearch={clearSearch}
                                page={pageWhatsapp}
                                rowsPerPage={rowsPerPage}
                                searchData={searchData}
                                isSearching={isSearching}
                                directWhatsappReport={directWhatsappReport ?? null}
                                advanceSearch={advanceSearch}
                                setLoader={setLoader}
                                rowsOptions={rowsOptions}
                            /> */}
                        </TabPanel>
                    </Grid>
                </TabContext>

            </Grid>
        )
    }

    return <DefaultScreen
        subPage={'inboundMessages'}
        currentPage='reports'
        classes={classes}
        containerClass={classes.management}>
        {/* <ConfirmRadioDialog
            classes={classes}
            isOpen={dialogType === 'exportFormat'}
            title={translator('campaigns.exportFile')}
            radioTitle={translator('common.SelectFormat')}
            //onConfirm={(e) => handleExportFile(e)}
            onCancel={() => setDialog(null)}
            cookieName={'exportFormat'}
            defaultValue="xls"
            options={ExportFileTypes}
        /> */}
        {renderTabs()}
    </DefaultScreen>


}

export default InboundMessages;