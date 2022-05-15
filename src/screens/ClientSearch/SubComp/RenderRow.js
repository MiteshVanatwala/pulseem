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
// import FlexGrid from "../../../components/";
import { useSelector } from 'react-redux';

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
  selectedClients = [],
  DialogType = {},
  noBorderCellStyle,
  colorTextStyle,
  setSelectedGroups
}) => {
  //TODO: Translation left, confirm keys
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
    const { FirstName, LastName, CreationDate } = row;
    let text = t("common.UpdatedOn");
    date = moment(row.CreationDate, dateFormat);

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
          title={<Typography noWrap={false}>{FirstName}{LastName}</Typography>}
          text={`${FirstName} ${LastName}`}
        >
          {fullwidth ? (
            <Typography
              className={clsx(classes.nameEllipsis, localClasses.groupName)}
              style={{ maxWidth: "100%" }}
            >
              {FirstName}{LastName}
            </Typography>
          ) : (
            <Typography className={clsx(classes.nameEllipsis, localClasses.groupName)}>
              {FirstName}{LastName}
            </Typography>
          )}
        </CustomTooltip>
        <Typography className={clsx(classes.grayTextCell, localClasses.date)}>
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
              control={
                <Checkbox
                  color="primary"
                  checked={selectedClients?.indexOf(ClientID) !== -1}
                  // indeterminate={}
                  onClick={() => {
                    handleSelected(ClientID);
                  }}
                />
              }
            />
          </Grid>
          <Grid item sm={10 - iconsCells}>
            {renderNameCell(row)}
          </Grid>

        </Grid>
      </TableCell>
      <TableCell
        classes={cellStyle}
        align="center"
        className={classes.flex3}
      >
        <FlexGrid
          gridArr={[
            {
              // onClick: () => {
              //   window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=0&GroupID=${GroupID}`)
              // },
              label: t("common.edit"),
              component: (
                <IconWrapper iconName="edit" className={classes.mxAuto} />
              ),
              classes: { text: localClasses.noWrap },
            },
            {
              // onClick: () => {
              //   setSelectedGroups(GroupID)
              //   setDialog(DialogType.EDIT_GROUP)
              // },
              label: t("recipient.deleteFromGroups"),
              component: (
                <IconWrapper iconName="deleteRecipient" className={classes.mxAuto}

                />

              ),
              classes: { text: localClasses.noWrap },
            },
            //TODO: Disable if !== null
            {
              label: t("recipient.deleteEmail"),
              component: (
                <IconWrapper iconName="deleteEmail"
                // className={!AutomationID ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}
                // onClick={() => {
                //   if (AutomationID)
                //     window.open(`/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`, '_blank');
                // }}
                />
              ),
              classes: { text: clsx(localClasses.noWrap) },
              // isDisabled: !AutomationID
            },
            //TODO: Disable if (IsConnectedToWebForm === true || IsConnectedToWebForm === true)
            {
              // onClick: () => {
              //   if (!(AutomationID || IsConnectedToWebForm || IsAutoResponder)) {
              //     setSelectedGroups(GroupID)
              //     setDialog(DialogType.DELETE_GROUP)
              //   }
              // },
              label: t("recipient.deletePhone"),
              component: (
                <IconWrapper
                  iconName="deletePhone"
                // className={(AutomationID || IsConnectedToWebForm || IsAutoResponder) ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}

                />
              ),
              classes: { text: clsx(localClasses.noWrap) },
              // isDisabled: (AutomationID || IsConnectedToWebForm || IsAutoResponder)
            },
          ]}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={clsx(classes.bold, classes.flex1)}>
        {Revenue}
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex3}>
        <FlexGrid
          customStyle={{ justifyContent: 'space-between' }}
          gridArr={[
            {
              label: t(""),
              component: (
                <Typography className={classes.bold}>{Email}</Typography>
              ),
              classes: { text: localClasses.noWrap },
            },
            {
              label: "",
              component: <Typography className={clsx(classes.bold, Status === 1 ? classes.sendIconText : classes.textColorRed)}>{Status === 1 ? t("common.statusActive") : t("common.Unsubscribed")}</Typography>,
              classes: { text: localClasses.noWrap },
            }
          ]}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex2} style={{ border: 'none' }}>
        <FlexGrid
          customStyle={{ justifyContent: 'space-between' }}
          gridArr={[
            {
              label: t(""),
              component: (
                <Typography className={classes.bold}>{Cellphone}</Typography>
              ),
              classes: { text: localClasses.noWrap },
            },
            {
              label: "",

              component: <Typography className={clsx(classes.bold, SmsStatus === 0 ? classes.sendIconText : classes.textColorRed)}>{SmsStatus === 0 ? t("common.statusActive") : t("common.Unsubscribed")}</Typography>,
              classes: { text: localClasses.noWrap },
            }
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
  selectedClients: PropTypes.array,
  DialogType: PropTypes.object,
  noBorderCellStyle: PropTypes.object,
  colorTextStyle: PropTypes.object
}


export default RenderWebRow;
