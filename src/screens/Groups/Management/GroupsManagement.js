import React, { useState, useEffect, useMemo } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
  Typography,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer,
  Grid,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  makeStyles,
  useTheme,
  Dialog,
} from "@material-ui/core";
import {
  AutomationIcon,
  DeleteIcon,
  DuplicateIcon,
  EditIcon,
  SendGreenIcon,
  SearchIcon,
  GroupsIcon,
  PreviewIcon,
  ExportIcon,
  AddRecipient,
} from "../../../assets/images/managment/index";
import { CSVLink } from "react-csv";
import {
  TablePagination,
  ManagmentIcon,
  DateField,
  SearchField,
  RestorDialogContent,
} from "../../../components/managment/index";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import {
  getSmsData,
  restoreSms,
  deleteSms,
  duplicteSms,
  getSmsAuthorizationData,
  getAuthorizeNumbers,
  sendVerificationCode,
  verifyCode,
  getSmsByID,
} from "../../../redux/reducers/smsSlice";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import ClearIcon from "@material-ui/icons/Clear";
import moment from "moment";
import "moment/locale/he";
import { Preview } from "../../../components/Notifications/Preview/Preview";
import { pulseemNewTab } from "../../../helpers/functions";
import { Loader } from "../../../components/Loader/Loader";
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import { setCookie } from "../../../helpers/cookies";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import DataTable from "../../../components/Table/DataTable";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import IconWrapper from "../../../components/icons/IconWrapper";
import FlexGrid from "../../../components/Grids/FlexGrid";
import { ExcelData, StaticData } from "../tempConstants";
import { GrGroup } from "react-icons/gr";
import { BsInfoSquare } from "react-icons/bs";
import { exportFile } from "../../../helpers/exportFromJson";
import { preferredOrder } from "../../../helpers/exportHelper";
import RenderRow from "./RenderRow";

