import clsx from "clsx";
import "moment/locale/he";
import moment from "moment";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Loader } from "../../../../components/Loader/Loader";
import { ExportFile } from "../../../../helpers/Export/ExportFile";
import { ClientStatus } from "../../../../helpers/PulseemArray";
import { EditIcon } from "../../../../assets/images/managment/index";
import { ExportFileTypes } from "../../../../model/Export/ExportFileTypes";
import AddRecipientPopup from "../../../Groups/Management/Popup/AddRecipientPopup";
import {
  TablePagination,
  ManagmentIcon,
} from "../../../../components/managment/index";
import ConfirmRadioDialog from "../../../../components/DialogTemplates/ConfirmRadioDialog";
import {
  getSmsReplies,
  getSmsRepliesById,
  getAccountExtraData,
} from "../../../../redux/reducers/smsSlice";
import { getClientsById } from "../../../../redux/reducers/clientSlice";
import { getGroupsBySubAccountId } from "../../../../redux/reducers/groupSlice";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer,
  Grid,
  Button,
  Box,
} from "@material-ui/core";
import SearchLine from "../SearchLine";
import {
  ReplaceNull,
  HandleExportData,
} from "../../../../helpers/Export/ExportHelper";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { TOAST_TYPE } from "../../../../helpers/Types/common";
import { StateType } from "../../../../Models/StateTypes";
import {
  SmsRepDefaultFilterType,
  SmsRepRowType,
} from "../../../../Models/Sms/SmsReplies";

