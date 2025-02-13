import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from "@material-ui/core";
import DefaultScreen from "../DefaultScreen";
import { Title } from "../../components/managment/Title";
import clsx from 'clsx'
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import queryString from 'query-string';
import { getGroupsBySubAccountId } from '../../redux/reducers/groupSlice';
import Groups from '../../components/Groups/GroupsHandler/Groups';
import { Group } from '../../Models/Groups/Group';
import ClientSearchPersonalDetails from "./ClientSearchPersonalDetails";
import ClientSearchLocation from "./ClientSearchLocation";
import ClientSearchDates from "./ClientSearchDates";
import ClientSearchCampaigns from "./ClientSearchCampaigns";
import ClientSearchExtraFields from "./ClientSearchExtraFields";
import { CLIENT_CONSTANTS } from "../../model/Clients/Contants";
import { useNavigate } from "react-router-dom";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

const ClientSearch = ({ classes }: any) => {
  const { windowSize, isRTL } = useSelector((state: any) => state.core);
  const { t } = useTranslation();
  const qs = (window.location.search && queryString.parse(window.location.search)) as any;
  const [openPanels, setOpenPanels] = useState<string[]>([qs?.p || '1', '6']);
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const { testGroups } = useSelector((state: any) => state.sms);
  const [selectedGroups, setSelectedGroups] = useState<any>([]);
  const [allGroupsSelected, setAllGroupsSelected] = useState(false);
  const [showTestGroups, setShowTestGroups] = useState(false);
  const [searchModel, setSearchModel] = useState<any>({
    IsSearchByFilter: true,
    IsAdvanced: true,
    PageSize: 6,
    PageIndex: 1,
    SearchTerm: '',
    Status: null,
    PageType: null,
    ReportType: 10,
    TestStatusOfEmailElseSms: null,
    Switch: '',
    CountryOrRegion: '',
    GroupIds: [],
    NodeID: '',
    OrderBy: 0,
    MyActivities: {
      IsOpened: null,
      IsOpenedInterval: 0,
      IsOpenedFromDate: null,
      IsOpenedToDate: null,
      IsNotOpened: null,
      IsNotOpenedInterval: 0,
      IsNotOpenedFromDate: null,
      IsNotOpenedToDate: null
    },
    MyConditions: [
      {
        FirstName: null,
        FirstNameCond: 2,
        LastName: null,
        LastNameCond: 0,
        Email: null,
        EmailCond: 0,
        Address: null,
        AddressCond: 0,
        City: null,
        CityCond: 0,
        Country: null,
        CountryCond: 0,
        State: null,
        StateCond: 0,
        Zip: null,
        ZipCond: 0,
        Telephone: null,
        TelephoneCond: 0,
        Cellphone: null,
        CellphoneCond: 2,
        Company: null,
        ComapnyCond: 0,
        BirthDateFrom: null,
        BirthDateTo: null,
        BirthDateFromWithoutYear: null,
        BirthDateToWithoutYear: null,
        ReminderFrom: null,
        ReminderTo: null,
        CreatedFrom: null,
        CreatedTo: null,
        Status: 0,
        StatusCond: 0,
        SmsStatus: 0,
        SmsStatusCond: 0,
        ExtraField1: null,
        ExtraField1Cond: 0,
        ExtraField2: null,
        ExtraField2Cond: 0,
        ExtraField3: null,
        ExtraField3Cond: 0,
        ExtraField4: null,
        ExtraField4Cond: 0,
        ExtraField5: null,
        ExtraField5Cond: 0,
        ExtraField6: null,
        ExtraField6Cond: 0,
        ExtraField7: null,
        ExtraField7Cond: 0,
        ExtraField8: null,
        ExtraField8Cond: 0,
        ExtraField9: null,
        ExtraField9Cond: 0,
        ExtraField10: null,
        ExtraField10Cond: 0,
        ExtraField11: null,
        ExtraField11Cond: 0,
        ExtraField12: null,
        ExtraField12Cond: 0,
        ExtraField13: null,
        ExtraField13Cond: 0,
        ExtraDate1From: null,
        ExtraDate1To: null,
        ExtraDate2From: null,
        ExtraDate2To: null,
        ExtraDate3From: null,
        ExtraDate3To: null,
        ExtraDate4From: null,
        ExtraDate4To: null
      }
    ],
    MyGroups: [],
    ShowOpened: false,
    ShowNotOpened: false,
    ShowClicked: false,
    ShowNotClicked: false
  });

  const navigate = useNavigate();

  const onSearch = () => {
    navigate(CLIENT_CONSTANTS.BASEURL, {
      state: searchModel
    })
  }

  const onUpdate = (keyName: string, value: string) => {
    setSearchModel({ ...searchModel, [keyName]: value })
  }

  const updateMyConditions = (keyName: string, value: string) => {
    setSearchModel({
      ...searchModel,
      MyConditions: [
        {
          ...searchModel.MyConditions[0],
          [keyName]: value
        }
      ]
    })
  }

  const callbackUpdateGroups = (groups: any, event: any) => {
    if (event) {
      setSearchModel({ ...searchModel, groups: groups.map((value: Group) => value.GroupID) });
    }
    else {
      const found = selectedGroups.map((group: Group) => { return group.GroupID; }).includes(groups.GroupID);
      const groupList: Group[] = found
        ? selectedGroups.filter((g: Group) => g.GroupID !== groups.GroupID)
        : [...selectedGroups, groups];
      setSelectedGroups(groupList);
    }
  }
  const callbackSelectAll = () => {
    let groupList: Group[] = [];
    if (!allGroupsSelected) {
      groupList = showTestGroups
        ? [...testGroups, ...subAccountAllGroups]
        : [...subAccountAllGroups];
    } else {
      groupList = [];
    }
    setSelectedGroups(groupList);
    setAllGroupsSelected(!allGroupsSelected);
  }

  const handlePanels = (panelName: string) => {
    const found = openPanels.filter((x: string) => { return x === panelName });
    if (found && found?.length > 0) {
      setOpenPanels(openPanels.filter((x: string) => { return x !== panelName }))
    } else {
      setOpenPanels([...openPanels, panelName]);
    }
  }

  return <DefaultScreen
    currentPage={'groups'}
    subPage="clientSearch"
    containerClass={clsx(classes.management, classes.mb50)}
    classes={classes}
  >
    <Box className={'topSection'}>
      <Title
        classes={classes}
        Text={t("client.logPageHeaderResource1.search")}
      />
      <Box className={classes.accordion} style={{ padding: 15 }}>
        <Accordion expanded={openPanels.indexOf('1') > -1} onChange={() => handlePanels('1')} elevation={0}
          classes={{
            root: classes.MuiAccordionroot
          }}>
          <AccordionSummary aria-controls="1-content" id="1-header">
            <Title autoWidth={false} isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('1') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                <Typography
                  style={{ width: 'auto', marginInlineStart: 15 }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("common.PersonalDetails")}
                </Typography>
              </Box>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ paddingInline: 25, paddingBlock: 20, width: '100%' }} className={classes.dFlex}>
              <ClientSearchPersonalDetails classes={classes} data={searchModel} onUpdate={updateMyConditions} onEnter={onSearch} />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={openPanels.indexOf('2') > -1} onChange={() => handlePanels('2')} elevation={0}
          classes={{
            root: classes.MuiAccordionroot
          }}>
          <AccordionSummary aria-controls="2-content" id="2-header">
            <Title autoWidth={false} isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('2') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                <Typography
                  style={{ width: 'auto', marginInlineStart: 15 }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("common.Location")}
                </Typography>
              </Box>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ paddingInline: 25, paddingBlock: 20, width: '100%' }} className={classes.dFlex}>
              <ClientSearchLocation classes={classes} data={searchModel} onUpdate={updateMyConditions} onEnter={onSearch} />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={openPanels.indexOf('3') > -1} onChange={() => handlePanels('3')} elevation={0}
          classes={{
            root: classes.MuiAccordionroot
          }}>
          <AccordionSummary aria-controls="3-content" id="3-header">
            <Title autoWidth={false} isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('3') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                <Typography
                  style={{ width: 'auto', marginInlineStart: 15 }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("common.Dates")}
                </Typography>
              </Box>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
              <ClientSearchDates classes={classes} data={searchModel} onUpdate={updateMyConditions} />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={openPanels.indexOf('4') > -1} onChange={() => handlePanels('4')} elevation={0}
          classes={{
            root: classes.MuiAccordionroot
          }}>
          <AccordionSummary aria-controls="4-content" id="4-header">
            <Title autoWidth={false} isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('4') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                <Typography
                  style={{ width: 'auto', marginInlineStart: 15 }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("common.Campaign")}
                </Typography>
              </Box>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ paddingInline: 25, paddingBlock: 20, width: '100%' }} className={classes.dFlex}>
              <ClientSearchCampaigns classes={classes} data={searchModel} onUpdate={onUpdate} />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={openPanels.indexOf('5') > -1} onChange={() => handlePanels('5')} elevation={0}
          classes={{
            root: classes.MuiAccordionroot
          }}>
          <AccordionSummary aria-controls="5-content" id="5-header">
            <Title autoWidth={false} isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('5') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                <Typography
                  style={{ width: 'auto', marginInlineStart: 15 }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("common.extraFields")}
                </Typography>
              </Box>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
              <ClientSearchExtraFields classes={classes} data={searchModel} onUpdate={updateMyConditions} />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={openPanels.indexOf('6') > -1} onChange={() => handlePanels('6')} elevation={0}
          classes={{
            root: classes.MuiAccordionroot
          }}>
          <AccordionSummary aria-controls="5-content" id="5-header">
            <Title autoWidth={false} isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('6') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                <Typography
                  style={{ width: 'auto', marginInlineStart: 15 }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("common.Groups")}
                </Typography>
              </Box>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
              {/* groups */}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box className={clsx(classes.flex, classes.pt25)} style={{ justifyContent: 'start', paddingInlineStart: 25 }}>
        <Button
          onClick={onSearch}
          className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
          {t('notifications.buttons.search')}
        </Button>
      </Box>
    </Box>
  </DefaultScreen>
}

export default ClientSearch;