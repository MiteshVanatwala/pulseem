import clsx from "clsx";
import "moment/locale/he";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../../../../components/Loader/Loader";
import { ExportFile } from "../../../../helpers/Export/ExportFile";
import { ExportFileTypes } from "../../../../model/Export/ExportFileTypes";
import { getInboundReport } from "../../../../redux/reducers/whatsappSlice";
import ConfirmRadioDialog from "../../../../components/DialogTemplates/ConfirmRadioDialog";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { ExportIcon } from "../../../../assets/images/managment/index";
import { TablePagination } from "../../../../components/managment/index";
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
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { ImWhatsapp } from "react-icons/im";
import {
  ReplaceNull,
  HandleExportData,
} from "../../../../helpers/Export/ExportHelper";
import { StateType } from "../../../../Models/StateTypes";
import {
  wpInbdDefaultFilterType,
  wpInbdRowType,
} from "../../../../Models/Whatsapp/whatsappInbound";
import { PulseemFeatures } from "../../../../model/PulseemFields/Fields";
import { DateFormats, TierFeatures } from "../../../../helpers/Constants";
import { getCommonFeatures } from "../../../../redux/reducers/commonSlice";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { findPlanByFeatureCode } from "../../../../redux/reducers/TiersSlice";
import TierPlans from "../../../../components/TierPlans/TierPlans";
import { get } from "lodash";

