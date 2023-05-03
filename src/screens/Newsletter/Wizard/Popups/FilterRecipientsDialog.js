import { Box, Checkbox, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { FaFilter } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import Groups from '../../../../components/Groups/GroupsHandler/Groups';
import clsx from 'clsx';

const FilterRecipientsDialog = ({ classes, onClose = () => null, onConfirm = () => null, groupList = [], totalCampaigns = [], callbackFilteredGroups = () => null, callbackUpdateGroupFilterd = () => null, callbackFiltertedCampaigns = () => null, callbackUpdateCampaignFilter = () => null, callbackShowTestGroup = () => null, handleReciInput = () => null, filterValues, setFilterValues = () => null }) => {
    const { t } = useTranslation()
    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );

    return {
        title: t('campaigns.newsLetterEditor.sendSettings.doNotSend'),
        showDivider: true,
        icon: (
            <FaFilter style={{ fontSize: 30, color: "#fff" }} />
        ),
        content: (
            <Box style={{ width: windowSize === 'lg' || windowSize === 'xl' ? '500px' : null }}>
                <div
                    className={classes.reciCheckoxContainer}
                >
                    <Checkbox
                        checked={filterValues.toggleReci}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                        onClick={() => setFilterValues({ ...filterValues, toggleReci: !filterValues.toggleReci, exceptionalDays: '' })}
                    />
                    <span style={{ display: 'inline-block', marginTop: 2 }} className={classes.font14}>
                        {t("campaigns.newsLetterEditor.sendSettings.filterInputText")}
                    </span>
                    <div style={{ marginRight: isRTL ? 'auto' : null, marginLeft: !isRTL ? 'auto' : null }}>
                        <input
                            type="text"
                            disabled={filterValues.toggleReci ? false : true}
                            className={
                                filterValues.toggleReci
                                    ? filterValues.RecipientsBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.success)
                                    : clsx(classes.pulseInsert)
                            }
                            onChange={(e) => { handleReciInput(e) }}
                            value={filterValues.exceptionalDays}
                            maxLength="3"
                        />
                    </div>
                </div>
                <div>
                    <Box className={classes.mb10}>
                        <Typography className={clsx(classes.font14, classes.bold)}> {t("smsReport.inputTextFilter")}: </Typography>
                    </Box>
                    <div>
                        <div
                            className={clsx(classes.sidebar)}
                        >
                            <Groups
                                isSms={true}
                                bsDot={false}
                                classes={classes}
                                showSortBy={false}
                                isCampaign={false}
                                showSelectAll={false}
                                isNotifications={false}
                                list={groupList || []}
                                selectedList={filterValues.selectedFilterGroups}
                                callbackUpdateGroups={callbackUpdateGroupFilterd}
                                callbackSelectedGroups={callbackFilteredGroups}
                                callbackShowTestGroup={callbackShowTestGroup}
                                noSelectionText={t("sms.NoFilteredGroups")}
                                innerHeight={160}
                                uniqueKey={'groups_2'}
                            />
                        </div>
                    </div>
                </div>
                <div className={classes.camapignsDiv}>
                    <Box className={classes.mb10}>
                        <Typography className={clsx(classes.font14, classes.bold)}>{t("smsReport.campaignInfo")}:</Typography>
                    </Box>
                    <div>
                        <div className={clsx(classes.sidebar)}>
                            <Groups
                                isSms={false}
                                bsDot={false}
                                classes={classes}
                                showSortBy={false}
                                showSelectAll={false}
                                isNotifications={false}
                                isCampaign={true}
                                list={totalCampaigns || []}
                                selectedList={filterValues.selectedFilterCampaigns}
                                callbackUpdateGroups={callbackUpdateCampaignFilter}
                                callbackSelectedGroups={callbackFiltertedCampaigns}
                                noSelectionText={t("sms.NoFilteredCampaigns")}
                                innerHeight={160}
                                uniqueKey={'campaigns'}
                            />
                        </div>
                    </div>
                </div>
            </Box>
        ),
        showDefaultButtons: true,
        onClose: onClose,
        onConfirm: onConfirm
    }
}

export default FilterRecipientsDialog