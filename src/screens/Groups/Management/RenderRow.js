import React, { useState, useEffect, useMemo } from "react";
import DefaultScreen from "../../DefaultScreen";
import PropTypes from 'prop-types';
import clsx from "clsx";
import {
  Typography,
  TableRow,
  TableCell,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";



import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";

import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import IconWrapper from "../../../components/icons/IconWrapper";
import FlexGrid from "../../../components/Grids/FlexGrid";


const RenderWebRow = ({
  row,
  classes,
  setDialog,
  handleSelected,
  dateFormat,
  rowStyle,
  cellStyle,
  selectedGroups = [],
  DialogType = {},
  noBorderCellStyle,
  colorTextStyle,
  setSelectedGroups
}) => {
  const {
    language,
    windowSize,
    email,
    phone,
    rowsPerPage,
    smsOldVersion,
    isRTL,
  } = useSelector((state) => state.core);
  //TODO: Translation left, confirm keys
  const { t } = useTranslation();
  const dispatch = useDispatch();
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
    IsAutoResponder,
    IsConnectedToWebForm,
    AutomationID
  } = row;

  //   const renderCellIcons = (row) => {
  //     const { Status, Groups, AutomationID, Id, AutomationTriggerInActive } = row;

  //     const iconsMap = [
  //       {
  //         key: "send",
  //         icon: SendGreenIcon,
  //         lable: t("campaigns.imgSendResource1.ToolTip"),
  //         remove:
  //           Status !== 1 ||
  //           (AutomationID !== 0 && AutomationTriggerInActive === false),
  //         rootClass: classes.sendIcon,
  //         textClass: classes.sendIconText,
  //         href:
  //           smsOldVersion === "true"
  //             ? `/Pulseem/SendSMSCampaign.aspx?SMSCampaignID=${Id}&Culture=${
  //                 isRTL ? "he-IL" : "en-US"
  //               }`
  //             : `/react/sms/send/${Id}`,
  //       },
  //       {
  //         key: "preview",
  //         icon: PreviewIcon,
  //         lable: t("campaigns.Image1Resource1.ToolTip"),
  //         remove: windowSize === "xs",
  //         rootClass: classes.paddingIcon,
  //         onClick: async () => {
  //           const sms = await dispatch(getSmsByID(Id));
  //           // setDialogType({
  //           //     type: 'preview',
  //           //     data: sms.payload
  //           // })
  //         },
  //       },
  //       {
  //         key: "edit",
  //         icon: EditIcon,
  //         disable: Status !== 1 || AutomationID !== 0,
  //         lable: t("campaigns.Image2Resource1.ToolTip"),
  //         href:
  //           smsOldVersion === "true"
  //             ? `/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=${Id}&Culture=${
  //                 isRTL ? "he-IL" : "en-US"
  //               }`
  //             : `/react/sms/edit/${Id}`,
  //         rootClass: classes.paddingIcon,
  //       },
  //       {
  //         key: "duplicate",
  //         icon: DuplicateIcon,
  //         lable: t("campaigns.lnkEditResource1.ToolTip"),
  //         rootClass: classes.paddingIcon,
  //         onClick: () => {
  //           // setDialogType({
  //           //     type: 'duplicate',
  //           //     data: Id
  //           // })
  //         },
  //       },
  //       {
  //         key: "groups",
  //         icon: GroupsIcon,
  //         disable: Groups && Groups.length === 0,
  //         lable: t("campaigns.lnkPreviewResource1.ToolTip"),
  //         remove: windowSize === "xs",
  //         rootClass: classes.paddingIcon,
  //         onClick: () => {
  //           // setDialogType({
  //           //     type: 'groups',
  //           //     data: row.Groups
  //           // })
  //         },
  //       },
  //       {
  //         key: "automation",
  //         icon: AutomationIcon,
  //         disable: AutomationID === 0,
  //         lable: t("campaigns.automation"),
  //         remove: windowSize === "xs",
  //         onClick: () => {
  //           pulseemNewTab(
  //             `CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`
  //           );
  //         },
  //         rootClass: classes.paddingIcon,
  //       },
  //       {
  //         key: "delete",
  //         icon: DeleteIcon,
  //         lable: t("campaigns.DeleteResource1.HeaderText"),
  //         showPhone: true,
  //         disable: AutomationID !== 0,
  //         rootClass: classes.paddingIcon,
  //         onClick: () => {
  //           // setDialogType({
  //           //     type: 'delete',
  //           //     data: Id
  //           // })
  //         },
  //       },
  //     ];
  //     return (
  //       <Grid
  //         container
  //         direction="row"
  //         justifyContent={windowSize === "xs" ? "flex-start" : "flex-end"}
  //       >
  //         {iconsMap.map((icon) => (
  //           <Grid
  //             className={icon.disable && classes.disabledCursor}
  //             key={icon.key}
  //             item
  //           >
  //             <ManagmentIcon classes={classes} {...icon} />
  //           </Grid>
  //         ))}
  //       </Grid>
  //     );
  //   };

  //   const renderStatusCell = (status) => {
  //     const statuses = {
  //       1: "common.Created",
  //       2: "common.Sending",
  //       3: "campaigns.Stopped",
  //       4: "common.Sent",
  //       5: "campaigns.Canceled",
  //       6: "campaigns.Optin",
  //       7: "campaigns.Approve",
  //     };
  //     return (
  //       <>
  //         <Typography
  //           className={clsx(classes.middleText, classes.recipientsStatus, {
  //             [classes.recipientsStatusCreated]: status === 1,
  //             [classes.recipientsStatusSent]: status === 4,
  //             [classes.recipientsStatusSending]: status === 2,
  //             [classes.recipientsStatusCanceled]: status === 5,
  //           })}
  //         >
  //           {t(statuses[status])}
  //         </Typography>
  //       </>
  //     );
  //   };

  const renderNameCell = (row, fullwidth) => {
    let date = null;
    const { GroupName } = row;
    let text = "";
    if (!row.SendDate) {
      date = moment(row.UpdatedDate, dateFormat);
      text = t("common.UpdatedOn");
    } else {
      date = moment(row.SendDate, dateFormat);
      const dateMillis = date.valueOf();
      const currentDateMillis = moment().valueOf();
      text =
        dateMillis > currentDateMillis
          ? t("common.ScheduledFor")
          : t("common.SentOn");
    }

    return (
      <>
        <CustomTooltip
          isSimpleTooltip={false}
          interactive={true}
          classes={{
            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
            arrow: classes.fBlack,
          }}
          arrow={true}
          style={{ fontSize: 18, fontWeight: "bold" }}
          placement={"top"}
          title={<Typography noWrap={false}>{GroupName}</Typography>}
          text={GroupName}
        >
          {fullwidth ? (
            <Typography
              className={classes.nameEllipsis}
              style={{ maxWidth: "100%" }}
            >
              {GroupName}
            </Typography>
          ) : (
            <Typography className={classes.nameEllipsis}>
              {GroupName}
            </Typography>
          )}
        </CustomTooltip>
        <Typography className={classes.grayTextCell}>
          {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
        </Typography>
      </>
    );
  };

  return (
    <TableRow key={Math.round(Math.random() * 999999999)} classes={rowStyle}>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <Grid container direction="row">
          <Grid item sm={2}>
            <FormControlLabel
              label=""
              className={classes.ml0}
              control={
                <Checkbox
                  checked={selectedGroups?.indexOf(GroupID) !== -1}
                  // indeterminate={}
                  onClick={() => {
                    handleSelected(GroupID);
                  }}
                />
              }
            />
          </Grid>
          <Grid item sm={10}>
            {renderNameCell(row)}
          </Grid>
        </Grid>
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <NameValueGridStructure
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
          gridSize={{ xs: 12, sm: 3 }}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <NameValueGridStructure
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
          gridSize={{ xs: 12, sm: 3 }}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell
        classes={noBorderCellStyle}
        align="center"
        className={classes.flex4}
      >
        <FlexGrid
          gridArr={[
            {
              label: t("recipient.preview"),
              component: (
                <IconWrapper iconName="preview" className={classes.mxAuto} />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.addRecipient"),
              component: (
                <IconWrapper
                  iconName="addRecipient"
                  className={classes.mxAuto}
                />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.addRecipients"),
              component: (
                <IconWrapper
                  iconName="addRecipients"
                  className={classes.mxAuto}
                />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.reset"),
              component: (
                <IconWrapper iconName="reset" className={classes.mxAuto} />
              ),
              classes: { text: classes.wrapText },
            },
            {
              label: t("recipient.settings"),
              component: (
                <IconWrapper iconName="settings" className={classes.mxAuto} />
              ),
              classes: { text: classes.wrapText },
            },
            //TODO: Disable if !== null
            {
              label: t("recipient.automation"),
              component: (
                <IconWrapper iconName="automation" className={AutomationID ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto} />
              ),
              classes: { text: classes.wrapText },
            },
            //TODO: Disable if (IsConnectedToWebForm === true || IsConnectedToWebForm === true)
            {
              label: t("recipient.delete"),
              component: (
                <IconWrapper
                  iconName="delete"
                  className={IsConnectedToWebForm ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}
                  onClick={() => {
                    setSelectedGroups(GroupID)
                    setDialog(DialogType.DELETE_GROUP)
                  }}
                />
              ),
              classes: { text: classes.wrapText },
            },
          ]}
          // direction="column"
          // gridSize={{ xs: 12, sm: 2 }}
          variant="body1"
          align="center"
        />
        {/* <IconWrapper iconName='alert' classes={clsx(classes.dialogAlertIcon, colorTextStyle.red)} />
                    <IconWrapper iconName='copy' classes={colorTextStyle.blue} /> */}
      </TableCell>
    </TableRow>
  );
};


RenderWebRow.propTypes = {
  row: PropTypes.object,
  classes: PropTypes.object,
  setDialog: PropTypes.object,
  handleSelected: PropTypes.func,
  dateFormat: PropTypes.string,
  rowStyle: PropTypes.object,
  cellStyle: PropTypes.object,
  selectedGroups: PropTypes.array,
  DialogType: PropTypes.object,
  noBorderCellStyle: PropTypes.object,
  colorTextStyle: PropTypes.object
}


export default RenderWebRow;
