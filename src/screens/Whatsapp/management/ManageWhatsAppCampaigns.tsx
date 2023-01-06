import {
  Box,
  Button,
  Grid,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import uniqid from "uniqid";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  AutomationIcon,
  DeleteIcon,
  DuplicateIcon,
  EditIcon,
  SendGreenIcon,
  SearchIcon,
  GroupsIcon,
  PreviewIcon,
  CalendarIcon,
} from "../../../assets/images/managment/index";
import ManagmentIcon from "./Component/ManagmentIcon";
import { Title } from "../../../components/managment/Title";
import { ClassesType } from "../../Classes.types";
import DefaultScreen from "../../DefaultScreen";
import {
  buttonsDataProps,
  callToActionProps,
  coreProps,
  quickReplyButtonProps,
  savedTemplateAPIProps,
  savedTemplateCallToActionProps,
  savedTemplateCardProps,
  savedTemplateDataProps,
  savedTemplateMediaProps,
  savedTemplateQuickReplyProps,
  savedTemplateTextProps,
  templateDataProps,
} from "../Editor/Types/WhatsappCreator.types";
import ClearIcon from "@material-ui/icons/Clear";
import clsx from "clsx";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import moment from "moment";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { campaignData, templatData } from "../Constant";
import Pagination from "./Component/Pagination";
import RestoreDeletedModal from "./Popups/RestoreDeletedModal";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { ManagmentIconProps } from "./Types/Management.types";
import AlertModal from "../Editor/Popups/AlertModal";
import WhatsappMobilePreview from "../Editor/Components/WhatsappMobilePreview";
import { getSavedTemplatesById } from "../../../redux/reducers/whatsappSlice";
import InfoModal from "./Popups/InfoModal";
import { useNavigate } from "react-router-dom";
import {
  campaignDataProps,
  filtersObjectProps,
  searchArrayProps,
} from "../Campaign/Types/WhatsappCampaign.types";