const GroupsManagement = ({ classes }) => {
  const {
    language,
    windowSize,
    email,
    phone,
    rowsPerPage,
    smsOldVersion,
    isRTL,
  } = useSelector((state) => state.core);

  // const { smsData, smsDataError, smsDeletedData, authorizationData } = useSelector(state => state.sms)
  // const { username } = useSelector(state => state.user)
  const { t } = useTranslation();
  const [filteredData, setFilteredData] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchStr, setSearchStr] = useState("");
  const [filter, setFilter] = useState(false);
  // const [fromDate, handleFromDate] = useState(null);
  // const [toDate, handleToDate] = useState(null);
  // const [number, handleNumber] = useState('');
  // const [numberError, handleNumberError] = useState(false);
  // const [verificationCode, handleVerificationCodeInput] = useState('');
  // const [verificationCodeError, handleVerificationCodeError] = useState(false);
  const [groupNameSearch, setGroupNameSearch] = useState("");
  // const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1);
  // const [isSearching, setSearching] = useState(false)
  // const [searchResults, setSearchResults] = useState(null)
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = {
    head: classes.tableCellHead,
    body: classes.tableCellBody,
    root: classes.tableCellRoot,
  };
  const noBorderCellStyle = {
    body: classes.tableCellBodyNoBorder,
    root: clsx(classes.tableCellRoot, classes.minWidth50),
  };
  const [dialog, setDialog] = useState(null);
  // const [dialog1, setDialog1] = useState(false)
  // const [restoreArray, setRestoreArray] = useState([])
  // const [showLoader, setLoader] = useState(true);
  const dateFormat = "YYYY-MM-DD HH:mm:ss.FFF";
  const dispatch = useDispatch();
  moment.locale(language);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const colorTextStyle = {
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText,
  };

  const DialogType = {
    ADD_GROUP: "addGroup",
    DELETE_GROUP: "delete group",
  };

  const HeaderCheck = (label) => (
    <FormControlLabel
      label={label}
      className={(classes.ml0, classes.dNone)}
      control={
        <Checkbox
          className={clsx(classes.pt0, classes.pb0)}
          checked={selectedGroups.length === filteredData.length}
          // indeterminate={}
          onClick={() => {
            if (selectedGroups.length === filteredData.length) {
              return setSelectedGroups([]);
            }
            const allGroups = filteredData.reduce(
              (previous, current) => [...previous, current.GroupID],
              []
            );
            setSelectedGroups(allGroups);
          }}
        />
      }
    />
  );

  const TABLE_HEAD = [
    {
      label: t("common.GroupName"),
      classes: cellStyle,
      className: classes.flex2,
      align: "center",
    },
    {
      label: t("recipient.emails"),
      classes: cellStyle,
      className: classes.flex2,
      align: "center",
    },
    {
      label: t("recipient.sms/mms"),
      classes: cellStyle,
      className: classes.flex2,
      align: "center",
    },
    {
      label: "",
      classes: cellStyle,
      className: classes.flex4,
      align: "center",
    },
  ];

  const getData = async () => {
    await dispatch(getSmsData());
    // setLoader(false);
  };

  useEffect(() => {
    // setLoader(true);
    // getData();
    handleSearch(searchStr);
  }, [dispatch]);

  //  HANDLERS  //

  const exportColumnHeader = {
    SMSStatus: t("smsStatus"),
    CreationDate: t("creationDate"),
    FirstName: t("firstName"),
    Name: t("name"),
    Email: t("email"),
    Telephone: t("telephone"),
    Cellphone: t("cellphone"),
    Address: t("address"),
    BirthdayDate: t("birthdayDate"),
    City: t("city"),
    State: t("state"),
    Country: t("country"),
    Zip: t("zip"),
    Company: t("company"),
    ReminderDate: t("reminderDate"),
    ErrorMessage: t("errorMessage"),
  };

  const handleDownloadCsv = async () => {
    let orderList = preferredOrder(ExcelData, Object.keys(exportColumnHeader));
    // orderList = await statusNumberToString(t, orderList, MMSReportStatus);
    // orderList = await formatDateTime(orderList, t);
    // orderList = await booleanToNumber(orderList, 'IsResponse', true, t);
    exportFile({
      data: orderList,
      fileName: "mmsReport",
      exportType: "csv",
      fields: exportColumnHeader,
    });
  };

  const handleSearch = (values) => {
    const data = StaticData; //TODO: Replace StaticData from Data from redux
    const result = data.filter((obj) => obj.GroupName.includes(values));
    setFilteredData(result);
    console.log("RESULT:", result);
    setPage(1);
  };

  const handleSelected = (id) => {
    const index = selectedGroups.indexOf(id);
    if (index !== -1) {
      let temp = [...selectedGroups];
      temp.splice(index, 1);
      setSelectedGroups([...temp]);
      // setSelectedGroups(temp)
    } else setSelectedGroups([...selectedGroups, id]);
  };

  //  COMPONENTS  //

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t("recipient.logPageHeaderResource1.Text")}
        </Typography>
        <Divider />
      </>
    );
  };

  // DONE
  const renderSearchLine = () => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 || event.code === "Enter") {
        handleSearch(searchStr);
      }
    };

    const handleKeyPress = (e) => {
      if (e.charCode === 13 || e.code === "Enter") {
        handleSearch(searchStr);
      }
    };

    const handleGroupNameChange = (event) => {
      setGroupNameSearch(event.target.value);
    };

    if (windowSize === "xs") {
      return (
        <SearchField
          classes={classes}
          value={searchStr}
          onChange={(e) => setSearchStr(e.target.value)}
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
          placeholder={t("common.CampaignName")}
        />
      );
    }

    return (
      <Grid container spacing={2} className={classes.lineTopMarging}>
        <Grid item>
          <TextField
            variant="outlined"
            size="small"
            value={searchStr}
            onKeyPress={handleKeyDown}
            onChange={(e) => setSearchStr(e.target.value)}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t("common.GroupName")}
          />
        </Grid>
        <Grid item>
          <Button
            size="large"
            variant="contained"
            onClick={() => {
              handleSearch(searchStr);
              setFilter(true);
            }}
            className={classes.searchButton}
            endIcon={<SearchIcon />}
          >
            {t("campaigns.btnSearchResource1.Text")}
          </Button>
        </Grid>
        {searchStr && (
          <Grid item>
            <Button
              size="large"
              variant="contained"
              onClick={() => {
                setSearchStr("");
                if (filter) {
                  handleSearch("");
                  setFilter(false);
                }
              }}
              className={classes.searchButton}
              endIcon={<ClearIcon />}
            >
              {t("common.clear")}
            </Button>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderManagmentLine = () => {
    // const handleVerificationDialog = async () => {
    //     const numbers = await dispatch(getAuthorizeNumbers());
    //     setDialogType({
    //         type: 'verify',
    //         data: numbers.payload
    //     })
    // }
    return (
      <Grid container spacing={2} className={classes.linePadding}>
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            // href={smsOldVersion === "true" ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${isRTL ? 'he-IL' : 'en-US'}` : "/react/sms/create"}
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}
            onClick={() => setDialog(DialogType.ADD_GROUP)}
          >
            {t("group.new")}
          </Button>
        </Grid>

        {windowSize !== "xs" && (
          <Grid item>
            <Button
              variant="contained"
              size="medium"
              className={clsx(classes.actionButton, classes.actionButtonRed)}
              onClick={() => setDialog(DialogType.DELETE_GROUP)}
            >
              {t("group.delete")}
            </Button>
          </Grid>
        )}
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            href={
              smsOldVersion === "true"
                ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${
                    isRTL ? "he-IL" : "en-US"
                  }`
                : "/react/sms/create"
            }
            className={clsx(classes.actionButton, classes.actionButtonRed)}
          >
            {t("recipient.deleteRecipient")}
          </Button>
        </Grid>
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            href={
              smsOldVersion === "true"
                ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${
                    isRTL ? "he-IL" : "en-US"
                  }`
                : "/react/sms/create"
            }
            className={clsx(classes.actionButton, classes.actionButtonRed)}
          >
            {t("recipient.unsubscribe")}
          </Button>
        </Grid>
        {/* <Grid item xs={windowSize === 'xs' && 12}> */}
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            className={clsx(
              classes.actionButton,
              classes.actionButtonGreen
              //   smsReport.length > 0 ? null : classes.disabled
            )}
            onClick={handleDownloadCsv}
            // onClick={() => true}
            startIcon={<ExportIcon />}
          >
            {t("campaigns.exportFile")}
          </Button>
          <CSVLink
            // data={csvData ?? null}
            data={[
              ["firstname", "lastname", "email"],
              ["Ahmed", "Tomi", "ah@smthing.co.com"],
              ["Raed", "Labes", "rl@smthing.co.com"],
              ["Yezzi", "Min l3b", "ymin@cocococo.com"],
            ]}
            filename="report.csv"
            className="hidden"
            // ref={csvLinkRef ?? null}
            ref={null}
            target="_blank"
          />
        </Grid>
        {/* </Grid> */}

        <Grid
          item
          xs={windowSize === "xs" && 12}
          className={classes.groupsLableContainer}
        >
          <Typography className={classes.groupsLable}>
            {`${filteredData.length} ${t("mms.campaigns")}`}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderCellIcons = (row) => {
    const { Status, Groups, AutomationID, Id, AutomationTriggerInActive } = row;

    const iconsMap = [
      {
        key: "send",
        icon: SendGreenIcon,
        lable: t("campaigns.imgSendResource1.ToolTip"),
        remove:
          Status !== 1 ||
          (AutomationID !== 0 && AutomationTriggerInActive === false),
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        href:
          smsOldVersion === "true"
            ? `/Pulseem/SendSMSCampaign.aspx?SMSCampaignID=${Id}&Culture=${
                isRTL ? "he-IL" : "en-US"
              }`
            : `/react/sms/send/${Id}`,
      },
      {
        key: "preview",
        icon: PreviewIcon,
        lable: t("campaigns.Image1Resource1.ToolTip"),
        remove: windowSize === "xs",
        rootClass: classes.paddingIcon,
        onClick: async () => {
          const sms = await dispatch(getSmsByID(Id));
          // setDialogType({
          //     type: 'preview',
          //     data: sms.payload
          // })
        },
      },
      {
        key: "edit",
        icon: EditIcon,
        disable: Status !== 1 || AutomationID !== 0,
        lable: t("campaigns.Image2Resource1.ToolTip"),
        href:
          smsOldVersion === "true"
            ? `/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=${Id}&Culture=${
                isRTL ? "he-IL" : "en-US"
              }`
            : `/react/sms/edit/${Id}`,
        rootClass: classes.paddingIcon,
      },
      {
        key: "duplicate",
        icon: DuplicateIcon,
        lable: t("campaigns.lnkEditResource1.ToolTip"),
        rootClass: classes.paddingIcon,
        onClick: () => {
          // setDialogType({
          //     type: 'duplicate',
          //     data: Id
          // })
        },
      },
      {
        key: "groups",
        icon: GroupsIcon,
        disable: Groups && Groups.length === 0,
        lable: t("campaigns.lnkPreviewResource1.ToolTip"),
        remove: windowSize === "xs",
        rootClass: classes.paddingIcon,
        onClick: () => {
          // setDialogType({
          //     type: 'groups',
          //     data: row.Groups
          // })
        },
      },
      {
        key: "automation",
        icon: AutomationIcon,
        disable: AutomationID === 0,
        lable: t("campaigns.automation"),
        remove: windowSize === "xs",
        onClick: () => {
          pulseemNewTab(
            `CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`
          );
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: "delete",
        icon: DeleteIcon,
        lable: t("campaigns.DeleteResource1.HeaderText"),
        showPhone: true,
        disable: AutomationID !== 0,
        rootClass: classes.paddingIcon,
        onClick: () => {
          // setDialogType({
          //     type: 'delete',
          //     data: Id
          // })
        },
      },
    ];
    return (
      <Grid
        container
        direction="row"
        justifyContent={windowSize === "xs" ? "flex-start" : "flex-end"}
      >
        {iconsMap.map((icon) => (
          <Grid
            className={icon.disable && classes.disabledCursor}
            key={icon.key}
            item
          >
            <ManagmentIcon classes={classes} {...icon} />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderStatusCell = (status) => {
    const statuses = {
      1: "common.Created",
      2: "common.Sending",
      3: "campaigns.Stopped",
      4: "common.Sent",
      5: "campaigns.Canceled",
      6: "campaigns.Optin",
      7: "campaigns.Approve",
    };
    return (
      <>
        <Typography
          className={clsx(classes.middleText, classes.recipientsStatus, {
            [classes.recipientsStatusCreated]: status === 1,
            [classes.recipientsStatusSent]: status === 4,
            [classes.recipientsStatusSending]: status === 2,
            [classes.recipientsStatusCanceled]: status === 5,
          })}
        >
          {t(statuses[status])}
        </Typography>
      </>
    );
  };

  const handleRowsPerPageChange = (val) => {
    dispatch(setRowsPerPage(val));
    setCookie("rpp", val, { maxAge: 2147483647 });
  };

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

  const renderRow = (row) => {
    //TODO: Translation left, confirm keys

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
      <TableRow key={Math.round(Math.random() * 999999999)} classes={rowStyle}>
        <TableCell classes={cellStyle} align="center" className={classes.flex2}>
          <Grid container direction="row">
            <Grid item sm={2}>
              <FormControlLabel
                label=""
                className={classes.ml0}
                control={
                  <Checkbox
                    checked={selectedGroups.indexOf(GroupID) !== -1}
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
                name: t("recipient.totalRecipients"),
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
                name: t("recipient.totalRecipients"),
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
                  <IconWrapper
                    iconName="automation"
                    className={classes.mxAuto}
                  />
                ),
                classes: { text: classes.wrapText },
              },
              //TODO: Disable if (IsConnectedToWebForm === true || IsConnectedToWebForm === true)
              {
                label: t("recipient.delete"),
                component: (
                  <IconWrapper
                    iconName="delete"
                    className={classes.mxAuto}
                    onClick={() => setDialog(DialogType.DELETE_GROUP)}
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

  const renderPhoneRow = (row) => {
    //PENDING
    return (
      <TableRow key={row.Id} component="div" classes={rowStyle}>
        <TableCell
          style={{ flex: 1 }}
          classes={{ root: classes.tableCellRoot }}
        >
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>{renderNameCell(row)}</Box>
            <Box>{renderStatusCell(row.Status)}</Box>
          </Box>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    );
  };

  const renderTableBody = useMemo(() => {
    let sortData = filteredData;
    let rpp = parseInt(rowsPerPage);
    sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp);
    return (
      <TableBody>
        {sortData.map(windowSize === "xs" ? renderPhoneRow : renderRow)}
      </TableBody>
      //   <RenderRow
      //   row
      //   classes
      //   setDialog={(val) => setDialog(val)}
      //   handleSelected={(id) => handleSelected(id)}
      //   selectedGroups
      //   DialogType
      //   dateFormat
      //   rowStyle
      //   cellStyle
      //   noBorderCellStyle
      // />
    );
  }, [filteredData, rowsPerPage, page, classes, selectedGroups]);

  //POPUP Components
  const AddGroupPopUp = () => {
    const DEFAULT_NEW_GROUP = {
      ActiveCell: 0,
      ActiveEmails: 0,
      DynamicData: null,
      DynamicLastUpdate: null,
      DynamicUpdatePolicy: null,
      GroupID: null,
      InvalidCell: 0,
      InvalidEmails: 0,
      IsDynamic: true,
      IsTestGroup: null,
      PendingEmails: 0,
      Recipients: 0,
      RemovedCell: 0,
      RemovedEmails: 0,
      RestrictedEmails: 0,
      SubAccountID: 0,
      TotalRecipients: 0,
      GroupName: "",
      UpdatedDate: new Date(),
      CreatedDate: new Date(),
    };
    const [newGroupData, setNewGroupData] = useState(DEFAULT_NEW_GROUP);
    return (
      <Dialog
        fullScreen={classes.fullScreen}
        open={dialog === DialogType.ADD_GROUP}
        onClose={() => setDialog(null)}
        aria-labelledby="responsive-dialog-title"
        className={classes.customDialog}
      >
        <Box className={classes.customDialogIconBox}>
          <GrGroup size={60} />
        </Box>
        <Box className={classes.customDialogInnerbox}>
          <DialogTitle
            id="responsive-dialog-title"
            className={classes.customDialogTitle}
          >
            Create New Group
          </DialogTitle>
          <DialogContent>
            <Box className={classes.customDialogContentBox}>
              <Typography>Group Name:</Typography>
              <TextField
                id="outlined-basic"
                label=""
                variant="outlined"
                value={newGroupData.GroupName}
                onChange={(e) => {
                  e.preventDefault();
                  console.log("DATA:", newGroupData, e.target.value);
                  setNewGroupData({
                    ...newGroupData,
                    GroupName: e.target.value,
                  });
                }}
              />
              <FormControlLabel
                control={<Checkbox name="testGroup" size="small" />}
                label="Test Group"
              />
              <BsInfoSquare />
            </Box>
            <Box>
              <Grid container spacing={2} className={classes.linePadding}>
                <Grid
                  item
                  xs={windowSize === "xs" && 12}
                  sm={4}
                  className={classes.txtCenter}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    className={clsx(
                      classes.actionButton,
                      classes.actionButtonRed,
                      classes.fullWidth
                    )}
                    onClick={() => setDialog(null)}
                  >
                    {t("group.cancel")}
                  </Button>
                </Grid>
                <Grid
                  item
                  xs={windowSize === "xs" && 12}
                  sm={4}
                  className={classes.txtCenter}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    className={clsx(
                      classes.actionButton,
                      classes.actionButtonLightGreen,
                      classes.fullWidth
                    )}
                    // onClick={
                    //TODO: ADD ADD Recipient Functionality
                    //     () => setDialogType({
                    //     type: 'restore',
                    //     data: smsDeletedData
                    // })
                    // }
                  >
                    {t("recipient.addRecipient")}
                  </Button>
                </Grid>
                <Grid
                  item
                  xs={windowSize === "xs" && 12}
                  sm={4}
                  className={classes.txtCenter}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    className={clsx(
                      classes.actionButton,
                      classes.actionButtonLightGreen,
                      classes.fullWidth
                    )}
                    onClick={
                      //TODO: Make handler with api
                      () => {
                        const data = {
                          ...newGroupData,
                          GroupID: Math.random() * 1000000,
                        };
                        setFilteredData([...filteredData, data]);
                        setNewGroupData(DEFAULT_NEW_GROUP);
                        setDialog(null);
                      }
                    }
                  >
                    {t("group.ok")}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Box>
      </Dialog>
    );
  };

  const ConfirmDeletePopUp = () => {
    // const [newGroupData, setNewGroupData] = useState(DEFAULT_NEW_GROUP)
    return (
      <Dialog
        fullScreen={classes.fullScreen}
        open={dialog === DialogType.DELETE_GROUP}
        onClose={() => setDialog(null)}
        aria-labelledby="responsive-dialog-title"
        className={classes.customDialog}
      >
        <Box className={classes.customDialogIconBox}>
          <GrGroup size={60} />
        </Box>
        <Box className={classes.customDialogInnerbox}>
          <DialogTitle
            id="responsive-dialog-title"
            className={classes.customDialogTitle}
          >
            Delete Group
          </DialogTitle>
          <DialogContent>
            <Box>
              <Typography variant="subtitle1">
                Are you sure you want to delete following group
              </Typography>
            </Box>
            <Box>
              <Grid container spacing={2} className={classes.linePadding}>
                <Grid
                  item
                  xs={windowSize === "xs" && 12}
                  sm={4}
                  className={classes.txtCenter}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    className={clsx(
                      classes.actionButton,
                      classes.actionButtonRed,
                      classes.fullWidth
                    )}
                    onClick={() => setDialog(null)}
                  >
                    {t("group.cancel")}
                  </Button>
                </Grid>
                <Grid
                  item
                  xs={windowSize === "xs" && 12}
                  sm={4}
                  className={classes.txtCenter}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    className={clsx(
                      classes.actionButton,
                      classes.actionButtonLightGreen,
                      classes.fullWidth
                    )}
                    onClick={
                      //TODO: Make handler with api
                      () => {
                        const tempData = filteredData;
                        const result = tempData.filter(
                          (obj) => selectedGroups.indexOf(obj.GroupID) === -1
                        );
                        setFilteredData(result);
                        setDialog(null);
                      }
                    }
                  >
                    {t("group.ok")}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Box>
      </Dialog>
    );
  };

  return (
    <DefaultScreen
      currentPage="groups"
      classes={classes}
      containerClass={classes.management}
    >
      {renderHeader()}
      {renderSearchLine()}
      {renderManagmentLine()}
      <DataTable
        tableContainer={{ className: classes.tableStyle }}
        table={{ className: classes.tableContainer }}
        tableHead={{
          tableHeadCells: TABLE_HEAD,
          classes: rowStyle,
          className: windowSize === "xs" && classes.dNone,
        }}
      >
        {/* {renderTableBody()} */}
        {renderTableBody}
      </DataTable>
      <TablePagination
        classes={classes}
        // rows={isSearching ? searchResults.length : smsData.length}
        rows={filteredData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[6, 10, 20, 50]}
        page={page}
        onPageChange={setPage}
      />
      {/* {renderDialog()} */}
      {/* 
            {renderSearchLine()}
            {renderManagmentLine()}
            {renderTable()}
            {renderTablePagination()}
            {renderDialog()} */}
      {/* <Loader isOpen={showLoader} /> */}
      {/* <Button variant="outlined" color="primary" onClick={() => setDialog1(true)}>
                Open dialog
            </Button> */}
      {AddGroupPopUp()}
      {ConfirmDeletePopUp()}
      {/* <Dialog
                classes={classes}
                open={dialog1}
                onClose={() => setDialog1(false)}
            >
                {getDeleteDialog()}
            </Dialog> */}
    </DefaultScreen>
  );
};

export default GroupsManagement;
