import { useDispatch, useSelector } from 'react-redux';
import { useState, memo, useEffect } from 'react';
import clsx from 'clsx';
import {
    Grid, FormControl, InputLabel, MenuItem, Tabs, Tab
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
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
import { useParams } from 'react-router-dom';

const EditDynamicGroup = ({ classes, Data }: any) => {
    const dispatch: any = useDispatch();
    const { t } = useTranslation();
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
            MyGroups: [] as any,
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

    const getData = async () => {
        setLoader(true);
        const groups = await dispatch(getById(id));
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
        const selectedgroupsList = [] as any;
        dynamicGroupModel?.dynamicData?.MyGroups.forEach((gl: number) => {
            const exist = subAccountAllGroups?.filter((g: any) => { return g.GroupID === gl });
            if (exist && exist.length > 0) {
                selectedgroupsList.push(exist[0]);
            }
        });

        setSelectedGroups(selectedgroupsList);
    }, [dynamicGroupModel])

    const callbackUpdateGroups = (groups: any | never) => {
        // setSelectedGroups(groups) as any;
        const found = selectedGroups.map((group: any) => { return group.GroupID; }).includes(groups.GroupID);
        if (found) {
            setSelectedGroups(selectedGroups.filter((g: any) => g.GroupID !== groups.GroupID));
        } else {
            setSelectedGroups([...selectedGroups, groups]);
        }
    }
    const callbackSelectAll = () => {
        if (!allGroupsSelected) {
            if (showTestGroups) {
                setSelectedGroups([...testGroups, ...subAccountAllGroups]);
            }
            else {
                setSelectedGroups([...subAccountAllGroups]);
            }
        } else {
            setSelectedGroups([]);
        }
        setAllGroupsSelected(!allGroupsSelected);
    }

    const getSystemDetails = () => {
        return (
            <Grid container className={classes.pt25}>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.updateGroupRecipientsEvery')}:</InputLabel>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl, classes.w50)}
                    >
                        <Select
                            variant='standard'
                            value={dynamicGroupModel?.Group?.DynamicUpdatePolicy}
                            onChange={(event: any) => {
                                setDynamicGroupModel({
                                    ...dynamicGroupModel,
                                    Groups: { DynamicUpdatePolicy: event.target.value } as any
                                })
                            }}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            className={clsx(classes.w100, classes.mt20)}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            <MenuItem value={0}>{t('common.daily2AM')}</MenuItem>
                            <MenuItem value={1}>{t('common.weekly2AM')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.UpdatedOn')}:</InputLabel>
                    <div className={clsx(classes.pt10)}>
                        {dynamicGroupModel?.Group?.DynamicLastUpdate}
                    </div>
                </Grid>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.numberOfClientsInGroup')}:</InputLabel>
                    <div className={clsx(classes.pt10)}>
                        {dynamicGroupModel?.Group?.Recipients}
                    </div>
                </Grid>
            </Grid>
        )
    }

    const updateMyConditions = (keyName: string, value: string) => {
        setDynamicGroupModel({ ...dynamicGroupModel, dynamicData: {
            ...dynamicGroupModel.dynamicData,
            MyConditions: [
                {
                    ...dynamicGroupModel.dynamicData.MyConditions[0],
                    [keyName]: value
                }
            ]
        }});
    }

    const updateMyActivities = (keyName: string, value: string) => {
        setDynamicGroupModel({ ...dynamicGroupModel, dynamicData: {
            ...dynamicGroupModel.dynamicData,
            MyActivities: {
                ...dynamicGroupModel.dynamicData.MyActivities,
                [keyName]: value
            }
        }});
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
                    label={t('common.systemDetails')}
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
                    {getSystemDetails()}
                </TabPanel>
            </TabContext>
        </>
    )
}

export default memo(EditDynamicGroup);