const WhatsappInbound = ({ classes }: any) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const rowsOptions = [6, 10, 20, 50];
  const dateFormat = "YYYY-MM-DD HH:mm:ss:FFF";
  const [dialog, setDialog] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(rowsOptions[0]);
  const { inboundWhatsappReport } = useSelector(
    (state: StateType) => state.whatsapp
  );
  const { isRTL, windowSize, userRoles } = useSelector(
    (state: StateType) => state.core
  );
  const [showTierPlans, setShowTierPlans] = useState(false);
  const { accountFeatures, subAccount } = useSelector((state: any) => state.common);
  const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);

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
  const defaultRequest = {
    FromDate: null,
    ToDate: null,
    FromNumber: "",
    ToNumber: "",
    TextMessage: "",
    PageIndex: 1,
    PageSize: rowsPerPage,
    IsExport: false,
  } as wpInbdDefaultFilterType;
  const [request, setRequest] =
    useState<wpInbdDefaultFilterType>(defaultRequest);
  // const [searchRequest, setSearchRequest] =
  //   useState<wpInbdDefaultFilterType>(defaultRequest);
  const [TierMessageCode, setTierMessageCode] = useState<string>('');

  const handleGetPlanForFeature = (tierMessageCode: string) => {
    const planName = findPlanByFeatureCode(
        tierMessageCode,
        availablePlans,
        currentPlan.Id
    );
    
    if (planName) {
        return t('billing.tier.featureNotAvailable').replace('{feature}', t(TierFeatures[tierMessageCode as keyof typeof TierFeatures] || tierMessageCode)).replace('{planName}', planName);
    } else {
        return t('billing.tier.noFeatureAvailable');
    }
  };

  const getInboundData = async () => {
    setShowLoader(true);
    const response: any = await dispatch(
      //@ts-ignore
      getInboundReport({ ...request, PageSize: rowsPerPage, PageIndex: page })
    );
    
    // Check for tier validation
    if (response?.payload?.StatusCode === 927) {
      // WHATSAPP_RESPONSE_REPORT
      setTierMessageCode(response?.payload?.Message || 'WHATSAPP_RESPONSE_REPORT');
      setDialog('tier');
      setShowLoader(false);
      return;
    }
    
    setShowLoader(false);
  };
  const getInboundDataById = async (id: string) => {
    setShowLoader(true);
    setShowLoader(false);
  };
  const initAccountFeatures = async () => {
    // @ts-ignore
    await dispatch(getCommonFeatures({ forceRequest: true }));
  }
  useEffect(() => {
    if (!accountFeatures) {
      initAccountFeatures();
    }
    if (id && Number(id) > 0) {
      getInboundDataById(id);
    } else {
      getInboundData();
    }
  }, [request, page, rowsPerPage]);

  // useEffect(() => {
  //   if (!isSearching) {
  //     setSearchRequest(defaultRequest);
  //   }
  // }, [isSearching]);

  const renderHeader = () => {
    return (
      <>
        {/* <Divider /> */}
        <Grid container spacing={2} className={clsx(classes.p20)}>
          {userRoles?.AllowExport && accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 && windowSize !== "xs" && (
            <Grid item>
              <Button
                className={clsx(
                  classes.btn, classes.btnRounded,
                  inboundWhatsappReport &&
                    inboundWhatsappReport?.Data?.length > 0
                    ? null
                    : classes.disabled
                )}
                onClick={() => setDialog("exportFormat")}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
                {t('campaigns.exportFile')}
              </Button>
            </Grid>
          )}
        </Grid>
      </>
    );
  };
  //TODO: add from / to number
  const exportColumnHeader = {
    SendDate: t("common.ReplyDate"),
    FromNumber: t("common.FrmNumber"),
    ToNumber: t("common.ToNumber"),
    TextMessage: t("common.messageContent"),
  };

  const handleDownloadCsv = async (formatType: string) => {
    setDialog(null);
    setShowLoader(true);
    request.IsExport = true;
    //@ts-ignore
    const response: any = await dispatch(getInboundReport(request));

    // Check for tier validation
    if (response?.payload?.StatusCode === 927) {
      setTierMessageCode(response?.payload?.Message || 'WHATSAPP_RESPONSE_REPORT');
      setDialog('tier');
      setShowLoader(false);
      return;
    }

    const exportOptions: any = {
      OrderItems: true,
      FormatDate: true,
      Order: Object.keys(exportColumnHeader),
    };

    HandleExportData(response?.payload?.Data, exportOptions)
      .then((result) => {
        ExportFile({
          data: result,
          exportType: formatType,
          fields: exportColumnHeader,
          fileName: `ResponsesReport${id ? "_" + id : ""}`,
        });
      })
      .finally(() => {
        setShowLoader(false);
      });
  };

  const renderTable = () => {
    return (
      <>
        <Grid item className={clsx(classes.groupsLableContainer, classes.mb15)}>
          <Typography className={classes.groupsLable}>
            {`${inboundWhatsappReport?.Message} ${t("common.Clients")}`}
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
            {`${t("common.ReplyDate")}`}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            {`${t("common.SentFromNumber")}`}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
            align="center"
          >
            {`${t("common.SendTo2")}`}
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
    let rowData = inboundWhatsappReport?.Data;

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

  const renderRow = (row: wpInbdRowType) => {
    const { Id, SendDate, FromNumber, ToNumber, TextMessage } = row;

    let reply = moment(SendDate, dateFormat);
    return (
      <TableRow key={Id} classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={classes.flex2}
        >
          {reply.format(DateFormats.DATE_TIME_24)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={classes.flex2}
        >
          <Typography>{FromNumber}</Typography>
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={classes.flex2}
        >
          <Typography>{ToNumber}</Typography>
        </TableCell>
        <TableCell
          classes={{ root: classes.tableCellRoot }}
          align="center"
          className={classes.flex5}
        >
          {TextMessage}
        </TableCell>
      </TableRow>
    );
  };

  const renderPhoneRow = (row: wpInbdRowType) => {
    const { Id, SendDate, FromNumber, ToNumber, TextMessage } = row;

    let reply = moment(SendDate, dateFormat);
    return (
      <TableRow key={Id} classes={rowStyle}>
        <TableCell
          style={{ flex: 2 }}
          classes={{ root: classes.tableCellRoot }}
          className={classes.p20}
        >
          <Box className={classes.ml10}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  className={clsx(classes.mobileReportHead, classes.ml0)}
                >
                  {`${t("common.ReplyDate")}`}
                </Typography>
                <Typography component={"p"} className={clsx(classes.middleTxt)}>
                  {reply.format(DateFormats.DATE_TIME_24)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Box className={classes.cellText}>
                  <Typography
                    className={clsx(classes.mobileReportHead, classes.ml0)}
                  >
                    {`${t("common.SentFromNumber")}`}
                  </Typography>
                  <Typography
                    component={"p"}
                    className={clsx(classes.middleTxt)}
                  >
                    {FromNumber}
                  </Typography>
                </Box>
                <Box className={classes.cellText}>
                  <Typography
                    className={clsx(classes.mobileReportHead, classes.ml0)}
                  >
                    {`${t("common.SendTo2")}`}
                  </Typography>
                  <Typography
                    component={"p"}
                    className={clsx(classes.middleTxt)}
                  >
                    {ToNumber}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  className={clsx(classes.mobileReportHead, classes.ml0)}
                >
                  {`${t("common.messageContent")}`}
                </Typography>
                <Typography className={clsx(classes.ml0)}>
                  {TextMessage}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const handlePageChange = (val: number) => {
    setRowsPerPage(val);
    setRequest({ ...request, PageSize: val });
  };

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={inboundWhatsappReport?.Message}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handlePageChange}
        //@ts-ignore
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    );
  };
  return (
    <Box className={classes.p20}>
      <Grid container>
        <Grid item>
          <SearchLine
            key="sl"
            currentPage={page}
            showAutoCompleteForm={false}
            classes={classes}
            onSetPage={(val: number) => setPage(val)}
            onFilterRequest={(val: wpInbdDefaultFilterType) => setRequest(val)}
            onSetIsSearching={(val: boolean) => setIsSearching(val)}
          />
        </Grid>
        <Grid item>
          {renderHeader()}
        </Grid>
      </Grid>
      {renderTable()}
      {renderTablePagination()}
      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialog === "exportFormat"}
        title={t("campaigns.exportFile")}
        radioTitle={t("common.SelectFormat")}
        onConfirm={(e: any) => handleDownloadCsv(e)}
        onCancel={() => setDialog(null)}
        cookieName={"exportFormat"}
        defaultValue="xlsx"
        options={ExportFileTypes}
      />
      {dialog === 'tier' && (
        // Add Button in such kind of 
        <BaseDialog
          classes={classes}
          open={dialog === 'tier'}
          onClose={() => setDialog(null)}
          onCancel={() => setDialog(null)}
          onConfirm={() => setDialog(null)}
          showDefaultButtons={false}
          title={t('billing.tier.permission')}
          renderButtons={() => (
            <Grid container spacing={2} className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, !get(subAccount, 'CompanyAdmin', false) ? classes.dNone : '')}>
                <Grid item>
                <Button
                    onClick={() => {
                    setDialog(null);
                    setShowTierPlans(true);
                  }}
                  className={clsx(classes.btn, classes.btnRounded)}
                >
                  {t('billing.upgradePlan')}
                </Button>
                </Grid>
                <Grid item>
                <Button
                  onClick={() => { setDialog(null); }}
                  className={clsx(classes.btn, classes.btnRounded)}
                >
                  {t('common.cancel')}
                </Button>
                </Grid>
            </Grid>
          )}
        >
          {handleGetPlanForFeature(TierMessageCode)}
        </BaseDialog>
      )}
      <Loader isOpen={showLoader} showBackdrop={true} />
      {showTierPlans && <TierPlans
        classes={classes}
        isOpen={showTierPlans}
        onClose={() => setShowTierPlans(false)}
      />}
    </Box>
  );
};

export default WhatsappInbound;
