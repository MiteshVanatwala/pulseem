import PropTypes from 'prop-types';
import clsx from "clsx";
import {
  Typography,
  TableRow,
  TableCell,
  Grid,
  Checkbox,
  FormControlLabel,
  makeStyles,
} from "@material-ui/core";
import { MdOutlineLockClock } from "react-icons/md"
import { RiPagesLine } from "react-icons/ri"



import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";

import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import IconWrapper from "../../../components/icons/IconWrapper";
import FlexGrid from "../../../components/Grids/FlexGrid";
import { useSelector } from 'react-redux';
import { DateFormats } from '../../../helpers/Constants';

const useStyles = makeStyles({
  groupName: {
    "@media screen and (max-width: 1160px)": {
      fontSize: '16px'
    }
  },
  noWrap: {
    whiteSpace: 'nowrap',
    '& p': {
      whiteSpace: 'nowrap',
    }
  },
  dataBox: {
    whiteSpaces: 'nowrap',
    "@media screen and (max-width: 1350px)": {
      fontSize: '14px'
    }
  },
  date: {
    "@media screen and (max-width: 1160px)": {
      fontSize: '13px'
    }
  }
});


const RenderWebRow = ({
  row,
  classes,
  setDialog,
  handleSelected,
  dateFormat,
  rowStyle,
  cellStyle,
  // selectedGroups = [],
  DialogType = {},
  noBorderCellStyle,
  colorTextStyle,
  setSelectedGroups,
  isSelected
}) => {
  //TODO: Translation left, confirm keys
  const { t } = useTranslation();
  const {
    ActiveCell,
    ActiveEmails,
    GroupID,
    InvalidCell,
    InvalidEmails,
    RestrictedEmails,
    RemovedCell,
    RemovedEmails,
    TotalRecipients,
    IsConnectedToWebForm,
    AutomationID,
    IsAutoResponder
  } = row;

  const localClasses = useStyles();
  const { isRTL } = useSelector(state => state.core);
  let iconsCells = [row.IsAutoResponder, row.IsConnectedToWebForm].filter((e) => {
    return e === true
  }).length;

  const REDIRECT_OPTIONS = {
    ShowGroup: 0,
    ShowMails: 10,
    ShowMailsActive: 11,
    ShowMailsRemoved: 12,
    ShowMailsErrored: 13,
    ShowSms: 20,
    ShowSmsActive: 21,
    ShowSmsRemoved: 22,
    ShowSmsErrored: 23
  }

  const renderNameCell = (row, fullwidth) => {
    let date = null;
    const { GroupName } = row;
    let text = "";
    if (!row.UpdateDate) {
      date = moment(row.CreationDate, dateFormat);
      text = t("common.CreatedOn");
    } else {
      date = moment(row.UpdateDate, dateFormat);
      text = t("common.UpdatedOn");
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
          style={{ fontSize: 18 }}
          placement={"top"}
          title={<Typography noWrap={false}>{GroupName}</Typography>}
          text={GroupName}
        >
          {fullwidth ? (
            <Typography
              className={clsx(classes.nameEllipsis, localClasses.groupName)}
              style={{ maxWidth: "100%" }}
            >
              {GroupName}
            </Typography>
          ) : (
            <Typography className={clsx(classes.nameEllipsis, localClasses.groupName)}>
              {GroupName}
            </Typography>
          )}
        </CustomTooltip>
        <Typography className={clsx(classes.grayTextCell, localClasses.date)}>
          {`${text} ${date.format(DateFormats.DATE_TIME_24)}`}
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
              control={
                <Checkbox
                  color="primary"
                  // checked={selectedGroups?.indexOf(GroupID) !== -1}
                  checked={isSelected}
                  // indeterminate={}
                  onClick={handleSelected}
                />
              }
            />
          </Grid>
          <Grid item sm={10 - iconsCells}>
            {renderNameCell(row)}
          </Grid>
          {
            row.IsAutoResponder === true ? (
              <Grid item sm={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CustomTooltip
                  isSimpleTooltip={true}
                  interactive={false}
                  classes={{
                    tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                    arrow: classes.fBlack,
                  }}
                  arrow={true}
                  style={{ fontSize: 18 }}
                  placement={"top"}
                  icon={<MdOutlineLockClock style={{ fontSize: 24 }} />}
                  text={
                    <Typography noWrap={false} className={classes.tooltipText}
                      style={{ direction: isRTL ? 'rtl' : 'ltr', color: '#fff' }}>{t("group.autoResponderConnected")}</Typography>}
                ></CustomTooltip>
              </Grid>
            ) : null
          }
          {
            row.IsConnectedToWebForm === true ? (
              <Grid item sm={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CustomTooltip
                  isSimpleTooltip={true}
                  iconStyle={{ color: '#000' }}
                  interactive={false}
                  classes={{
                    tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                    arrow: classes.fBlack,
                  }}
                  arrow={true}
                  style={{ fontSize: 18 }}
                  placement={"top"}
                  icon={<RiPagesLine style={{ fontSize: 24 }} />}
                  text={
                    <Typography noWrap={false} className={classes.tooltipText}>{t("group.webformConnected")}</Typography>}
                ></CustomTooltip>
              </Grid>
            ) : null
          }
        </Grid>
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <NameValueGridStructure
          gridArr={[
            {
              name: t("campaigns.recipients"),
              value: (ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0),
              classes: {
                name: clsx(colorTextStyle.blue, localClasses.dataBox),
                value: colorTextStyle.blue,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowMails}&GroupID=${GroupID}`)
            },
            {
              name: t("recipient.Active"),
              value: ActiveEmails,
              classes: {
                name: clsx(colorTextStyle.green, localClasses.dataBox),
                value: colorTextStyle.green,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowMailsActive}&GroupID=${GroupID}`)
            },
            {
              name: t("recipient.Removed"),
              value: RemovedEmails,
              classes: {
                name: clsx(colorTextStyle.red, localClasses.dataBox),
                value: colorTextStyle.red,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowMailsRemoved}&GroupID=${GroupID}`)
            },
            {
              name: t("recipient.Bounced"),
              value: InvalidEmails,
              classes: {
                name: clsx(colorTextStyle.red, localClasses.dataBox),
                value: colorTextStyle.red,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowMailsErrored}&GroupID=${GroupID}`)
            },
          ]}
          gridSize={{ xs: 12, sm: 12, md: 6, lg: 3 }}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex2}>
        <NameValueGridStructure
          gridArr={[
            {
              name: t("campaigns.recipients"),
              value: (ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0),
              classes: {
                name: clsx(colorTextStyle.blue, localClasses.dataBox),
                value: colorTextStyle.blue,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowSms}&GroupID=${GroupID}`)
            },
            {
              name: t("recipient.Active"),
              value: ActiveCell,
              classes: {
                name: clsx(colorTextStyle.green, localClasses.dataBox),
                value: colorTextStyle.green,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowSmsActive}&GroupID=${GroupID}`)
            },
            {
              name: t("recipient.Removed"),
              value: RemovedCell,
              classes: {
                name: clsx(colorTextStyle.red, localClasses.dataBox),
                value: colorTextStyle.red,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowSmsRemoved}&GroupID=${GroupID}`)
            },
            {
              name: t("recipient.Bounced"),
              value: InvalidCell,
              classes: {
                name: clsx(colorTextStyle.red, localClasses.dataBox),
                value: colorTextStyle.red,
              },
              onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowSmsErrored}&GroupID=${GroupID}`)
            },
          ]}
          gridSize={{ xs: 12, sm: 12, md: 6, lg: 3 }}
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
              onClick: () => {
                window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=0&GroupID=${GroupID}`)
              },
              label: t("recipient.preview"),
              component: (
                <IconWrapper iconName="preview" className={classes.mxAuto} />
              ),
              classes: { text: localClasses.noWrap },
            },
            {
              onClick: () => {
                setSelectedGroups()
                setDialog(DialogType.ADD_RECIPIENT)
              },
              label: t("recipient.addRecipient"),
              component: (
                <IconWrapper
                  iconName="addRecipient"
                  className={classes.mxAuto}

                />
              ),
              classes: { text: localClasses.noWrap },
            },
            {
              onClick: () => {
                setSelectedGroups()
                setDialog(DialogType.ADD_RECIPIENTS)
              },
              label: t("recipient.addRecipients"),
              component: (
                <IconWrapper
                  iconName="addRecipients"
                  className={classes.mxAuto}
                />
              ),
              classes: { text: localClasses.noWrap },
            },
            {
              onClick: () => {
                setSelectedGroups()
                setDialog(DialogType.RESET_GROUP)
              },
              label: t("recipient.reset"),
              component: (
                <IconWrapper iconName="reset" className={classes.mxAuto} />
              ),
              classes: { text: localClasses.noWrap },
            },
            {
              onClick: () => {
                setSelectedGroups()
                setDialog(DialogType.EDIT_GROUP)
              },
              label: t("recipient.settings"),
              component: (
                <IconWrapper iconName="settings" className={classes.mxAuto}

                />

              ),
              classes: { text: localClasses.noWrap },
            },
            //TODO: Disable if !== null
            {
              label: t("recipient.automation"),
              component: (
                <IconWrapper iconName="automation" className={!AutomationID ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}
                  onClick={() => {
                    if (AutomationID)
                      window.open(`/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`, '_blank');
                  }}
                />
              ),
              classes: { text: clsx(localClasses.noWrap, !AutomationID ? classes.disabled : null) },
              isDisabled: !AutomationID
            },
            //TODO: Disable if (IsConnectedToWebForm === true || IsConnectedToWebForm === true)
            {
              onClick: () => {
                if (!(AutomationID || IsConnectedToWebForm || IsAutoResponder)) {
                  setSelectedGroups()
                  setDialog(DialogType.DELETE_GROUP)
                }
              },
              label: t("recipient.delete"),
              component: (
                <IconWrapper
                  iconName="delete"
                  className={(AutomationID || IsConnectedToWebForm || IsAutoResponder) ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}

                />
              ),
              classes: { text: clsx(localClasses.noWrap, (AutomationID || IsConnectedToWebForm || IsAutoResponder) ? classes.disabled : null) },
              isDisabled: (AutomationID || IsConnectedToWebForm || IsAutoResponder)
            },
          ]}
          variant="body1"
          align="center"
        />
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
  // selectedGroups: PropTypes.array,
  DialogType: PropTypes.object,
  noBorderCellStyle: PropTypes.object,
  colorTextStyle: PropTypes.object
}


export default RenderWebRow;
