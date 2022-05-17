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
import RenderRow from "./RenderRow";
import RenderPhoneRow from "./RenderPhoneRow";
import AddGroupPopUp from "./Popup/AddGroupPopUp";
import AddRecipientPopup from "./Popup/AddRecipientPopup";
import ConfirmDeletePopUp from "./Popup/ConfirmDeletePopUp";
import Toast from '../../../components/Toast/Toast.component';
import {
  getGroups,
  deleteGroups,
  getGroupsBySubAccountId
} from "../../../redux/reducers/groupSlice";
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import AddBulkRecipientPopup from "./Popup/AddBulkRecipientPopup";
import AddRecipientResponse from "./Popup/AddRecipientResponse";
import UnSubRecPopup from "./Popup/UnSubRecPopup";
import DeleteRecPopup from "./Popup/DeleteRecPopup";
import EditGroupPopup from "./Popup/EditGroupPopup";
import ResetGroupPopup from "./Popup/ResetGroupPopup";
import { Dialog } from '../../../components/managment/index';
import SimplyClubPupup from "./Popup/SimplyClubPupup";

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

  const { groupData, ToastMessages, subAccountAllGroups } = useSelector((state) => state.group);
  const { accountFeatures } = useSelector(state => state.core)
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
  const [responseMessage, setResponseMessage] = useState({ title: "", message: "" });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const renderHtml = (html) => {
    function createMarkup() {
      return { __html: html };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
  }


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
  const [showLoader, setLoader] = useState(false);
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
    EDIT_GROUP: "editGroup",
    DELETE_GROUP: "delete group",
    ADD_RECIPIENT: "add recipient",
    ADD_RECIPIENTS: "add recipients",
    UNSUB_RECIPIENT: "unsubscribe recipients",
    DELETE_RECIPIENT: "delete recipients",
    RESET_GROUP: 'reset group',
    MESSAGE: "message",
    SUMMARY: "summary",
    EXPORT_ALL: "exportAll",
    EXPORT_SELECTED: "exportSelected",
    SIMPLY_CLUB: "simplyclub"
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
      className: clsx(classes.flex2, classes.textUppercase),
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
    await dispatch(getAccountExtraData());
    if (subAccountAllGroups.length === 0) {
      await dispatch(getGroupsBySubAccountId())
    }
    // setDialog(null);
    setLoader(false);
  };

  useEffect(() => {
    getData(); // BUG: UNCOMMENT THIS
  }, [dispatch, serachData, page]);

  //  HANDLERS  //
  const handleResponses = (response, actions = {
    'S_200': {
      code: 200,
      message: '',
      Func: () => null
    },
    'S_201': {
      code: 201,
      message: '',
      Func: () => getData()
    },
    'S_400': {
      code: 400,
      message: '',
      Func: () => null
    },
    'S_401': {
      code: 401,
      message: '',
      Func: () => null
    },
    'S_405': {
      code: 405,
      message: '',
      Func: () => null
    },
    'S_406': {
      code: 406,
      message: '',
      Func: () => null
    },
    'S_422': {
      code: 422,
      message: '',
      Func: () => null
    },
    'S_500': {
      code: 500,
      message: '',
      Func: () => null
    },
    'default': {
      message: '',
      Func: () => null
    },
  }) => {
    switch (response.payload.StatusCode || response.payload.Message.StatusCode) {
      case 200: {
        actions?.S_200?.Func?.();
        actions?.S_200?.message && setToastMessage(actions?.S_200?.message);
        break;
      }
      case 201: {
        actions?.S_201?.Func?.();
        actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
        break;
      }
      case 400: {
        actions?.S_400?.Func?.();
        actions?.S_400?.message && setToastMessage(actions?.S_400?.message);
        break;
      }
      case 401: {
        actions?.S_401?.Func?.();
        actions?.S_401?.message && setToastMessage(actions?.S_401?.message);
        break;
      }
      case 405: {
        actions?.S_405?.Func?.();
        actions?.S_405?.message && setToastMessage(actions?.S_405?.message);
        break;
      }
      case 406: {
        actions?.S_406?.Func?.();
        actions?.S_406?.message && setToastMessage(actions?.S_406?.message);
        break;
      }
      case 422: {
        actions?.S_422?.Func?.();
        actions?.S_422?.message && setToastMessage(actions?.S_422?.message);
        break;
      }
      case 500: {
        actions?.S_500?.Func?.();
        actions?.S_500?.message && setToastMessage(actions?.S_500?.message);
        break;
      }
      default: {
        actions?.default?.Func?.();
        actions?.default?.message && setToastMessage(actions?.default?.message);
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
            className={clsx(classes.actionButton, classes.actionButtonRed)}
            onClick={() => selectedGroups.length === 0 ? setToastMessage(ToastMessages.GROUP_ZERO_SELECT) : setDialog(DialogType.DELETE_RECIPIENT)}
          >
            {t("recipient.deleteRecipient")}
          </Button>
        </Grid>
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            className={clsx(classes.actionButton, classes.actionButtonRed)}
            onClick={() => setDialog(DialogType.UNSUB_RECIPIENT)}
          >
            {t("recipient.unsubscribe")}
          </Button>
        </Grid>
        {accountFeatures && accountFeatures.includes('15') && (<Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            className={clsx(classes.actionButton, classes.createButton)}
            onClick={() => setDialog(DialogType.SIMPLY_CLUB)}
          >
            {t("recipient.externalImport")}
          </Button>
        </Grid>)}

        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            className={clsx(
              classes.actionButton,
              classes.actionButtonGreen
            )}
            onClick={() => setShowConfirmDialog(true)}
            startIcon={<ExportIcon />}
          >
            {t("campaigns.exportFile")}
          </Button>
          <CSVLink
            data={[
              ["firstname", "lastname", "email"],
              ["Ahmed", "Tomi", "ah@smthing.co.com"],
              ["Raed", "Labes", "rl@smthing.co.com"],
              ["Yezzi", "Min l3b", "ymin@cocococo.com"],
            ]}
            filename="report.csv"
            className="hidden"
            ref={null}
            target="_blank"
          />
        </Grid>

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
          style={{ fontSize: 18, fontWeight: "bold", direction: isRTL ? 'rtl' : 'ltr' }}
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
    if (sortData.length <= 0) {
      return <></>;
    }

    return (
      <TableBody>
        {sortData.map((obj, idx) =>
          windowSize === "xs" ? (
            <RenderPhoneRow
              key={idx}
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
              key={idx}
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

  const handleAddRecipientResponse = (res) => {
    switch (res.payload.StatusCode) {
      case 201: {
        setResponseMessage({ title: t("recipient.summary.summaryImportTitle"), message: '', summary: res.payload.Summary })
        setDialog(DialogType.MESSAGE);
        break;
      }
      case 202: {
        setResponseMessage({ title: t("recipient.bulkImportTitle"), message: renderHtml(t("recipient.importResponses.fileUploaded")) })
        setDialog(DialogType.MESSAGE);
        break;
      }
      case 404: {
        setResponseMessage({ title: t("common.ErrorOccured"), message: t("recipient.importResponses.noFolderFound") })
        setDialog(DialogType.MESSAGE);
        break;
      }
      case 400: {
        setResponseMessage({ title: t("common.ErrorOccured"), message: t("recipient.importResponses.listEmptyOrClientInvalid") })
        setDialog(DialogType.MESSAGE);
        break;
      }
      default: {
        setResponseMessage({ title: t("common.ErrorOccured"), message: t("recipient.importResponses.genericError") })
        setDialog(DialogType.MESSAGE);
      }
    }
  }

  const handleConfirmExport = () => {
    let queryString = `Culture=${isRTL ? 'he-IL' : 'en-US'}`;
    if (selectedGroups && selectedGroups.length > 0) {
      queryString += `&Groups=${selectedGroups.join(',')}`;
    }
    if (selectedGroups.length === 1) {
      const groupName = groupData.Groups.find((g) => { return g.GroupID === selectedGroups[0] }).GroupName;
      queryString += `&GroupName=${groupName.replace(' ', '-')}`;
    }
    window.open(`https://www.pulseemdev.co.il/Pulseem/ClientExport.csv?${queryString}`);
    setShowConfirmDialog(false);
  }

  const renderConfirmDialog = () => {
    if (showConfirmDialog) {
      let dialog = {
        showDivider: true,
        icon: <ExportIcon />,
        title: t("common.ExportGroups"),
        content: (
          <Typography style={{ marginBottom: 20 }}>
            {!selectedGroups || selectedGroups.length === 0 ? t('common.IsExportGroups') : t("common.IsExportGroup")}
          </Typography>
        )
      }
      return (
        <Dialog
          cancelText="common.Cancel"
          confirmText="common.Yes"
          disableBackdropClick={true}
          classes={classes}
          open={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={() => handleConfirmExport()}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }

  return (
    <DefaultScreen
      currentPage="groups"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      {renderToast()}
      {renderHeader()}
      {renderSearchLine()}
      {windowSize !== "xs" ? renderManagmentLine() :
        <Box
          item
          xs={windowSize === "xs" && 12}
          className={classes.groupsLableContainer}
        >
          <Typography className={classes.groupsLable}>
            {`${groupData ? groupData.RecordCount : 0} ${t("common.Groups")}`}
          </Typography>
        </Box>
      }
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
        }}
      />

      <AddGroupPopUp
        classes={classes}
        isOpen={dialog === DialogType.ADD_GROUP}
        onClose={() => setDialog(null)}
        setLoader={setLoader}
        windowSize={windowSize}
        ToastMessages={ToastMessages}
        setToastMessage={setToastMessage}
        openARDialog={(groupId) => { setSelectedGroups([...selectedGroups, groupId]); setDialog(DialogType.ADD_RECIPIENTS) }}
        getData={getData}
        handleResponses={(response, actions) => handleResponses(response, actions)}
      />
      {dialog === DialogType.EDIT_GROUP && selectedGroups.length !== 0 && <EditGroupPopup
        classes={classes}
        isOpen={dialog === DialogType.EDIT_GROUP}
        onClose={() => setDialog(null)}
        setLoader={setLoader}
        windowSize={windowSize}
        ToastMessages={ToastMessages}
        setToastMessage={setToastMessage}
        selectedGroup={selectedGroups[0]}
        openARDialog={() => setDialog(DialogType.ADD_RECIPIENT)}
        getData={getData}
        handleResponses={(response, actions) => handleResponses(response, actions)}
      />}
      {dialog === DialogType.RESET_GROUP && selectedGroups.length === 1 && <ResetGroupPopup
        classes={classes}
        isOpen={dialog === DialogType.RESET_GROUP}
        onClose={() => setDialog(null)}
        setLoader={setLoader}
        windowSize={windowSize}
        ToastMessages={ToastMessages}
        setToastMessage={setToastMessage}
        selectedGroup={{ GroupID: selectedGroups[0] }}
        getData={getData}
        handleResponses={(response, actions) => handleResponses(response, actions)}
      />}
      {dialog === DialogType.ADD_RECIPIENT && <AddRecipientPopup
        classes={classes}
        isOpen={dialog === DialogType.ADD_RECIPIENT}
        onClose={() => { setDialog(null); setSelectedGroups([]); }}
        setLoader={setLoader}
        windowSize={windowSize}
        ToastMessages={ToastMessages}
        setToastMessage={setToastMessage}
        Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], [])}
        selectedGroups={selectedGroups}
        selectGroup={(idArr) => setSelectedGroups(idArr)}
        DialogType={DialogType}
        setDialog={setDialog}
        handleResponses={(response, actions) => handleResponses(response, actions)}
        onAddRecipient={getData}
      />}
      {dialog === DialogType.ADD_RECIPIENTS && <AddBulkRecipientPopup
        classes={classes}
        isOpen={dialog === DialogType.ADD_RECIPIENTS}
        onClose={() => { setDialog(null); setSelectedGroups([]); }}
        setLoader={setLoader}
        windowSize={windowSize}
        ToastMessages={ToastMessages}
        setToastMessage={setToastMessage}
        Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], [])}
        selectedGroups={selectedGroups}
        selectGroup={(idArr) => setSelectedGroups(idArr)}
        onAddRecipient={handleAddRecipientResponse}
      />}
      {dialog === DialogType.UNSUB_RECIPIENT && <UnSubRecPopup
        classes={classes}
        isOpen={dialog === DialogType.UNSUB_RECIPIENT}
        onClose={() => { setDialog(null); setSelectedGroups([]); getData(); }}
        handleResponses={(response, actions) => handleResponses(response, actions)}
        ToastMessages={ToastMessages}
      />}
      {dialog === DialogType.DELETE_RECIPIENT && <DeleteRecPopup
        classes={classes}
        isOpen={dialog === DialogType.DELETE_RECIPIENT}
        onClose={() => { setDialog(null); setSelectedGroups([]); getData(); }}
        setLoader={setLoader}
        windowSize={windowSize}
        ToastMessages={ToastMessages}
        setToastMessage={setToastMessage}
        selectedGroups={selectedGroups}
        handleResponses={(response, actions) => handleResponses(response, actions)}
      />}
      <ConfirmDeletePopUp
        classes={classes}
        isOpen={dialog === DialogType.DELETE_GROUP}
        onClose={() => { setDialog(null); setSelectedGroups([]); }}
        windowSize={windowSize}
        handleDeleteGroup={() => handleDeleteGroup()}
      />
      <AddRecipientResponse
        classes={classes}
        isOpen={dialog === DialogType.MESSAGE}
        onClose={() => { setDialog(null); setSelectedGroups([]); getData(); }}
        windowSize={windowSize}
        title={responseMessage.title}
        message={responseMessage.message}
        summary={responseMessage.summary}
      />
      {accountFeatures && accountFeatures.includes('15') && (<SimplyClubPupup
        classes={classes}
        isOpen={dialog === DialogType.SIMPLY_CLUB}
        onClose={() => setDialog(null)}
        windowSize={windowSize}
        title={responseMessage.title}
        message={responseMessage.message}
        summary={responseMessage.summary}
        setToastMessage={setToastMessage}
        handleResponses={handleResponses}
        ToastMessages={ToastMessages}
        SelectedGroupIds={[...selectedGroups]}
        setSelectedGroupIds={() => setSelectedGroups([])}
      />)}
      {renderConfirmDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  );
};

export default GroupsManagement;
