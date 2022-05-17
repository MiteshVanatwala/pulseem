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
import { ManagmentIcon } from '../../../components/managment';
import {
  EditIcon,
  DeleteRecipient,
  DeleteEmail,
  DeletePhone
} from "../../../assets/images/managment/index";

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
  setSelectedGroups,
  windowSize
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


  const renderCellIcons = () => {
    // const { Status, Groups, AutomationID, Id, AutomationTriggerInActive } = row

    const iconsMap = [
      {
        key: 'edit',
        icon: EditIcon,
        lable: t("common.edit"),
        // remove: Status !== 1 || (AutomationID !== 0 && AutomationTriggerInActive === false),
        rootClass: classes.paddingIcon,
        // textClass: classes.sendIconText,
        // href: smsOldVersion === "true" ? `/Pulseem/SendSMSCampaign.aspx?SMSCampaignID=${Id}&Culture=${isRTL ? 'he-IL' : 'en-US'}` : `/react/sms/send/${Id}`
      },

      {
        key: 'deleteFromGroups',
        icon: DeleteRecipient,
        // disable: Status !== 1 || AutomationID !== 0,
        lable: t("recipient.deleteFromGroups"),
        // href: smsOldVersion === "true" ? `/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=${Id}&Culture=${isRTL ? 'he-IL' : 'en-US'}` : `/react/sms/edit/${Id}`,
        rootClass: classes.paddingIcon
      },
      {
        key: 'deleteFromEmail',
        icon: DeleteEmail,
        lable: t("recipient.deleteEmail"),
        rootClass: classes.paddingIcon,
        // onClick: () => {
        //   setDialogType({
        //     type: 'duplicate',
        //     data: Id
        //   })
        // }
      },
      {
        key: 'deleteFromPhone',
        icon: DeletePhone,
        // disable: Groups && Groups.length === 0,
        lable: t("recipient.deletePhone"),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        // onClick: () => {
        //   setDialogType({
        //     type: 'groups',
        //     data: row.Groups
        //   })
        // }
      },

    ]
    return (
      <Grid
        container
        direction='row'
        justifyContent={windowSize === 'xs' ? 'flex-start' : 'space-evenly'}>
        {iconsMap.map(icon => (
          <Grid
            className={icon.disable && classes.disabledCursor}
            key={icon.key}
            item >
            <ManagmentIcon
              classes={classes}
              {...icon}
            />
          </Grid>
        ))}
      </Grid>
    )
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
            arrow: classes.fBlack
          }}
          arrow={true}
          style={{ fontSize: 18, fontWeight: 'bold' }}
          placement={'top'}
          title={<Typography noWrap={false}>{FirstName}{LastName}</Typography>}
          text={`${FirstName} ${LastName}`}

        >
          <Typography noWrap={false} style={{ minHeight: 28 }} className={classes.nameEllipsis}>{FirstName}{LastName}</Typography>
        </CustomTooltip>
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
        </Typography>
      </>

    );
  };

  const switchStatus = (isEmail) => {
    if (Email && isEmail && Email !== '') {
      return Status === 1 ? t("common.statusActive") : t("common.Unsubscribed")
    }
    else if (Cellphone && !isEmail && Cellphone !== '') {
      return SmsStatus === 0 ? t("common.statusActive") : t("common.Unsubscribed")
    }
    return t("emailStatus.noStatus")
  }
  const cssClasses = (isEmail) => {
    if (isEmail) {
      return Status === 1 ? classes.sendIconText : Email ? classes.textColorRed : classes.textColorBlue;
    }
    else {
      return SmsStatus === 0 ? classes.sendIconText : Cellphone ? classes.textColorRed : classes.textColorBlue
    }
  }

  return (
    <TableRow key={Math.round(Math.random() * 999999999)} classes={rowStyle}>
      <TableCell classes={cellStyle} align="center" className={classes.flex4}>
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
        className={classes.flex6}
      >
        {renderCellIcons()}
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={clsx(classes.bold, classes.flex2)}>
        {Revenue} {t("common.NIS")}
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex4}>
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
              component: <Typography className={clsx(classes.bold, cssClasses(true))}>{switchStatus(true)}</Typography>,
              classes: { text: localClasses.noWrap },
            }
          ]}
          variant="body1"
          align="center"
        />
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex3} style={{ border: 'none' }}>
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

              component: <Typography className={clsx(classes.bold, cssClasses(false))}>{switchStatus(false)}</Typography>,
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