const SmsReplies = ({ classes }: any) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const rowsOptions: number[] = [6, 10, 20, 50];
  const dateFormat = "YYYY-MM-DD HH:mm:ss:FFF";
  const [dialog, setDialog] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<TOAST_TYPE | null>(null);
  const [clientToEdit, setClientToEdit] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(rowsOptions[0]);
  const { ToastMessages } = useSelector((state: StateType) => state.client);
  const { smsReplies, extraData } = useSelector(
    (state: StateType) => state.sms
  );
  const { subAccountAllGroups } = useSelector(
    (state: StateType) => state.group
  );
  const { accountFeatures, windowSize, isRTL } = useSelector(
    (state: StateType) => state.core
  );
  const rowStyle = {
    head: classes.tableRowReportHead,
    root: clsx(classes.tableRowRoot),
  };
  const cellBodyStyle = {
    body: clsx(classes.tableCellBody),
    root: clsx(classes.tableCellRoot),
  };
  const cellStyle = {
    head: classes.tableCellHead,
    root: clsx(classes.tableCellRoot, classes.paddingHead),
  };
  const { id } = useParams();
  const priorDate = moment().subtract(30, "days").utcOffset(0);

  const defaultsDates = {
    from: priorDate,
    to: moment({ hour: 23, minute: 59, second: 59 }).format("YYYY-MM-DD HH:mm"),
  };
  const defaultRequest = {
    FromDate: defaultsDates.from,
    ToDate: defaultsDates.to,
    FromNumber: "",
    ToNumber: "",
    Text: "",
    CampaignID: null,
    PageIndex: 1,
    PageSize: rowsPerPage,
    IsExport: false,
  };
  const defaultSuccessToast: TOAST_TYPE = {
    severity: "success",
    color: "success",
    message: "",
    showAnimtionCheck: false,
  };
  const defaultErrorToast: TOAST_TYPE = {
    severity: "error",
    color: "error",
    message: "",
    showAnimtionCheck: false,
  };
  const [request, setRequest] =
    useState<SmsRepDefaultFilterType>(defaultRequest);
  const [searchRequest, setSearchRequest] = useState(defaultRequest);

  const DialogType = { EDIT_RECIPIENT: "EDIT_RECIPIENT" };

  const getReplies = async () => {
    setShowLoader(true);
    dispatch(
      // @ts-ignore
      getSmsReplies({ ...request, PageSize: rowsPerPage, PageIndex: page })
    );
    setShowLoader(false);
  };
  const getRepliesById = async () => {
    setShowLoader(true);
    // @ts-ignore
    dispatch(getSmsRepliesById(id));
    setShowLoader(false);
  };

  useEffect(() => {
    const initExtraFields = async () => {
      if (!extraData || extraData.length === 0) dispatch(getAccountExtraData());
    };
    initExtraFields();
  }, [dispatch]);

  useEffect(() => {
    if (id && Number(id) > 0) {
      // @ts-ignore
      getRepliesById(id);
    } else {
      getReplies();
    }
  }, [request, page, rowsPerPage]);

  useEffect(() => {
    if (!isSearching) {
      setSearchRequest(defaultRequest);
    }
  }, [isSearching]);

  const handlePageChange = (val: number) => {
    setRowsPerPage(val);
    setRequest({ ...request, PageSize: val });
  };

  const renderHeader = () => {
    return (
      <>
        {/* <Divider /> */}
        <Grid
          container
          spacing={2}
          className={clsx(classes.linePadding, classes.pb0)}
        >
          {accountFeatures?.indexOf("13") === -1 && windowSize !== "xs" && (
            <Grid item>
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  smsReplies && smsReplies?.Data?.length > 0
                    ? null
                    : classes.disabled
                )}
                onClick={() => setDialog("exportFormat")}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              >
                {`${t("campaigns.exportFile")}`}
              </Button>
            </Grid>
          )}
        </Grid>
      </>
    );
  };

  const exportColumnHeader: { [key: string]: string } = {
    // "ClientID": t('client.ClientId'),
    VirtualNumber: t("report.virtualNumber"),
    CellPhone: t("common.cellphone"),
    FirstName: t("smsReport.firstName"),
    LastName: t("smsReport.lastName"),
    ReplyDate: t("common.ReplyDate"),
    ReplyText: t("common.ReplyText"),
    CampaignName: t("common.CampaignName"),
  };

  const handleDownloadCsv = async (formatType: string) => {
    setDialog(null);
    setShowLoader(true);
    let exportData: any = dispatch(
      // @ts-ignore
      getSmsReplies({ ...request, IsExport: true })
    );
    let orderList = exportData?.payload;
    orderList = ReplaceNull(orderList, "FirstName", "");
    orderList = ReplaceNull(orderList, "LastName", "");
    orderList = ReplaceNull(orderList, "CellPhone", "");
    orderList = ReplaceNull(orderList, "CampaignName", "");

    const exportOptions: any = {
      OrderItems: true,
      FormatDate: true,
      ConvertStatusToString: true,
      Statuses: ClientStatus.Sms,
      Order: Object.keys(exportColumnHeader.current),
      DeleteProperties: ["Status"],
    };

    HandleExportData(orderList, exportOptions).then((result) => {
      ExportFile({
        data: result,
        exportType: formatType,
        fields: exportColumnHeader,
        fileName: `ResponsesReport${id ? "_" + id : ""}`,
      });
    });

    setShowLoader(false);
  };

  const renderTable = () => {
    return (
      <>
        <Grid item className={clsx(classes.groupsLableContainer, classes.mb15)}>
          <Typography className={classes.groupsLable}>
            {`${smsReplies?.Message ?? 0} ${t("common.Clients")}`}
          </Typography>
        </Grid>
        <TableContainer className={classes.tableStyle}>
          <Table className={classes.tableContainer}>
            {windowSize !== "xs" && renderTableHead()}
            {renderTableBody()}
          </Table>
        </TableContainer>
      </>
    );
  };

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            {`${t("report.clientName")}`}({`${t("common.SentFromNumber")}`})
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            {`${t("common.ToNumber")}`}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            {`${t("common.smsStatus")}`}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            {`${t("common.ReplyDate")}`}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex5}
            align="center"
          >
            {`${t("common.messageContent")}`}
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };
  const renderTableBody = () => {
    let rowData = smsReplies?.Data;

    if (!rowData || rowData?.length === 0) {
      return (
        <Box
          className={clsx(classes.flex, classes.justifyCenterOfCenter)}
          style={{ height: 50 }}
        >
          <Typography>{`${t("common.NoDataTryFilter")}`}</Typography>
        </Box>
      );
    }

    return (
      <TableBody>
        {rowData.map(windowSize === "xs" ? renderPhoneRow : renderRow)}
      </TableBody>
    );
  };
  const statusToText = (status: number) => {
    let translatedStatus: any = ClientStatus.Sms.find((x) => {
      return x.id === status;
    });
    translatedStatus = translatedStatus ?? { value: "common.noSms" };
    return t(translatedStatus?.value);
  };

  const renderRow = (row: SmsRepRowType, index: number) => {
    const {
      ClientID,
      FirstName,
      LastName,
      CellPhone,
      SmsStatus,
      ReplyDate,
      ReplyText,
      VirtualNumber,
    } = row;

    let reply = moment(ReplyDate, dateFormat);
    return (
      <TableRow key={index} classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={clsx(classes.flex2, classes.ellipsisText)}
        >
          <Grid item key={"edit"} style={{ width: "100%" }}>
            <Box className={classes.dFlex}>
              <Box
                style={{ width: "70%", textAlign: isRTL ? "right" : "left" }}
              >
                <Typography className={classes.font18}>{CellPhone}</Typography>
                <Typography
                  className={clsx(classes.font14, classes.ellipsisText)}
                  title={`${FirstName} ${LastName}`}
                >
                  {FirstName} {LastName}
                </Typography>
              </Box>
              <Box
                className={Number(ClientID) > 0 ? null : classes.disabled}
                style={{ width: "30%" }}
              >
                <ManagmentIcon
                  //   disableHover={true}
                  key="edit"
                  classes={classes}
                  icon={EditIcon}
                  iconClass={clsx(classes.smallIcon)}
                  rootClass={classes.paddingIcon}
                  onClick={async () => {
                    setShowLoader(true);
                    setSelectedClients([row.ClientID]);
                    const recipientRequest: any = await dispatch(
                      // @ts-ignore
                      getClientsById([row.ClientID])
                    );
                    const cToEdit = recipientRequest?.payload?.Data[0];
                    setClientToEdit(cToEdit);
                    if (
                      !subAccountAllGroups ||
                      subAccountAllGroups?.length === 0
                    ) {
                      await dispatch(getGroupsBySubAccountId());
                    }
                    setDialog(DialogType.EDIT_RECIPIENT);
                    setShowLoader(false);
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={classes.flex2}
        >
          <Typography className={classes.font18}>{VirtualNumber}</Typography>
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={classes.flex2}
        >
          {statusToText(SmsStatus)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={classes.flex2}
        >
          {reply.format("DD/MM/YYYY")} {reply.format("HH:mm:ss")}
        </TableCell>
        <TableCell
          classes={{ root: classes.tableCellRoot }}
          align="center"
          className={classes.flex5}
        >
          {ReplyText}
        </TableCell>
      </TableRow>
    );
  };

  const renderPhoneRow = (row: SmsRepRowType) => {
    return <></>;
  };

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={smsReplies?.Message}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handlePageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    );
  };
  const showDialog = () => {
    if (dialog !== null) {
      switch (dialog) {
        case DialogType.EDIT_RECIPIENT: {
          let mappedGroups = [];
          if (clientToEdit && clientToEdit?.GroupIds?.length > 0) {
            mappedGroups = clientToEdit?.GroupIds?.split(",")?.map(function (
              x: string
            ) {
              return parseInt(x, 10);
            });
          }

          return (
            <AddRecipientPopup
              classes={classes}
              isOpen={
                selectedClients.length === 1 &&
                dialog === DialogType.EDIT_RECIPIENT
              }
              onClose={() => {
                setDialog(null);
                setSelectedClients([]);
              }}
              windowSize={windowSize}
              ToastMessages={ToastMessages}
              selectedGroups={mappedGroups}
              handleResponses={(response, actions) => {
                handleResponses(response, actions);
              }}
              onAddRecipient={(closeDialog = true) => {
                closeDialog && setDialog(null);
              }}
              recipientData={clientToEdit}
            />
          );
        }
        default: {
          return <></>;
        }
      }
    }
    return <></>;
  };
  const handleResponses = (
    response: any,
    actions = {
      S_200: {
        code: 200,
        message: "",
        Func: () => null,
      },
      S_201: {
        code: 201,
        message: "",
        Func: () => (id ? getRepliesById() : getReplies()),
      },
      S_400: {
        code: 400,
        message: "",
        Func: () => null,
      },
      S_401: {
        code: 401,
        message: "",
        Func: () => null,
      },
      S_404: {
        code: 404,
        message: "",
        Func: () => null,
      },
      S_405: {
        code: 405,
        message: "",
        Func: () => null,
      },
      S_406: {
        code: 406,
        message: "",
        Func: () => null,
      },
      S_422: {
        code: 422,
        message: "",
        Func: () => null,
      },
      S_500: {
        code: 500,
        message: "",
        Func: () => null,
      },
      default: {
        message: "",
        Func: () => null,
      },
    }
  ) => {
    switch (
      response.payload?.StatusCode ||
      response.payload?.Message.StatusCode
    ) {
      case 200: {
        actions?.S_200?.Func?.();
        actions?.S_200?.message &&
          setToastMessage({
            ...defaultSuccessToast,
            message: actions?.S_200?.message,
          });
        break;
      }
      case 201: {
        actions?.S_201?.Func?.();
        actions?.S_201?.message &&
          setToastMessage({
            ...defaultSuccessToast,
            message: actions?.S_201?.message,
          });
        break;
      }
      case 400: {
        actions?.S_400?.Func?.();
        actions?.S_400?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.S_400?.message,
          });
        break;
      }
      case 401: {
        actions?.S_401?.Func?.();
        actions?.S_401?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.S_401?.message,
          });
        break;
      }
      case 404: {
        actions?.S_404?.Func?.();
        actions?.S_404?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.S_404?.message,
          });
        break;
      }
      case 405: {
        actions?.S_405?.Func?.();
        actions?.S_405?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.S_405?.message,
          });
        break;
      }
      case 406: {
        actions?.S_406?.Func?.();
        actions?.S_406?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.S_406?.message,
          });
        break;
      }
      case 422: {
        actions?.S_422?.Func?.();
        actions?.S_422?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.S_422?.message,
          });
        break;
      }
      case 500: {
        actions?.S_500?.Func?.();
        actions?.S_500?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.S_500?.message,
          });
        break;
      }
      default: {
        actions?.default?.Func?.();
        actions?.default?.message &&
          setToastMessage({
            ...defaultErrorToast,
            message: actions?.default?.message,
          });
        setDialog(null);
        break;
      }
    }
    setShowLoader(false);
  };
  //#endregion

  return (
    <Box>
      {renderHeader()}
      <SearchLine
        classes={classes}
        onSetPage={(val: number) => setPage(val)}
        onFilterRequest={(val: SmsRepDefaultFilterType) => setRequest(val)}
        onSetIsSearching={(val: boolean) => setIsSearching(val)}
      />
      {renderTable()}
      {renderTablePagination()}
      {showDialog()}
      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialog === "exportFormat"}
        title={t("campaigns.exportFile")}
        radioTitle={t("common.SelectFormat")}
        onConfirm={(e) => handleDownloadCsv(e)}
        onCancel={() => setDialog(null)}
        cookieName={"exportFormat"}
        defaultValue="xls"
        options={ExportFileTypes}
      />
      <Loader isOpen={showLoader} showBackdrop={true} />
    </Box>
  );
};

export default SmsReplies;