const ManageWhatsAppCampaigns = ({ classes }: ClassesType) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t: translator } = useTranslation();
  const { windowSize } = useSelector(
    (state: { core: coreProps }) => state.core
  );
  const [fromDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
    null
  );
  const [toDate, handleToDate] = useState<MaterialUiPickersDate | null>(null);
  const [campaineNameSearch, setCampaineNameSearch] = useState<string>("");
  const [isSearching, setSearching] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);

  const [isPreviewCampaignOpen, setIsPreviewCampaignOpen] =
    useState<boolean>(false);
  const [templateData, setTemplateData] = useState<templateDataProps>({
    templateText: "",
    templateButtons: [],
  });
  const [buttonType, setButtonType] = useState<string>("");
  const [fileData, setFileData] = useState<string>("");

  const [tableData, setTableData] = useState<campaignDataProps[]>(campaignData);

  const [isRestoreDeletedModal, setIsRestoreDeletedModal] =
    useState<boolean>(false);
  const [isDuplicateCampaignOpen, setIsDuplicateCampaignOpen] =
    useState<boolean>(false);
  const [isDeleteCampaignOpen, setIsDeleteCampaignOpen] =
    useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [infoModalData, setInfoModalData] = useState<string[]>([
    "Group 1",
    "Group 2",
  ]);
  const [isFromDatePickerOpen, setIsFromDatePickerOpen] =
    useState<boolean>(false);
  const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean>(false);
  const [restoreIds, setRestoreIds] = useState<string[]>([]);

  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = {
    head: classes.tableCellHead,
    body: classes.tableCellBody,
    root: classes.tableCellRoot,
  };
  const dateFormat = "YYYY-MM-DD HH:mm:ss.FFF";
  let updatedTemplateData: templateDataProps = {
    templateText: "",
    templateButtons: [],
  };
  let updatedButtonType: string = "";
  let updatedFileData: string = "";

  const deletedCampaigns: { id: string; campaignName: string }[] = [
    {
      id: "21",
      campaignName: "demo campaign 1",
    },
    {
      id: "211",
      campaignName: "demo campaign 2",
    },
    {
      id: "213",
      campaignName: "demo campaign 3",
    },
    {
      id: "21564",
      campaignName: "demo campaign 4",
    },
    {
      id: "26781",
      campaignName: "demo campaign 5",
    },
    {
      id: "27801",
      campaignName: "demo campaign 6",
    },
    {
      id: "23451",
      campaignName: "demo campaign 7",
    },
    {
      id: "2231",
      campaignName: "demo campaign 8",
    },
  ];

  useEffect(() => {
    if (
      (fromDate && moment(fromDate).format("DD/MM/YYYY")?.length > 0) ||
      (toDate && moment(toDate).format("DD/MM/YYYY")?.length > 0) ||
      campaineNameSearch?.length > 0
    ) {
      setSearching(true);
    }
  }, [fromDate, toDate, campaineNameSearch]);
  const handleFromDateChange = (value: any) => {
    if (toDate && value > toDate) {
      handleToDate(null);
    }
    handleFromDate(value);
  };
  const handleCampainNameChange = (event: BaseSyntheticEvent) => {
    setCampaineNameSearch(event.target.value);
  };
  const clearSearch = () => {
    setCampaineNameSearch("");
    handleFromDate(null);
    handleToDate(null);
    setSearching(false);
    setTableData(campaignData);
  };
  const renderNameCell = (row: campaignDataProps) => {
    let date = null;
    let text = "";
    if (!row?.sendDate) {
      date = moment(row.updatedDate, dateFormat);
      text = translator("common.UpdatedOn");
    } else {
      date = moment(row.sendDate, dateFormat);
      const dateMillis = date.valueOf();
      const currentDateMillis = moment().valueOf();
      text =
        dateMillis > currentDateMillis
          ? translator("common.ScheduledFor")
          : translator("common.SentOn");
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
          title={<Typography noWrap={false}>{row.campaignName}</Typography>}
          text={row.campaignName}
          children={undefined}
          icon={undefined}
        />
        <Typography className={classes.grayTextCell}>
          {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
        </Typography>
      </>
    );
  };
  const renderRecipientsCell = (recipients: number) => {
    return (
      <>
        <Typography className={classes.middleText}>
          {recipients.toLocaleString()}
        </Typography>
        <Typography className={classes.middleText}>
          {translator("campaigns.recipients")}
        </Typography>
      </>
    );
  };

  const renderMessagesCell = (messages: number) => {
    return (
      <>
        <Typography className={classes.middleText}>
          {messages.toLocaleString()}
        </Typography>
        <Typography className={classes.middleText}>
          {translator("sms.CreditsResource1.HeaderText")}
        </Typography>
      </>
    );
  };
  const renderStatusCell = (status: string) => {
    return (
      <>
        <Typography
          className={clsx(classes.middleText, classes.recipientsStatus, {
            [classes.recipientsStatusCreated]: status === "Created",
            [classes.recipientsStatusSent]: status === "Finished",
            [classes.recipientsStatusSending]: status === "Sending",
            [classes.recipientsStatusCanceled]: status === "Canceled",
          })}
        >
          {status}
        </Typography>
      </>
    );
  };

  const setButtonsData = (buttonType: string, data: buttonsDataProps[]) => {
    let buttonData: quickReplyButtonProps[] | callToActionProps = [];
    switch (buttonType) {
      case "quickReply":
        buttonData = data?.map((button: buttonsDataProps) => {
          return {
            id: uniqid(),
            typeOfAction: "",
            fields: [
              {
                fieldName: translator("whatsapp.websiteButtonText"),
                type: "text",
                placeholder: translator(
                  "whatsapp.websiteButtonTextPlaceholder"
                ),
                value: button.title,
              },
            ],
          };
        });
        return buttonData ? buttonData : [];
      case "callToAction":
        buttonData = data?.map((button: buttonsDataProps) => {
          if (button?.type === "PHONE") {
            return {
              id: uniqid(),
              typeOfAction: "phonenumber",
              fields: [
                {
                  fieldName: translator("whatsapp.phoneButtonText"),
                  type: "text",
                  placeholder: translator(
                    "whatsapp.phoneButtonTextPlaceholder"
                  ),
                  value: button.title,
                },
                {
                  fieldName: translator("whatsapp.country"),
                  type: "select",
                  placeholder: "Select Your Country Code",
                  value: "+972 Israel",
                },
                {
                  fieldName: translator("whatsapp.phoneNumber"),
                  type: "tel",
                  placeholder: translator("whatsapp.phoneNumberPlaceholder"),
                  value: button.phone,
                },
              ],
            };
          } else {
            return {
              id: uniqid(),
              typeOfAction: "website",
              fields: [
                {
                  fieldName: translator("whatsapp.websiteButtonText"),
                  type: "text",
                  placeholder: translator(
                    "whatsapp.websiteButtonTextPlaceholder"
                  ),
                  value: button.title,
                },
                {
                  fieldName: translator("whatsapp.websiteURL"),
                  type: "text",
                  placeholder: translator("whatsapp.websiteURLPlaceholder"),
                  value: button.url,
                },
              ],
            };
          }
        });
        return buttonData ? buttonData : [];
    }
  };

  const saveQuickreplyTemplate = (templateData: savedTemplateDataProps) => {
    const quickReplyData: savedTemplateQuickReplyProps =
      templateData?.types["quick-reply"];
    updatedButtonType = "quickReply";
    const buttonData = setButtonsData("quickReply", quickReplyData?.actions);
    updatedTemplateData.templateText = quickReplyData?.body;
    updatedTemplateData.templateButtons = buttonData ? buttonData : [];
  };

  const saveCallToActionTemplate = (templateData: savedTemplateDataProps) => {
    const callToActionData: savedTemplateCallToActionProps =
      templateData?.types["call-to-action"];
    updatedButtonType = "callToAction";
    const buttonData = setButtonsData(
      "callToAction",
      callToActionData?.actions
    );
    updatedTemplateData.templateText = callToActionData?.body;
    updatedTemplateData.templateButtons = buttonData ? buttonData : [];
  };

  const saveCardTemplate = (templateData: savedTemplateDataProps) => {
    const cardData: savedTemplateCardProps = templateData?.types["card"];
    updatedTemplateData.templateText = cardData?.title;
    if (cardData?.actions?.length > 0) {
      if (cardData?.actions[0]?.type !== "QUICK_REPLY") {
        updatedButtonType = "callToAction";
        const buttonData = setButtonsData("callToAction", cardData?.actions);
        updatedTemplateData.templateButtons = buttonData ? buttonData : [];
      } else {
        updatedButtonType = "quickReply";
        const buttonData = setButtonsData("quickReply", cardData?.actions);
        updatedTemplateData.templateButtons = buttonData ? buttonData : [];
      }
    }
    if (cardData?.media?.length > 0) {
      updatedFileData = cardData?.media[0];
    }
  };

  const saveMediaTemplate = (templateData: savedTemplateDataProps) => {
    const mediaData: savedTemplateMediaProps = templateData?.types["media"];
    updatedTemplateData.templateText = mediaData?.body;
    if (mediaData?.media?.length > 0) {
      updatedFileData = mediaData?.media[0];
    }
  };

  const saveTextTemplate = (templateData: savedTemplateDataProps) => {
    const textData: savedTemplateTextProps = templateData?.types["text"];
    updatedTemplateData.templateText = textData?.body;
  };

  const setUpdatedTemplateData = (templateData: savedTemplateDataProps) => {
    if ("quick-reply" in templateData?.types) {
      saveQuickreplyTemplate(templateData);
    }
    if ("call-to-action" in templateData?.types) {
      saveCallToActionTemplate(templateData);
    } else if ("card" in templateData?.types) {
      saveCardTemplate(templateData);
    } else if ("media" in templateData?.types) {
      saveMediaTemplate(templateData);
    } else if ("text" in templateData?.types) {
      saveTextTemplate(templateData);
    }
  };

  const onSavedTemplateChange = (templateData: savedTemplateDataProps) => {
    if (templateData) {
      setUpdatedTemplateData(templateData);
    }
    setFileData(updatedFileData);
    setButtonType(updatedButtonType);
    setTemplateData(updatedTemplateData);
  };

  const onPreview = async (templateId: string) => {
    const templateData: savedTemplateAPIProps = await dispatch<any>(
      getSavedTemplatesById({
        templateId: templateId
          ? "HX7d12be9e2c0cef2863d4adb5e27c40e2"
          : "HX7d12be9e2c0cef2863d4adb5e27c40e2",
      })
    );
    if (templateData.payload.Status === "SUCCESS") {
      const templates = templateData.payload.Items
        ? templateData.payload.Items
        : [];
      if (templates && templates?.length > 0) {
        const templateData = templates[0]?.Data;
        onSavedTemplateChange(templateData);
      }
      setIsPreviewCampaignOpen(true);
    }
  };

  const onRowIconClick = (key: string, templateId: string) => {
    switch (key) {
      case "preview":
        onPreview(templateId);
        break;
      case "duplicate":
        setIsDuplicateCampaignOpen(true);
        break;
      case "groups":
        setIsInfoModalOpen(true);
        break;
      case "automation":
        // setIsDuplicateCampaignOpen(true);
        break;
      case "delete":
        setIsDeleteCampaignOpen(true);
        break;

      default:
        break;
    }
  };

  const renderCellIcons = (row: campaignDataProps) => {
    const { status, IsAutomation } = row;
    const groups: string[] = [];

    const iconsMap: ManagmentIconProps[] = [
      {
        key: "send",
        buttonKey: "send",
        icon: SendGreenIcon,
        lable: translator("campaigns.imgSendResource1.ToolTip"),
        remove: status !== "Created" || IsAutomation === true,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        onClick: (key: string, id: string) => onRowIconClick(key, id),
        classes: classes,
        id: row.campaignId.toString(),
        href: `/react/whatsapp/campaign/edit/page2/${row.campaignId}`,
      },
      {
        key: "preview",
        buttonKey: "preview",
        icon: PreviewIcon,
        lable: translator("campaigns.Image1Resource1.ToolTip"),
        remove: windowSize === "xs",
        rootClass: classes.paddingIcon,
        onClick: (key: string, id: string) => onRowIconClick(key, id),
        classes: classes,
        id: row.campaignId.toString(),
      },
      {
        key: "edit",
        buttonKey: "edit",
        icon: EditIcon,
        disable: status !== "Created" || IsAutomation === true,
        lable: translator("campaigns.Image2Resource1.ToolTip"),
        rootClass: classes.paddingIcon,
        onClick: (key: string, id: string) => onRowIconClick(key, id),
        classes: classes,
        id: row.campaignId.toString(),
        href: `/react/whatsapp/campaign/edit/page1/${row.campaignId}`,
      },
      {
        key: "duplicate",
        buttonKey: "duplicate",
        icon: DuplicateIcon,
        lable: translator("campaigns.lnkEditResource1.ToolTip"),
        rootClass: classes.paddingIcon,
        onClick: (key: string, id: string) => onRowIconClick(key, id),
        classes: classes,
        id: row.campaignId.toString(),
      },
      {
        key: "groups",
        buttonKey: "groups",
        icon: GroupsIcon,
        disable: groups && groups.length === 0,
        lable: translator("campaigns.lnkPreviewResource1.ToolTip"),
        remove: windowSize === "xs",
        rootClass: classes.paddingIcon,
        onClick: (key: string, id: string) => onRowIconClick(key, id),
        classes: classes,
        id: row.campaignId.toString(),
      },
      {
        key: "automation",
        buttonKey: "automation",
        icon: AutomationIcon,
        disable: IsAutomation === false,
        remove: windowSize === "xs",
        lable: translator("campaigns.automation"),
        rootClass: classes.paddingIcon,
        onClick: (key: string, id: string) => onRowIconClick(key, id),
        classes: classes,
        id: row.campaignId.toString(),
      },
      {
        key: "delete",
        buttonKey: "delete",
        icon: DeleteIcon,
        disable: IsAutomation === true,
        rootClass: classes.paddingIcon,
        lable: translator("campaigns.DeleteResource1.HeaderText"),
        onClick: (key: string, id: string) => onRowIconClick(key, id),
        classes: classes,
        id: row.campaignId.toString(),
      },
    ];
    return (
      <Grid
        container
        direction="row"
        justifyContent={windowSize === "xs" ? "flex-start" : "flex-end"}
        alignItems="center"
      >
        {iconsMap.map((icon) => (
          <Grid
            className={icon?.disable ? classes.disabledCursor : ""}
            key={icon.key}
            item
          >
            <ManagmentIcon {...icon} />
          </Grid>
        ))}
      </Grid>
    );
  };

  const getSearchedCampaign = () => {
    const searchArray: searchArrayProps[] = [
      {
        type: "name",
        campaignName: campaineNameSearch,
      },
      {
        type: "date",
        fromDate,
        toDate,
      },
    ];
    const filtersObject: filtersObjectProps = {
      name: (row: campaignDataProps) => {
        return String(row.campaignName.toLowerCase()).includes(
          campaineNameSearch.toLowerCase()
        );
      },
      date: (row: campaignDataProps, values: searchArrayProps) => {
        const { updatedDate, sendDate } = row;
        const lastUpdate = sendDate
          ? moment(sendDate, dateFormat).valueOf()
          : moment(updatedDate, dateFormat).valueOf();
        const startFromDate =
          (values.fromDate && values.fromDate.hour(0).minute(0).valueOf()) ||
          null;
        const endToDate =
          (values.toDate && values.toDate.hour(23).minute(59).valueOf()) ||
          null;

        if (!values) return true;
        if (fromDate && toDate && startFromDate && endToDate)
          return lastUpdate >= startFromDate && lastUpdate <= endToDate;
        if (fromDate && startFromDate) return lastUpdate >= startFromDate;
        if (toDate && endToDate) return lastUpdate <= endToDate;
        return true;
      },
    };

    let sortData = campaignData;
    searchArray.forEach((values) => {
      sortData = sortData.filter((row) =>
        filtersObject[values.type](row, values)
      );
    });

    return sortData;
  };

  const getRows = () => {
    let sortData = tableData;
    sortData = sortData.slice(
      (page - 1) * rowsPerPage,
      (page - 1) * rowsPerPage + rowsPerPage
    );

    return sortData?.length > 0 ? sortData : [];
  };

  const onDuplicateCampaign = async () => {
    console.log("onDuplicateCampaign");
  };

  const onDeleteCampaign = async () => {
    console.log("onDeleteCampaign");
  };

  const onRestoreDeleted = async () => {
    setIsPreviewCampaignOpen(false);
    console.log("onRestoreDeleted");
  };

  const onSearch = async () => {
    setPage(1);
    setTableData(getSearchedCampaign());
  };

  const onCreateCamoaign = async () => {
    navigate("/react/whatsapp/campaign/create/page1");
  };

  return (
    <DefaultScreen
      subPage={"manage"}
      currentPage="whatsapp"
      classes={classes}
      customPadding={true}
    >
      <Title
        Text={translator("whatsappManagement.campaignManagement")}
        Classes={classes.whatsappTemplateTitle}
        ContainerStyle={{}}
        Element={null}
      />

      <div className={classes.manageWhatsappTemplates}>
        <Grid container spacing={2} className={classes.lineTopMarging}>
          <Grid item>
            <TextField
              variant="outlined"
              size="small"
              value={campaineNameSearch}
              onChange={handleCampainNameChange}
              className={clsx(classes.textField, classes.minWidth252)}
              placeholder={translator(
                "sms.GridBoundColumnResource2.HeaderText"
              )}
            />
          </Grid>

          {windowSize !== "xs" && (
            <Grid item>
              <KeyboardDatePicker
                inputVariant="outlined"
                className={clsx(classes.textField)}
                inputProps={{
                  className: classes.datePickerInput,
                }}
                variant="inline"
                keyboardIcon={<CalendarIcon />}
                format={"DD/MM/YYYY"}
                placeholder={translator(
                  "whatsappManagement.fromDatePlaceholder"
                )}
                initialFocusedDate={moment()}
                value={fromDate}
                onChange={handleFromDate}
                onClose={() => setIsFromDatePickerOpen(false)}
                open={isFromDatePickerOpen}
                onClick={() => setIsFromDatePickerOpen(true)}
                autoOk={true}
              />
            </Grid>
          )}

          {windowSize !== "xs" && (
            <Grid item>
              <KeyboardDatePicker
                inputVariant="outlined"
                className={clsx(classes.textField)}
                inputProps={{
                  className: classes.datePickerInput,
                }}
                variant="inline"
                keyboardIcon={<CalendarIcon />}
                format={"DD/MM/YYYY"}
                placeholder={translator("whatsappManagement.toDatePlaceholder")}
                initialFocusedDate={moment()}
                value={toDate}
                onChange={handleToDate}
                onClose={() => setIsToDatePickerOpen(false)}
                open={isToDatePickerOpen}
                onClick={() => setIsToDatePickerOpen(true)}
                autoOk={true}
              />
            </Grid>
          )}

          <Grid item>
            <Button
              size="large"
              variant="contained"
              onClick={onSearch}
              className={classes.searchButton}
              endIcon={<SearchIcon />}
            >
              {translator("campaigns.btnSearchResource1.Text")}
            </Button>
          </Grid>
          {isSearching && (
            <Grid item>
              <Button
                size="large"
                variant="contained"
                onClick={clearSearch}
                className={classes.searchButton}
                endIcon={<ClearIcon />}
              >
                {translator("common.clear")}
              </Button>
            </Grid>
          )}
        </Grid>

        <Grid
          container
          spacing={2}
          className={classes.manageTemplatesHeaderButtons}
        >
          <div>
            <Button className={"green"} onClick={() => onCreateCamoaign()}>
              {translator("whatsappManagement.createCampaign")}
            </Button>
            <Button
              className={"blue"}
              onClick={() => setIsRestoreDeletedModal(true)}
            >
              {translator("whatsappManagement.restore")}
            </Button>
          </div>

          <span className={classes.manageTemplatesCampaignCount}>
            {tableData?.length || 0}{" "}
            {translator("whatsappManagement.campaigns")}
          </span>
        </Grid>

        <Grid
          container
          spacing={2}
          className={classes.manageTemplatesTableWrapper}
        >
          <TableContainer>
            <Table className={classes.tableContainer}>
              {windowSize !== "xs" && (
                <TableHead>
                  <TableRow classes={rowStyle}>
                    <TableCell
                      classes={cellStyle}
                      className={classes.flex3}
                      align="center"
                    >
                      {translator("sms.GridBoundColumnResource2.HeaderText")}
                    </TableCell>
                    <TableCell
                      classes={cellStyle}
                      className={classes.flex1}
                      align="center"
                    >
                      {translator("campaigns.recipients")}
                    </TableCell>
                    <TableCell
                      classes={cellStyle}
                      className={classes.flex1}
                      align="center"
                    >
                      {translator("sms.CreditsResource1.HeaderText")}
                    </TableCell>
                    <TableCell
                      classes={cellStyle}
                      className={classes.flex1}
                      align="center"
                    >
                      {translator("sms.StatusResource1.HeaderText")}
                    </TableCell>
                    <TableCell
                      classes={{ root: classes.tableCellRoot }}
                      className={classes.flex5}
                    ></TableCell>
                  </TableRow>
                </TableHead>
              )}
              {getRows()?.map((template: campaignDataProps) => (
                <TableRow
                  key={Math.round(Math.random() * 999999999)}
                  classes={rowStyle}
                >
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.flex3, classes.tableCellBody)}
                  >
                    {renderNameCell(template)}
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.flex1, classes.tableCellBody)}
                  >
                    {renderRecipientsCell(template.recipients)}
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.flex1, classes.tableCellBody)}
                  >
                    {renderMessagesCell(template.messages)}
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.flex1, classes.tableCellBody)}
                  >
                    {renderStatusCell(template.status)}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="row"
                    className={clsx(classes.flex5, classes.tableCellRoot)}
                  >
                    {renderCellIcons(template)}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </TableContainer>
        </Grid>
        <Pagination
          classes={classes}
          rows={tableData?.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(rowsNumber: number) =>
            setRowsPerPage(rowsNumber)
          }
          rowsPerPageOptions={[6, 10, 20, 50]}
          page={page}
          onPageChange={(pageNumber: number) => setPage(pageNumber)}
          returnPageOne={false}
        />
      </div>

      <RestoreDeletedModal
        classes={classes}
        title={"Select the WhatsApp campaigns you want to restore"}
        isOpen={isRestoreDeletedModal}
        onClose={() => setIsRestoreDeletedModal(false)}
        onConfirmOrYes={() => onRestoreDeleted()}
        deletedCampaigns={deletedCampaigns}
        restoreIds={restoreIds}
        setRestoreIds={(ids: string[]) => setRestoreIds(ids)}
      />

      <AlertModal
        classes={classes}
        isOpen={isPreviewCampaignOpen}
        onClose={() => setIsPreviewCampaignOpen(false)}
        title={translator("whatsappManagement.preview")}
        subtitle={translator("whatsappManagement.preview")}
        onConfirmOrYes={() => setIsPreviewCampaignOpen(false)}
        type="alert"
      >
        <Box className={classes.alertModalContentMobile}>
          <WhatsappMobilePreview
            classes={classes}
            campaignNumber="1"
            templateData={templateData}
            buttonType={buttonType}
            fileData={fileData}
          />
        </Box>
      </AlertModal>

      <AlertModal
        classes={classes}
        isOpen={isDuplicateCampaignOpen}
        onClose={() => setIsDuplicateCampaignOpen(false)}
        title={translator("whatsappManagement.duplicateCampaign")}
        subtitle={translator("whatsappManagement.duplicateCampaignDesc")}
        type="delete"
        onConfirmOrYes={() => onDuplicateCampaign()}
      />

      <AlertModal
        classes={classes}
        isOpen={isDeleteCampaignOpen}
        onClose={() => setIsDeleteCampaignOpen(false)}
        title={translator("whatsappManagement.deleteCampaign")}
        subtitle={translator("whatsappManagement.deleteCampaignDesc")}
        type="delete"
        onConfirmOrYes={() => onDeleteCampaign()}
      />

      <InfoModal
        classes={classes}
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={translator("whatsappManagement.campaignGroups")}
        requiredFields={infoModalData}
      />
    </DefaultScreen>
  );
};

export default ManageWhatsAppCampaigns;
