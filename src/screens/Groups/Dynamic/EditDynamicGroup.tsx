import { useDispatch, useSelector } from 'react-redux';
import { useState, memo, useEffect } from 'react';
import clsx from 'clsx';
import {
    Tabs, Tab, Box, Button
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he'
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import Groups from '../../../components/Groups/GroupsHandler/Groups';
import { TabContext, TabPanel } from '@material-ui/lab';
import { Loader } from '../../../components/Loader/Loader';
import { MyActivities, ActivtyInterval, CondType, Conditions, DynamicGroupModel } from '../../../Models/Groups/DynamicGroup';
import PersonalDetails from './Tabs/PersonalDetails';
// import EventsDetails from './Tabs/EventsDetails';
import DateDetails from './Tabs/DateDetails';
import ActivityDetails from './Tabs/ActivityDetails';
import { getById, save } from '../../../redux/reducers/DynamicGroupsSlice';
import { useParams, useNavigate } from 'react-router-dom';
import useRedirect from '../../../helpers/Routes/Redirect';
import { sitePrefix } from '../../../config';
import { BiSave } from 'react-icons/bi';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import UpdateGroup from './Tabs/UpdateGroup';
import { Group } from '../../../Models/Groups/Group';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import Toast from '../../../components/Toast/Toast.component';

const EditDynamicGroup = ({ classes }: any) => {
    const dispatch: any = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const Redirect = useRedirect();
    const { subAccountAllGroups } = useSelector((state: any) => state.group);
    const { testGroups } = useSelector((state: any) => state.sms);
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [dynamicGroupModel, setDynamicGroupModel] = useState<any>({
        Group: {
            CreationDate: null,
            DynamicData: '',
            DynamicLastUpdate: null,
            DynamicUpdatePolicy: 0,
            GroupID: 0,
            GroupName: '',
            IsDynamic: true,
            IsTestGroup: false,
            Recipients: 0,
            SubAccountID: -1,
            UpdateDate: null
        },
        dynamicData: {
            MyActivities: {
                IsNotOpened: false,
                IsNotOpenedFromDate: null,
                IsNotOpenedInterval: ActivtyInterval.Last2Weeks,
                IsNotOpenedToDate: null,
                IsOpened: false,
                IsOpenedFromDate: null,
                IsOpenedInterval: ActivtyInterval.Last2Weeks,
                IsOpenedToDate: null
            } as MyActivities,
            MyConditions: [{
                FirstName: '',
                FirstNameCond: CondType.Undefined,
                LastName: '',
                LastNameCond: CondType.Undefined,
                Email: '',
                EmailCond: CondType.Undefined,
                // Address: '',
                // AddressCond: CondType.Undefined,
                City: '',
                CityCond: CondType.Undefined,
                Country: '',
                CountryCond: CondType.Undefined,
                // State: '',
                // StateCond: CondType.Undefined,
                // Zip: '',
                // ZipCond: CondType.Undefined,
                // Telephone: '',
                // TelephoneCond: CondType.Undefined,
                // Cellphone: '',
                // CellphoneCond: CondType.Undefined,
                Company: '',
                ComapnyCond: CondType.Undefined,
                BirthDateFrom: null,
                BirthDateTo: null,
                BirthDateFromWithoutYear: null,
                BirthDateToWithoutYear: null,
                ReminderFrom: null,
                ReminderTo: null,
                CreatedFrom: null,
                CreatedTo: null,
                Status: 1, // Active
                StatusCond: CondType.Undefined,
                SmsStatus: 0, // Active
                SmsStatusCond: CondType.Undefined,
                ExtraField1: '',
                ExtraField1Cond: CondType.Undefined,
                ExtraField2: '',
                ExtraField2Cond: CondType.Undefined,
                ExtraField3: '',
                ExtraField3Cond: CondType.Undefined,
                ExtraField4: '',
                ExtraField4Cond: CondType.Undefined,
                ExtraField5: '',
                ExtraField5Cond: CondType.Undefined,
                ExtraField6: '',
                ExtraField6Cond: CondType.Undefined,
                ExtraField7: '',
                ExtraField7Cond: CondType.Undefined,
                ExtraField8: '',
                ExtraField8Cond: CondType.Undefined,
                ExtraField9: '',
                ExtraField9Cond: CondType.Undefined,
                ExtraField10: '',
                ExtraField10Cond: CondType.Undefined,
                ExtraField11: '',
                ExtraField11Cond: CondType.Undefined,
                ExtraField12: '',
                ExtraField12Cond: CondType.Undefined,
                ExtraField13: '',
                ExtraField13Cond: CondType.Undefined,
                ExtraDate1From: null,
                ExtraDate1To: null,
                ExtraDate2From: null,
                ExtraDate2To: null,
                ExtraDate3From: null,
                ExtraDate3To: null,
                ExtraDate4From: null,
                ExtraDate4To: null
            }] as Conditions[],
            MyGroups: [] as number[],
            ShowClicked: false,
            ShowOpened: false,
            ShowNotClicked: false,
            ShowNotOpened: false
        } as DynamicGroupModel
    });
    const [tabValue, setTabValue] = useState('0');
    const [selectedGroups, setSelectedGroups] = useState<any>([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);
    const [showTestGroups, setShowTestGroups] = useState(false);
    const { id } = useParams();
    const { isRTL } = useSelector((state: any) => state.core);

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return <Toast customData={toastMessage} data={null} />;
    };

    const onSave = async () => {
        setLoader(true);
        var requestObject = { Group: dynamicGroupModel?.Group, DynamicData: dynamicGroupModel?.dynamicData } as any;
        const response = await dispatch(save(requestObject));
        handleResponse(response.payload);
    }

    const showErrorToast = (message: string) => setToastMessage({ severity: 'error', color: 'error', message, showAnimtionCheck: false } as any)

    const handleResponse = (response: any) => {
        switch (response.StatusCode) {
            case 201: {
                getData(true);
                break;
            }
            case 400: { // Group does not updated due to incorrect data
                showErrorToast(t('group.saveDynamicGroupResponse.400'));
                break;
            }
            case 401: {
                logout();
                break;
            }
            case 402: { // Group does not updated due to broken request
                showErrorToast(t('group.saveDynamicGroupResponse.402'));
                break;
            }
            case 404: { // Not found
                showErrorToast(t('group.saveDynamicGroupResponse.404'));
                break;
            }
            case 500:
            default: {
                showErrorToast(t('common.Error'));
                break;
            }
        }
    }

    const onBack = () => {
        navigate(`${sitePrefix}Groups/Dynamic`);
    }

    const getData = async (isAfterSave?: boolean | never) => {
        setLoader(true);
        const groups = await dispatch(getById(id));
        if (groups.payload.StatusCode === 404) {
            Redirect({ url: `${sitePrefix}Groups/Dynamic`, openNewTab: false, preventRedirect: true });
            return false;
        }
        const {
            Group,
            dynamicData: {
                MyActivities, MyConditions, MyGroups
            }
        } = groups?.payload?.Data;
        setDynamicGroupModel({
            Group: Group,
            dynamicData: {
                MyActivities: MyActivities,
                MyConditions: MyConditions?.length > 0 ? MyConditions : dynamicGroupModel.dynamicData.MyConditions,
                MyGroups: MyGroups
            }
        });

        if (subAccountAllGroups.length === 0) {
            dispatch(getGroupsBySubAccountId());
        }
        if (isAfterSave) {
            setToastMessage({ severity: 'success', color: 'success', message: t('group.saveDynamicGroupResponse.201').replace('{0}', Group?.Recipients), showAnimtionCheck: false } as any);
        }
        setLoader(false);
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        const selectedgroupsList = [] as Group[];
        if (subAccountAllGroups?.length > 0 && dynamicGroupModel?.dynamicData?.MyGroups?.length > 0) {
            dynamicGroupModel?.dynamicData?.MyGroups.forEach((gl: number) => {
                const exist = subAccountAllGroups?.filter((g: Group) => { return g.GroupID === gl });
                if (exist && exist.length > 0) {
                    selectedgroupsList.push(exist[0]);
                }
            });
        }
        setSelectedGroups(selectedgroupsList);
    }, [dynamicGroupModel, subAccountAllGroups])

    const callbackUpdateGroups = (groups: any) => {
        const found = selectedGroups.map((group: Group) => { return group.GroupID; }).includes(groups.GroupID);
        const groupList: Group[] = found
            ? selectedGroups.filter((g: Group) => g.GroupID !== groups.GroupID)
            : [...selectedGroups, groups];
        setSelectedGroups(groupList);

        setDynamicGroupModel({
            ...dynamicGroupModel,
            dynamicData: {
                ...dynamicGroupModel.dynamicData,
                MyGroups: groupList.map((value: Group) => value.GroupID)
            }
        });
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
        setDynamicGroupModel({
            ...dynamicGroupModel,
            dynamicData: {
                ...dynamicGroupModel.dynamicData,
                MyGroups: groupList.map((value: Group) => value.GroupID)
            }
        });
    }

    const updateMyConditions = (keyName: string, value: string) => {
        const resetCondition = ['FirstName', 'LastName', 'Email', 'Country', 'City', 'Company'];
        const reset = value === '' && resetCondition.indexOf(keyName) != -1 ? true : false;
        setDynamicGroupModel({
            ...dynamicGroupModel, dynamicData: {
                ...dynamicGroupModel.dynamicData,
                MyConditions: [
                    {
                        ...dynamicGroupModel.dynamicData.MyConditions[0],
                        [keyName]: value,
                        ... reset && { [`${keyName}Cond`]: CondType.Undefined }
                    }
                ]
            }
        });
    }

    const updateMyActivities = (keyName: string, value: string) => {
        setDynamicGroupModel({
            ...dynamicGroupModel, dynamicData: {
                ...dynamicGroupModel.dynamicData,
                MyActivities: {
                    ...dynamicGroupModel.dynamicData.MyActivities,
                    [keyName]: value
                }
            }
        });
    }

    const updateGroup = (keyName: string, value: string) => {
        setDynamicGroupModel({
            ...dynamicGroupModel, Group: {
                ...dynamicGroupModel.Group,
                [keyName]: value
            }
        });
    }

    return (
        <>
            <Loader isOpen={showLoader} />
            {toastMessage && renderToast()}
            <Tabs
                value={tabValue}
                onChange={(e, value) => setTabValue(value)}
                className={clsx(classes.mr15, classes.ml15)}
                classes={{ indicator: classes.hideIndicator }}
            >
                <Tab
                    label={t('common.PersonalDetails')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='0'
                />
                <Tab
                    label={t('recipient.dates')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='1'
                />
                <Tab
                    label={t('common.ActivityLevel')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='2'
                />
                {/* <Tab
                    label={t('common.events')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='3'
                /> */}
                <Tab
                    label={t('common.Groups')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='4'
                />

                <Tab
                    label={t('group.updateGroup')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='5'
                />
            </Tabs>

            <TabContext value={`${tabValue}`}>
                <TabPanel value='0'>
                    <PersonalDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyConditions} />
                </TabPanel>

                <TabPanel value='1'>
                    <DateDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyConditions} />
                </TabPanel>
                <TabPanel value='2'>
                    <ActivityDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyActivities} />
                </TabPanel>
                {/* <TabPanel value='3'>
                    <EventsDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyConditions} />
                </TabPanel> */}

                <TabPanel value='4'>
                    <div className={clsx(classes.fullWidth, classes.pt25)}>
                        <Groups
                            classes={classes}
                            list={
                                showTestGroups
                                    ? [...subAccountAllGroups, ...testGroups]
                                    : [...subAccountAllGroups]
                            }
                            // test={showTestGroups}
                            selectedList={selectedGroups}
                            callbackSelectedGroups={callbackUpdateGroups}
                            callbackUpdateGroups={() => { }} //onUpdateGroups
                            callbackSelectAll={callbackSelectAll}
                            callbackReciFilter={() => { }} // onReciFilter
                            callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
                            key={"dynuacGroups"}
                            uniqueKey={'groups_4'}
                            innerHeight={325}
                            showSortBy={true}
                            showFilter={false}
                            showSelectAll={true}
                            bsDot={null}
                            isNotifications={false}
                            isSms={true}
                            isCampaign={false}
                            noSelectionText={''}
                        // isFilterSelected={false}
                        />
                    </div>
                </TabPanel>

                <TabPanel value='5'>
                    <UpdateGroup classes={classes} data={dynamicGroupModel} onUpdate={updateGroup} />
                </TabPanel>
            </TabContext>
            <Box className={clsx(classes.flex, classes.pt25)} style={{ justifyContent: 'end', marginTop: 15 }}>
                <Button
                    onClick={onBack}
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.backButton
                    )}
                    startIcon={!isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                >
                    {t('common.back')}
                </Button>
                <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded
                    )}
                    style={{ margin: '8px' }}
                    startIcon={<BiSave />}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    onClick={onSave}
                >
                    {t("common.save")}
                </Button>
            </Box>
        </>
    )
}

export default memo(EditDynamicGroup);