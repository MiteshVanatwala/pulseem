import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from "@material-ui/core";
import DefaultScreen from "../DefaultScreen";
import { Title } from "../../components/managment/Title";
import clsx from 'clsx'
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
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
import { getTestGroups } from "../../redux/reducers/smsSlice";
import { ClientSearchModel } from "../../Models/Clients/ClientSearch";
import { DEFAULT_CLIENT_SEARCH } from "../../helpers/Constants";

const ClientSearch = ({ classes }: any) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const { t } = useTranslation();
  const qs = (window.location.search && queryString.parse(window.location.search)) as any;
  const [openPanels, setOpenPanels] = useState<string[]>([qs?.p || '1', '6']);
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const { testGroups } = useSelector((state: any) => state.sms);
  const [selectedGroups, setSelectedGroups] = useState<any>([]);
  const [allGroupsSelected, setAllGroupsSelected] = useState(false);
  const [showTestGroups, setShowTestGroups] = useState(false);
  const dispatch = useDispatch();
  const [searchModel, setSearchModel] = useState<ClientSearchModel>(DEFAULT_CLIENT_SEARCH);

  const navigate = useNavigate();

  useEffect(() => {
    if (subAccountAllGroups.length === 0) {
      dispatch(getGroupsBySubAccountId());
      dispatch(getTestGroups());
    }
  }, [])

  useEffect(() => {
    const selectedgroupsList = [] as Group[];
    if (subAccountAllGroups?.length > 0 && searchModel?.MyGroups?.length > 0) {
      searchModel?.MyGroups.forEach((gl: number) => {
        const exist =  [...testGroups, ...subAccountAllGroups]?.filter((g: Group) => { return g.GroupID === gl });
        if (exist && exist.length > 0) {
          selectedgroupsList.push(exist[0]);
        }
      });
    }
    setSelectedGroups(selectedgroupsList);
  }, [searchModel, subAccountAllGroups])

  const onSearch = () => {
    navigate(CLIENT_CONSTANTS.BASEURL, {
      state: searchModel
    })
  }

  const onUpdate = (keyName: string, value: string) => {
    setSearchModel({ ...searchModel, [keyName]: value })
  }

  const updateMyConditions = (keyName: string, value: string, forceSearch: boolean = false) => {
    const updatedModel = {
      ...searchModel,
      MyConditions: [
        {
          ...searchModel.MyConditions[0],
          [keyName]: value
        }
      ]
    };
    setSearchModel(updatedModel)
    if (forceSearch) {
      // newModel
      navigate(CLIENT_CONSTANTS.BASEURL, {
        state: updatedModel
      })

    }
  }

  const callbackUpdateGroups = (groups: any, event: any) => {
    if (event) {
      setSelectedGroups(groups);
      setSearchModel({ ...searchModel, MyGroups: groups.map((value: Group) => value.GroupID) });
    }
    else {
      const found = selectedGroups.map((group: Group) => { return group.GroupID; }).includes(groups.GroupID);
      const groupList: Group[] = found
        ? selectedGroups.filter((g: Group) => g.GroupID !== groups.GroupID)
        : [...selectedGroups, groups];

      setSearchModel({ ...searchModel, MyGroups: groupList.map((value: Group) => value.GroupID) });
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
    setSearchModel({ ...searchModel, MyGroups: groupList?.map((value: Group) => value.GroupID) });
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
              <ClientSearchPersonalDetails classes={classes} data={searchModel} onUpdate={updateMyConditions} />
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
              <ClientSearchLocation classes={classes} data={searchModel} onUpdate={updateMyConditions} />
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
            <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={clsx(classes.dFlex, classes.w100)}>
              <Box className={clsx(classes.fullWidth)}>
                <Groups
                  classes={classes}
                  list={
                    showTestGroups
                      ? [...subAccountAllGroups, ...testGroups]
                      : [...subAccountAllGroups]
                  }
                  selectedList={selectedGroups}
                  callbackSelectedGroups={callbackUpdateGroups}
                  callbackUpdateGroups={callbackUpdateGroups}
                  callbackSelectAll={callbackSelectAll}
                  callbackReciFilter={() => { }}
                  callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
                  key={"searchGroups"}
                  uniqueKey={'searchGroups1'}
                  innerHeight={325}
                  showSortBy={true}
                  showFilter={false}
                  showSelectAll={true}
                  bsDot={null}
                  isNotifications={false}
                  isSms={true}
                  isCampaign={false}
                  noSelectionText={''}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box position={'fixed'} className={clsx(classes.flex, classes.stickBottom)}>
        <Box style={{ width: '80%', margin: '0 auto', justifyContent: 'flex-end' }} className={clsx(classes.flex)}>
          <Button
            onClick={onSearch}
            className={clsx(classes.btn, classes.btnRounded, classes.redButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('notifications.buttons.search')}
          </Button>
        </Box>
      </Box>
    </Box>
  </DefaultScreen>
}

export default ClientSearch;