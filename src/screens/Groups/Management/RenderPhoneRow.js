import { Box, TableCell, TableRow, Typography } from '@material-ui/core'
import React from 'react'
import PropTypes from 'prop-types';
import clsx from "clsx";
import NameValueGridStructure from '../../../components/Grids/NameValueGridStructure';
import { useTranslation } from "react-i18next";
import FlexGrid from '../../../components/Grids/FlexGrid';
import IconWrapper from '../../../components/icons/IconWrapper';



const RenderPhoneRow = ({ cellIcons, name, classes, rowStyle, row, colorTextStyle }) => {
    const { t } = useTranslation();
    const {
        ActiveCell,
        ActiveEmails,
        CreatedDate,
        DynamicData,
        DynamicLastUpdate,
        DynamicUpdatePolicy,
        GroupID,
        GroupName,
        InvalidCell,
        InvalidEmails,
        IsDynamic,
        IsTestGroup,
        PendingEmails,
        Recipients,
        RemovedCell,
        RemovedEmails,
        RestrictedEmails,
        SubAccountID,
        TotalRecipients,
        UpdatedDate,
    } = row;
    return (
        <TableRow key={GroupID} component="div" classes={rowStyle}>
            <TableCell
                style={{ flex: 1 }}
                classes={{ root: classes.tableCellRoot }}
            >
                <Box className={classes.justifyBetween}>
                    <Box className={clsx(classes.inlineGrid, classes.fullWidth)}>{name}</Box>
                    {/* <Box>{renderStatusCell(row.Status)}</Box> */}
                </Box>
                <Box className={classes.mt3}>
                    <Typography style={{ maxWidth: '100%' }} className={clsx(classes.nameEllipsis, classes.fullWidth)}>{t("recipient.emails")}</Typography>
                    <NameValueGridStructure
                        gridSize={{ xs: 3, sm: 3 }}
                        gridArr={[
                            {
                                name: t("campaigns.recipients"),
                                value: TotalRecipients,
                                classes: {
                                    name: colorTextStyle.blue,
                                    value: colorTextStyle.blue,
                                },
                            },
                            {
                                name: t("recipient.Active"),
                                value: ActiveEmails,
                                classes: {
                                    name: colorTextStyle.green,
                                    value: colorTextStyle.green,
                                },
                            },
                            {
                                name: t("recipient.Removed"),
                                value: RemovedEmails,
                                classes: {
                                    name: colorTextStyle.red,
                                    value: colorTextStyle.red,
                                },
                            },
                            {
                                name: t("recipient.Bounced"),
                                value: InvalidEmails,
                                classes: {
                                    name: colorTextStyle.red,
                                    value: colorTextStyle.red,
                                },
                            },
                        ]}

                        variant="body1"
                        align="center"
                    />
                </Box>
                <Box className={classes.mt2}>
                    <Typography style={{ maxWidth: '100%' }} className={clsx(classes.nameEllipsis, classes.fullWidth)}>{t("sms/mms")}</Typography>
                    <NameValueGridStructure
                        gridSize={{ xs: 3, sm: 3 }}
                        gridArr={[
                            {
                                name: t("campaigns.recipients"),
                                value: TotalRecipients,
                                classes: {
                                    name: colorTextStyle.blue,
                                    value: colorTextStyle.blue,
                                },
                            },
                            {
                                name: t("recipient.Active"),
                                value: ActiveCell,
                                classes: {
                                    name: colorTextStyle.green,
                                    value: colorTextStyle.green,
                                },
                            },
                            {
                                name: t("recipient.Removed"),
                                value: RemovedCell,
                                classes: {
                                    name: colorTextStyle.red,
                                    value: colorTextStyle.red,
                                },
                            },
                            {
                                name: t("recipient.Bounced"),
                                value: InvalidCell,
                                classes: {
                                    name: colorTextStyle.red,
                                    value: colorTextStyle.red,
                                },
                            },
                        ]}
                        variant="body1"
                        align="center"
                    />
                </Box>

                {cellIcons}
            </TableCell>
        </TableRow>
    )
}

RenderPhoneRow.propTypes = {
    row: PropTypes.object,
    classes: PropTypes.object,
    name: PropTypes.string,
    cellIcons: PropTypes.any,
    rowStyle: PropTypes.object
    // setDialog: PropTypes.object,
    // handleSelected: PropTypes.func,
    // dateFormat: PropTypes.string,
    // cellStyle: PropTypes.object,
    // selectedGroups: PropTypes.array,
    // DialogType: PropTypes.object,
    // noBorderCellStyle: PropTypes.object,
}

export default RenderPhoneRow
