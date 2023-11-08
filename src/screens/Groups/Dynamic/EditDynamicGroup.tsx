import { useDispatch, useSelector } from 'react-redux';
import { useState, memo, useEffect } from 'react';
import clsx from 'clsx';
import {
    Tabs, Tab, Box, Button
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he'
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import Groups from '../../Whatsapp/Campaign/Components/Groups/Groups';
import { TabContext, TabPanel } from '@material-ui/lab';
import { Loader } from '../../../components/Loader/Loader';
import { ActivityGroup, ActivtyInterval, CondType, Conditions, DynamicGroupModel } from '../../../Models/Groups/DynamicGroup';
import PersonalDetails from './Tabs/PersonalDetails';
import LocationDetails from './Tabs/LocationDetails';
import DateDetails from './Tabs/DateDetails';
import ActivityDetails from './Tabs/ActivityDetails';
import { getById } from '../../../redux/reducers/DynamicGroupsSlice';
import { useParams, useNavigate } from 'react-router-dom';
import useRedirect from '../../../helpers/Routes/Redirect';
import { sitePrefix } from '../../../config';
import { BiSave } from 'react-icons/bi';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import UpdateGroup from './Tabs/UpdateGroup';
import { Group } from '../../../Models/Groups/Group';

const EditDynamicGroup = ({ classes }: any) => {
    const dispatch: any = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const Redirect = useRedirect();
    const { subAccountAllGroups } = useSelector((state: any) => state.group);
    const { testGroups } = useSelector((state: any) => state.sms);

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
            } as ActivityGroup,
            MyConditions: [{
                FirstName: '',
                FirstNameCond: CondType.Equal,
                LastName: '',
                LastNameCond: CondType.Equal,
                Email: '',
                EmailCond: CondType.Equal,
                Address: '',
                AddressCond: CondType.Equal,
                City: '',
                CityCond: CondType.Equal,
                Country: '',
                CountryCond: CondType.Equal,
                State: '',
                StateCond: CondType.Equal,
                Zip: '',
                ZipCond: CondType.Equal,
                Telephone: '',
                TelephoneCond: CondType.Equal,
                Cellphone: '',
                CellphoneCond: CondType.Equal,
                Company: '',
                ComapnyCond: CondType.Equal,
                BirthDateFrom: null,
                BirthDateTo: null,
                BirthDateFromWithoutYear: null,
                BirthDateToWithoutYear: null,
                ReminderFrom: null,
                ReminderTo: null,
                CreatedFrom: null,
                CreatedTo: null,
                ExtraField1: '',
                ExtraField1Cond: CondType.Equal,
                Status: 0,
                StatusCond: CondType.Equal,
                SmsStatus: 1,
                SmsStatusCond: CondType.Equal,
                ExtraField2: '',
                ExtraField2Cond: CondType.Equal,
                ExtraField3: '',
                ExtraField3Cond: CondType.Equal,
                ExtraField4: '',
                ExtraField4Cond: CondType.Equal,
                ExtraField5: '',
                ExtraField5Cond: CondType.Equal,
                ExtraField6: '',
                ExtraField6Cond: CondType.Equal,
                ExtraField7: '',
                ExtraField7Cond: CondType.Equal,
                ExtraField8: '',
                ExtraField8Cond: CondType.Equal,
                ExtraField9: '',
                ExtraField9Cond: CondType.Equal,
                ExtraField10: '',
                ExtraField10Cond: CondType.Equal,
                ExtraField11: '',
                ExtraField11Cond: CondType.Equal,
                ExtraField12: '',
                ExtraField12Cond: CondType.Equal,
                ExtraField13: '',
                ExtraField13Cond: CondType.Equal,
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

    const onSave = () => {
        console.log(dynamicGroupModel);
    }

    const onBack = () => {
        navigate(`${sitePrefix}Groups/Dynamic`);
    }

    const getData = async () => {
        setLoader(true);
        const groups = await dispatch(getById(id));

        if (groups.payload.StatusCode === 404) {
            Redirect({ url: `${sitePrefix}Groups/Dynamic`, openNewTab: false, preventRedirect: true });
            return false;
        }
        setDynamicGroupModel(groups?.payload?.Data);

        if (subAccountAllGroups.length === 0) {
            dispatch(getGroupsBySubAccountId());
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
        setDynamicGroupModel({
            ...dynamicGroupModel, dynamicData: {
                ...dynamicGroupModel.dynamicData,
                MyConditions: [
                    {
                        ...dynamicGroupModel.dynamicData.MyConditions[0],
                        [keyName]: value
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
                    label={t('common.Location')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='1'
                />

                <Tab
                    label={t('common.Dates')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='2'
                />

                <Tab
                    label={t('common.ActivityLevel')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='3'
                />

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
                    <LocationDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyConditions} />
                </TabPanel>

                <TabPanel value='2'>
                    <DateDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyConditions} />
                </TabPanel>

                <TabPanel value='3'>
                    <ActivityDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyActivities} />
                </TabPanel>

                <TabPanel value='4'>
                    <div className={clsx(classes.fullWidth, classes.pt25)}>
                        <Groups
                            classes={classes}
                            list={
                                showTestGroups
                                    ? [...subAccountAllGroups, ...testGroups]
                                    : [...subAccountAllGroups]
                            }
                            showTestGroups={showTestGroups}
                            selectedList={selectedGroups}
                            callbackSelectedGroups={callbackUpdateGroups}
                            callbackUpdateGroups={() => { }} //onUpdateGroups
                            callbackSelectAll={callbackSelectAll}
                            callbackReciFilter={() => { }} // onReciFilter
                            callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
                            uniqueKey={'groups_4'}
                            innerHeight={325}
                            showSortBy={true}
                            showFilter={false}
                            showSelectAll={true}
                            isFilterSelected={false}
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