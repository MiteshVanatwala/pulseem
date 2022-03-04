import React, { useState, useEffect, useMemo } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
  Typography,
  Divider,
  TableBody,
  Grid,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@material-ui/core";
import { SearchIcon, ExportIcon } from "../../../assets/images/managment/index";
import { CSVLink } from "react-csv";
import {
  TablePagination,
  SearchField,
} from "../../../components/managment/index";

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import ClearIcon from "@material-ui/icons/Clear";
import moment from "moment";
import "moment/locale/he";
import { Loader } from "../../../components/Loader/Loader";
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import { setCookie } from "../../../helpers/cookies";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import DataTable from "../../../components/Table/DataTable";
// import { ExcelData, StaticData } from "../tempConstants";
import { GrGroup } from "react-icons/gr";
import { BsInfoCircleFill, BsInfoSquare } from "react-icons/bs";
import { exportFile } from "../../../helpers/exportFromJson";
import { preferredOrder } from "../../../helpers/exportHelper";
import RenderRow from "./RenderRow";
import RenderPhoneRow from "./RenderPhoneRow";
import AddGroupPopUp from "./AddGroupPopUp";
import AddRecipientPopup from "./AddRecipientPopup";
import ConfirmDeletePopUp from "./ConfirmDeletePopUp";
import Toast from '../../../components/Toast/Toast.component';
import {
  getGroups,
  deleteGroups,
  createGroup,
} from "../../../redux/reducers/groupSlice";
import { Dialog } from "../../../components/managment/Dialog";
// import { StaticData } from "../tempConstants";

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

  const { groupData, ToastMessages } = useSelector((state) => state.group);
  const { t } = useTranslation();
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchStr, setSearchStr] = useState("");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [serachData, setSearchData] = useState({
    PageIndex: 1,
    PageSize: rowsPerPage,
    SearchTerm: "",
  });

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
  const [showLoader, setLoader] = useState(true);
  const dateFormat = "YYYY-MM-DD HH:mm:ss.FFF";
  const dispatch = useDispatch();
  moment.locale(language);
  const theme = useTheme();

  const colorTextStyle = {
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText,
  };

  const DialogType = {
    ADD_GROUP: "addGroup",
    DELETE_GROUP: "delete group",
    ADD_RECIPIENT: "add recipient"
  };

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
    setLoader(true);
    await dispatch(getGroups({ ...serachData, PageSize: rowsPerPage, PageIndex: page }));
    setLoader(false);
  };

  useEffect(() => {
    getData();
  }, [dispatch, serachData, page]);

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
    let orderList = preferredOrder(
      groupData.Groups,
      Object.keys(exportColumnHeader)
    );
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

  const onCreateGroupResponse = (response) => {
    switch (response.StatusCode) {
      case 201: {
        getData();
        setToastMessage(ToastMessages.GROUP_CREATED);
        break;
      }
      case 400: {
        getData();
        setToastMessage(ToastMessages.GROUP_INPUT_INCORRECT);
        break;
      }
      case 401: {
        getData();
        setToastMessage(ToastMessages.GROUP_INVALID_API);
        break;
      }
      case 405: {
        getData();
        setToastMessage(ToastMessages.GROUP_ERROR);
        break;
      }
      case 422: {
        getData();
        setToastMessage(ToastMessages.GROUP_ALREADY_EXIST);
        break;
      }
      default: {
        setDialog(null);
      }
    }
  }

  const renderToast = () => {
    if (toastMessage) {

      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const handleDeleteGroup = async () => {
    await dispatch(deleteGroups(selectedGroups));
    setSelectedGroups([]);
    setDialog(null);
    getData();
  };

  const handleSelected = (id) => {
    const index = selectedGroups.indexOf(id);
    if (index !== -1) {
      let temp = [...selectedGroups];
      temp.splice(index, 1);
      setSelectedGroups([...temp]);
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
        setSearchData({
          PageIndex: 1,
          PageSize: rowsPerPage,
          SearchTerm: searchStr,
        });
        setPage(1);
      }
    };

    const handleKeyPress = (e) => {
      if (e.charCode === 13 || e.code === "Enter") {
        setSearchData({
          PageIndex: 1,
          PageSize: rowsPerPage,
          SearchTerm: searchStr,
        });
        setPage(1);
      }
    };

    if (windowSize === "xs") {
      return (
        <SearchField
          classes={classes}
          value={searchStr}
          onChange={(e) => setSearchStr(e.target.value)}
          onClick={() => {
            setSearchData({
              PageIndex: 1,
              PageSize: rowsPerPage,
              SearchTerm: searchStr,
            });
            setPage(1);
          }}
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
              setSearchData({
                PageIndex: 1,
                PageSize: rowsPerPage,
                SearchTerm: searchStr,
              });
              setPage(1);
            }}
            className={classes.searchButton}
            endIcon={<SearchIcon />}
          >
            {t("campaigns.btnSearchResource1.Text")}
          </Button>
        </Grid>
        {serachData.SearchTerm && (
          <Grid item>
            <Button
              size="large"
              variant="contained"
              onClick={() => {
                setSearchData({ ...serachData, SearchTerm: "" });
                setSearchStr("");
                setPage(1);
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
    return (
      <Grid container spacing={2} className={classes.linePadding}>
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
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
              onClick={() => {
                selectedGroups.length === 0 ? setToastMessage(ToastMessages.GROUP_ZERO_SELECT) : setDialog(DialogType.DELETE_GROUP)
              }}
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
                ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${isRTL ? "he-IL" : "en-US"
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
                ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${isRTL ? "he-IL" : "en-US"
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
            {`${groupData ? groupData.RecordCount : 0} ${t("common.Groups")}`}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const handleRowsPerPageChange = async (val) => {
    await dispatch(setRowsPerPage(val));
    setSearchData({
      ...serachData,
      PageSize: val
    })
    setCookie("rpp", val, { maxAge: 2147483647 });
  };

  const renderNameCell = (row, fullwidth) => {
    let date = null;
    const { GroupName } = row;
    let text = "";
    if (!row.UpdatedDate) {
      date = moment(row.CreatedDate, dateFormat);
      text = t("common.CreatedOn");
    } else {
      date = moment(row.UpdatedDate, dateFormat);
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
          style={{ fontSize: 18, fontWeight: "bold" }}
          placement={"top"}
          title={<Typography noWrap={false}>{GroupName}</Typography>}
          text={GroupName}
        >
          {fullwidth ? (
            <Typography
              className={clsx(classes.nameEllipsis, classes.fullWidth)}
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

  const renderTableBody = useMemo(() => {
    let sortData = groupData ? groupData.Groups : [];
    // let sortData = StaticData;
    if (sortData.length <= 0) {
      return <></>;
    }

    //let rpp = parseInt(rowsPerPage);
    //sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp);
    return (
      <TableBody>
        {sortData.map((obj) =>
          windowSize === "xs" ? (
            <RenderPhoneRow
              row={obj}
              rowStyle={rowStyle}
              name={renderNameCell(obj, true)}
              classes={classes}
              colorTextStyle={colorTextStyle}
              setSelectedGroups={(id) => setSelectedGroups([id])}
              DialogType={DialogType}
              setDialog={(val) => setDialog(val)}
            />
          ) : (
            <RenderRow
              row={obj}
              classes={classes}
              setDialog={(val) => setDialog(val)}
              handleSelected={(id) => handleSelected(id)}
              selectedGroups={selectedGroups}
              setSelectedGroups={(id) => setSelectedGroups([id])}
              DialogType={DialogType}
              dateFormat={dateFormat}
              rowStyle={rowStyle}
              cellStyle={cellStyle}
              noBorderCellStyle={noBorderCellStyle}
              colorTextStyle={colorTextStyle}
              handleDeleteGroup={handleDeleteGroup}
            />
          )
        )}
      </TableBody>
    );
  }, [groupData, rowsPerPage, page, classes, selectedGroups]);


  const groupsLength = (groupData && groupData.RecordCount) || 0;

  return (
    <DefaultScreen
      currentPage="groups"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb8)}
    >
      {renderToast()}
      {renderHeader()}
      {renderSearchLine()}
      {windowSize !== "xs" && renderManagmentLine()}
      <DataTable
        tableContainer={{
          className:
            windowSize === "xs"
              ? clsx(classes.mt3, classes.tableStyle)
              : classes.tableStyle,
        }}
        table={{ className: classes.tableContainer }}
        tableHead={{
          tableHeadCells: TABLE_HEAD,
          classes: rowStyle,
          className: windowSize === "xs" && classes.dNone,
        }}
      >
        {renderTableBody}
      </DataTable>
      <TablePagination
        classes={classes}
        rows={groupsLength}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[6, 10, 20, 50]}
        page={page}
        onPageChange={(val) => {
          setPage(val);
          // setSearchData({ ...serachData, PageIndex: val });
        }}
      />

      <AddGroupPopUp
        classes={classes}
        isOpen={dialog === DialogType.ADD_GROUP}
        onClose={() => setDialog(null)}
        setLoader={setLoader}
        onCreateGroupResponse={(val) => onCreateGroupResponse(val)}
        windowSize={windowSize}
        ToastMessages={ToastMessages}
        setToastMessage={setToastMessage}
      />
      <AddRecipientPopup
        classes={classes}
        isOpen={dialog === DialogType.ADD_RECIPIENT}
        onClose={() => setDialog(null)}
        setLoader={setLoader}
        onCreateGroupResponse={() => onCreateGroupResponse()}
        windowSize={windowSize}
        setToastMessage={setToastMessage}
      />
      <ConfirmDeletePopUp
        classes={classes}
        isOpen={dialog === DialogType.DELETE_GROUP}
        onClose={() => setDialog(null)}
        windowSize={windowSize}
        handleDeleteGroup={() => handleDeleteGroup()}
      />
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  );
};

export default GroupsManagement;
