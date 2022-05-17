import { Box, TableCell, TableRow, Typography } from '@material-ui/core'
// import React from 'react'
// import PropTypes from 'prop-types';
import clsx from "clsx";
import NameValueGridStructure from '../../../components/Grids/NameValueGridStructure';
import { useTranslation } from "react-i18next";
// import FlexGrid from '../../../components/Grids/FlexGrid';
// import IconWrapper from '../../../components/icons/IconWrapper';



const RenderPhoneRow = ({ name = '', classes, rowStyle, row, colorTextStyle, setSelectedGroups, setDialog, DialogType }) => {
    const { t } = useTranslation();
    const {
        OpenTime,
        LogSms_ErrorType,
        PageType,
        OpenDate,
        OpenCount,
        OpenCountry,
        OpenCountryLocation,
        Revenue,
        ClientID,
        SubAccountID,
        Email,
        Status,
        SmsStatus,
        FirstName,
        LastName,
        Telephone,
        Cellphone,
        CellphoneRightDigits,
        Address,
        City,
        State,
        Country,
        Zip,
        Company,
        ExtraFields,
        BirthDate,
        ReminderDate,
        LastSendDate,
        CreationDate,
        FailedSendingCounter,
        IsWebService,
        LastEmailOpened,
        LastEmailClicked,
        BestEmailOpenTime
    } = row;
    return (
        <TableRow key={ClientID} component="div" classes={rowStyle}>
            <TableCell
                style={{ flex: 1 }}
                classes={{ root: classes.tableCellRoot }}
                className={classes.p20}
            >
                <Box className={classes.spaceBetween}>
                    <Box className={classes.inlineGrid}>
                        {name}
                    </Box>
                    <Box className={clsx(classes.inlineGrid, classes.textCenter)}>

                        <Typography className={classes.bold}>
                            {t("common.campaignRevenue")}
                        </Typography>
                        <Typography>
                            {Revenue}
                        </Typography>

                    </Box>
                </Box>
                <Box className={clsx(classes.mt5)} style={{ maxWidth: '90%' }}>
                    <Box className={classes.flex}>
                        <Box className={clsx(classes.flex6)}>
                            <Typography className={classes.bold}>{t("recipient.emails")}</Typography>
                            <Typography >{Email}</Typography>
                        </Box>
                        <Box className={clsx(classes.flex4)}>
                            <Typography align='left' className={clsx(classes.middle, classes.bold, Status === 1 ? classes.sendIconText : classes.textColorRed)}>{Status === 1 ? t("common.statusActive") : t("common.Unsubscribed")}</Typography>
                        </Box>
                    </Box>

                </Box>
                <Box className={clsx(classes.mt2)} style={{ maxWidth: '90%' }}>

                    <Box className={classes.flex}>
                        <Box className={clsx(classes.flex6)}>
                            <Typography className={classes.bold}>{t("common.Cellphone")}</Typography>
                            <Typography >{Cellphone}</Typography>
                        </Box>
                        <Box className={clsx(classes.flex4)}>
                            <Typography align='left' className={clsx(classes.middle, classes.bold, SmsStatus === 0 ? classes.sendIconText : classes.textColorRed)}>{SmsStatus === 0 ? t("common.statusActive") : t("common.Unsubscribed")}</Typography>
                        </Box>
                    </Box>
                </Box>
            </TableCell>
        </TableRow>
    )
}

// RenderPhoneRow.propTypes = {
//     row: PropTypes.object,
//     classes: PropTypes.object,
//     name: PropTypes.string,
//     cellIcons: PropTypes.any,
//     rowStyle: PropTypes.object,
//     setSelectedGroups: PropTypes.func,
//     setDialog: PropTypes.func,
//     DialogType: PropTypes.object
// }

export default RenderPhoneRow
