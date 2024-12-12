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
import { ActivityEvent, MyActivities, ActivtyTimeInterval, CondType, CondGroup, DynamicGroupModel } from '../../../Models/Groups/DynamicGroup';
import PersonalDetails from './Tabs/PersonalDetails';
import EventsDetails from './Tabs/EventsDetails';
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
import { Title } from '../../../components/managment/Title';
import DefaultScreen from '../../DefaultScreen';
import { GiExitDoor } from 'react-icons/gi';
import { M_AllCampaignChannelds } from '../../../Models/Common/CampaignTypes';

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
            // SubAccountID: -1,
            UpdateDate: null
        },
        dynamicData: {
            MyActivities: {
                IsNotOpened: null,
                IsNotOpenedFromDate: null,
                IsNotOpenedInterval: ActivtyTimeInterval.Last2Weeks,
                IsNotOpenedToDate: null,

                IsOpened: null,
                IsOpenedFromDate: null,
                IsOpenedInterval: ActivtyTimeInterval.Last2Weeks,
                IsOpenedToDate: null,

                IsClicked: null,
                IsClickedFromDate: null,
                IsClickedInterval: ActivtyTimeInterval.Last2Weeks,
                IsClickedToDate: null,
                IsClickInCampaignTypes: M_AllCampaignChannelds.join(','),

                IsNotClicked: null,
                IsNotClickedFromDate: null,
                IsNotClickedInterval: ActivtyTimeInterval.Last2Weeks,
                IsNotClickedToDate: null,
                IsNotClickInCampaignTypes: M_AllCampaignChannelds.join(','),

                IsPurchased: null,
                IsPurchasedComparingType: ActivityEvent.Any,
                IsPurchasedInterval: ActivtyTimeInterval.Last2Weeks,
                IsPurchasedMinPrice: null,
                IsPurchasedMaxPrice: null,
                IsPurchasedFromDate: null,
                IsPurchasedToDate: null,
                PurchasedPrice: null,

                IsNotPurchased: null,
                IsNotPurchasedComparingType: ActivityEvent.Any,
                IsNotPurchasedInterval: ActivtyTimeInterval.Last2Weeks,
                IsNotPurchasedMinPrice: null,
                IsNotPurchasedMaxPrice: null,
                IsNotPurchasedFromDate: null,
                IsNotPurchasedToDate: null,
                NotPurchasedPrice: null,

                IsAbandoned: null,
                IsAbandonedComparingType: ActivityEvent.Any,
                IsAbandonedInterval: ActivtyTimeInterval.Last2Weeks,
                IsAbandonedMinPrice: null,
                IsAbandonedMaxPrice: null,
                IsAbandonedFromDate: null,
                IsAbandonedToDate: null,
                AbandonedPrice: null,

                IsPageViewed: null,
                IsPageViewedComparingType: ActivityEvent.Any,
                IsPageViewedInterval: ActivtyTimeInterval.Last2Weeks,
                IsPageViewedMinPrice: null,
                IsPageViewedMaxPrice: null,
                IsPageViewedFromDate: null,
                IsPageViewedToDate: null,
                PageViewedPrice: null,

                ProductCategory: null
            } as MyActivities,
            MyConditions: [{
                FirstName: '',
                FirstNameCond: CondType.Undefined,
                LastName: '',
                LastNameCond: CondType.Undefined,
                Email: '',
                EmailCond: CondType.Undefined,
                Cellphone: '',
                CellphoneCond: CondType.Undefined,
                City: '',
                CityCond: CondType.Undefined,
                Country: '',
                CountryCond: CondType.Undefined,
                Company: '',
                ComapnyCond: CondType.Undefined,
                State: '',
                StateCond: CondType.Undefined,
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
            }] as CondGroup[],
            MyGroups: [] as number[],
        } as DynamicGroupModel
    });
    const [tabValue, setTabValue] = useState('0');
    const [selectedGroups, setSelectedGroups] = useState<any>([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);
    const [showTestGroups, setShowTestGroups] = useState(false);
    const [pageState, setPageState] = useState<any | never>(null);
    const { id } = useParams();
    const { isRTL } = useSelector((state: any) => state.core);

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 5000);
        return <Toast customData={toastMessage} data={null} />;
    };

    const onSave = async (isExit: boolean | never = false) => {
        let isValid = true;
        let message = '';
        // Add validations
        // IsPageViewed && Range && required min & max - SpecificDates && required min & max  

        if (dynamicGroupModel.dynamicData.MyActivities.IsPurchased === true) {
            switch (dynamicGroupModel.dynamicData.MyActivities?.IsPurchasedComparingType.toString()) {
                case ActivityEvent.Range: {
                    if ((dynamicGroupModel.dynamicData.MyActivities.IsPurchasedMinPrice === null ||
                        dynamicGroupModel.dynamicData.MyActivities.IsPurchasedMaxPrice === null) ||
                        (parseInt(dynamicGroupModel.dynamicData.MyActivities.IsPurchasedMinPrice) > parseInt(dynamicGroupModel.dynamicData.MyActivities.IsPurchasedMaxPrice))) {
                        isValid = false;
                    }
                    break;
                }
                case ActivityEvent.MoreThan:
                case ActivityEvent.LessThan: {
                    if (dynamicGroupModel.dynamicData.MyActivities.PurchasedPrice === null) {
                        isValid = false;
                    }
                    break;
                }
            }
        }
        else if (dynamicGroupModel.dynamicData.MyActivities.IsNotPurchased === true) {
            switch (dynamicGroupModel.dynamicData.MyActivities?.IsNotPurchasedComparingType.toString()) {
                case ActivityEvent.Range: {
                    if ((dynamicGroupModel.dynamicData.MyActivities.IsNotPurchasedMinPrice === null ||
                        dynamicGroupModel.dynamicData.MyActivities.IsNotPurchasedMaxPrice === null) ||
                        (parseInt(dynamicGroupModel.dynamicData.MyActivities.IsNotPurchasedMinPrice) > parseInt(dynamicGroupModel.dynamicData.MyActivities.IsNotPurchasedMaxPrice))) {
                        isValid = false;
                    }
                    break;
                }
                case ActivityEvent.MoreThan:
                case ActivityEvent.LessThan: {
                    if (dynamicGroupModel.dynamicData.MyActivities.NotPurchasedPrice === null) {
                        isValid = false;
                    }
                    break;
                }
            }
        }
        else if (dynamicGroupModel.dynamicData.MyActivities.IsAbandoned === true) {
            switch (dynamicGroupModel.dynamicData.MyActivities?.IsAbandonedComparingType.toString()) {
                case ActivityEvent.Range: {
                    if ((dynamicGroupModel.dynamicData.MyActivities.IsAbandonedMinPrice === null ||
                        dynamicGroupModel.dynamicData.MyActivities.IsAbandonedMaxPrice === null) ||
                        (parseInt(dynamicGroupModel.dynamicData.MyActivities.IsAbandonedMinPrice) > parseInt(dynamicGroupModel.dynamicData.MyActivities.IsAbandonedMaxPrice))) {
                        isValid = false;
                    }
                    break;
                }
                case ActivityEvent.MoreThan:
                case ActivityEvent.LessThan: {
                    if (dynamicGroupModel.dynamicData.MyActivities.AbandonedPrice === null) {
                        isValid = false;
                    }
                    break;
                }
            }
        }
        if (dynamicGroupModel.dynamicData.MyActivities.IsClicked === true) {

            if (!dynamicGroupModel.dynamicData.MyActivities.IsClickInCampaignTypes) {
                message = t('group.saveDynamicGroupResponse.clickChannelRequired');
                isValid = false;
            }
            else if (dynamicGroupModel.dynamicData.MyActivities.IsClickedInterval.toString() === ActivtyTimeInterval.SpecificDates
                && (!dynamicGroupModel.dynamicData.MyActivities.IsClickedFromDate || !dynamicGroupModel.dynamicData.MyActivities.IsClickedToDate)) {
                message = t('group.saveDynamicGroupResponse.specificDateIsRequired');
                isValid = false;
            }
            else if (dynamicGroupModel.dynamicData.MyActivities.IsClickedInterval === ActivtyTimeInterval.DaysBack
                && (!dynamicGroupModel.dynamicData.MyActivities.IsClickedDaysBack ||
                    dynamicGroupModel.dynamicData.MyActivities.IsClickedDaysBack === '')) {
                message = t('group.saveDynamicGroupResponse.daysBackError');
                isValid = false;
            }
        }
        if (dynamicGroupModel.dynamicData.MyActivities.IsNotClicked === true) {
            if (!dynamicGroupModel.dynamicData.MyActivities.IsNotClickInCampaignTypes) {
                message = t('group.saveDynamicGroupResponse.notClickChannelRequired');
                isValid = false;
            }
            else if (dynamicGroupModel.dynamicData.MyActivities.IsClickedInterval.toString() === ActivtyTimeInterval.SpecificDates
                && (!dynamicGroupModel.dynamicData.MyActivities.IsNotClickedFromDate && !dynamicGroupModel.dynamicData.MyActivities.IsNotClickedToDate)) {
                message = t('group.saveDynamicGroupResponse.specificDateIsRequired');
                isValid = false;
            }
            else if (dynamicGroupModel.dynamicData.MyActivities.IsNotClickedInterval === ActivtyTimeInterval.DaysBack
                && (!dynamicGroupModel.dynamicData.MyActivities.IsNotClickedDaysBack ||
                    dynamicGroupModel.dynamicData.MyActivities.IsNotClickedDaysBack === '')) {
                message = t('group.saveDynamicGroupResponse.daysBackError');
                isValid = false;
            }
        }

        if (isValid) {
            setLoader(true);
            var requestObject = { Group: dynamicGroupModel?.Group, DynamicData: dynamicGroupModel?.dynamicData } as any;
            const response = await dispatch(save(requestObject));
            handleResponse(response.payload, isExit);
        }
        else {
            showErrorToast(t(message !== '' ? message : 'group.saveDynamicGroupResponse.incorrectValue'));
        }
    }

    const showErrorToast = (message: string) => setToastMessage({ severity: 'error', color: 'error', message, showAnimtionCheck: false } as any)

    const handleResponse = async (response: any, isExit: boolean = false) => {
        switch (response.StatusCode) {
            case 201: {
                await getData(true);
                if (isExit) {
                    // setLoader(false);
                    setTimeout(() => {
                        onBack();
                    }, 1500);
                }
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
        setLoader(false);
    }

    const onBack = () => {
        if (pageState?.PageProperty || pageState?.PageName) {
            navigate(`${sitePrefix}Groups/Dynamic`, {
                state: {
                    from: 'editDynamicGroup'
                }
            })
        }
        else {
            sessionStorage.removeItem('PageState');
            window.history.back()
        }


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
            setToastMessage({ severity: 'success', color: 'success', message: t('group.saveDynamicGroupResponse.201').replace('{0}', Group?.Recipients?.toLocaleString()), showAnimtionCheck: false } as any);
        }
        setLoader(false);
    };

    useEffect(() => {
        const sessionPageState = window.sessionStorage?.getItem('PageState');
        if (sessionPageState) {
            const pState = JSON.parse(sessionPageState);
            const fromState = pState?.filter((x: any) => { return x?.PageName === 'dynamicGroups' });
            if (fromState && fromState?.length > 0) {
                setPageState(fromState[0]);
            }
        }

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

    const callbackUpdateGroups = (groups: any, event: any) => {

        if (event) {
            setSelectedGroups(groups);
            setDynamicGroupModel({
                ...dynamicGroupModel,
                dynamicData: {
                    ...dynamicGroupModel.dynamicData,
                    MyGroups: groups.map((value: Group) => value.GroupID)
                }
            });
        }
        else {
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
        const reset = value === '' && resetCondition.indexOf(keyName) !== -1 ? true : false;
        setDynamicGroupModel({
            ...dynamicGroupModel, dynamicData: {
                ...dynamicGroupModel.dynamicData,
                MyConditions: [
                    {
                        ...dynamicGroupModel.dynamicData.MyConditions[0],
                        [keyName]: value,
                        ...reset && { [`${keyName}Cond`]: CondType.Undefined }
                    }
                ]
            }
        });
    }

    const updateMyActivities = (keyName: string, value: string, object: any | never = null) => {
        if (object) {
            setDynamicGroupModel({
                ...dynamicGroupModel, dynamicData: {
                    ...dynamicGroupModel.dynamicData,
                    MyActivities: {
                        ...dynamicGroupModel.dynamicData.MyActivities,
                        ...object
                    }
                }
            });
        }

        else {
            const paramsToReset = ["IsPurchased", "IsNotPurchased", "IsAbandoned", "IsPageViewed", "IsClicked", "IsNotClicked", "IsOpened", "IsNotOpened"];

            const resetValues = (keyName: string, value: string) => {
                if (paramsToReset.filter((x: string) => { return x === keyName }).length > 0 && value.toString() === 'false') {
                    switch (keyName) {
                        case 'IsClicked': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsClicked: null,
                                        IsClickedFromDate: null,
                                        IsClickedToDate: null,
                                        IsClickInCampaignTypes: M_AllCampaignChannelds.join(','),
                                        IsClickedInterval: ActivtyTimeInterval.Last2Weeks
                                    }
                                }
                            });
                            break;
                        }
                        case 'IsNotClicked': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsNotClicked: null,
                                        IsNotClickedFromDate: null,
                                        IsNotClickedToDate: null,
                                        IsNotClickInCampaignTypes: M_AllCampaignChannelds.join(','),
                                        IsNotClickedInterval: ActivtyTimeInterval.Last2Weeks
                                    }
                                }
                            });
                            break;
                        }
                        case 'IsOpened': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsOpened: null,
                                        IsOpenedFromDate: null,
                                        IsOpenedToDate: null,
                                        IsOpenedInterval: ActivtyTimeInterval.Last2Weeks
                                    }
                                }
                            });
                            break;
                        }
                        case 'IsNotOpened': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsNotOpened: null,
                                        IsNotOpenedFromDate: null,
                                        IsNotOpenedToDate: null,
                                        IsNotOpenedInterval: ActivtyTimeInterval.Last2Weeks
                                    }
                                }
                            });
                            break;
                        }
                        case 'IsPurchased': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsPurchased: null,
                                        IsPurchasedComparingType: ActivityEvent.Any,
                                        IsPurchasedFromDate: null,
                                        IsPurchasedToDate: null,
                                        IsPurchasedMinPrice: null,
                                        IsPurchasedMaxPrice: null,
                                        IsPurchasedInterval: ActivtyTimeInterval.Last2Weeks,
                                        PurchasedPrice: null,
                                        PurchasedProductCategory: null
                                    }
                                }
                            });
                            break;
                        }
                        case 'IsNotPurchased': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsNotPurchased: null,
                                        IsNotPurchasedComparingType: ActivityEvent.Any,
                                        IsNotPurchasedFromDate: null,
                                        IsNotPurchasedToDate: null,
                                        IsNotPurchasedMinPrice: null,
                                        IsNotPurchasedMaxPrice: null,
                                        IsNotPurchasedInterval: ActivtyTimeInterval.Last2Weeks,
                                        NotPurchasedPrice: null,
                                        NotPurchasedProductCategory: null
                                    }
                                }
                            });
                            break;
                        }
                        case 'IsAbandoned': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsAbandoned: null,
                                        IsAbandonedComparingType: ActivityEvent.Any,
                                        IsAbandonedFromDate: null,
                                        IsAbandonedToDate: null,
                                        IsAbandonedMinPrice: null,
                                        IsAbandonedMaxPrice: null,
                                        IsAbandonedInterval: ActivtyTimeInterval.Last2Weeks,
                                        AbandonedPrice: null,
                                        AbandonedProductCategory: null
                                    }
                                }
                            });
                            break;
                        }
                        case 'IsPageViewed': {
                            setDynamicGroupModel({
                                ...dynamicGroupModel, dynamicData: {
                                    ...dynamicGroupModel.dynamicData,
                                    MyActivities: {
                                        ...dynamicGroupModel.dynamicData.MyActivities,
                                        IsPageViewed: null,
                                        IsPageViewedComparingType: ActivityEvent.Any,
                                        IsPageViewedFromDate: null,
                                        IsPageViewedToDate: null,
                                        IsPageViewedMinPrice: null,
                                        IsPageViewedMaxPrice: null,
                                        IsPageViewedInterval: ActivtyTimeInterval.Last2Weeks,
                                        PageViewedPrice: null
                                    }
                                }
                            });
                            break;
                        }
                    }
                }
            }

            if (paramsToReset.filter((x: string) => { return x === keyName }).length > 0 && value.toString() === 'false') {
                resetValues(keyName, value);
            }
            else {
                const allCampaignTypes = M_AllCampaignChannelds?.join(',');

                setDynamicGroupModel({
                    ...dynamicGroupModel, dynamicData: {
                        ...dynamicGroupModel.dynamicData,
                        MyActivities: {
                            ...dynamicGroupModel.dynamicData.MyActivities,
                            IsClickInCampaignTypes: !dynamicGroupModel.dynamicData.MyActivities.IsClickInCampaignTypes ? allCampaignTypes : dynamicGroupModel.dynamicData.MyActivities.IsClickInCampaignTypes,
                            IsNotClickInCampaignTypes: !dynamicGroupModel.dynamicData.MyActivities.IsNotClickInCampaignTypes ? allCampaignTypes : dynamicGroupModel.dynamicData.MyActivities.IsNotClickInCampaignTypes,
                            [keyName]: value
                        }
                    }
                });
            }
        }
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
        <DefaultScreen
            key="groups"
            currentPage='groups'
            subPage='EditDynamicGroup'
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            <Box className={classes.mb50}>
                <Loader isOpen={showLoader} />
                {toastMessage && renderToast()}
                <Box className={'topSection'}>
                    <Title
                        Text={dynamicGroupModel?.Group?.GroupName === '' ?
                            `${t('recipient.logPageHeaderResource1.Edit')}` :
                            `${t('recipient.logPageHeaderResource1.Edit')} - "${dynamicGroupModel?.Group?.GroupName}"`}
                        classes={classes}
                    />
                    <Box className={clsx(classes.p20)}>
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
                            <Tab
                                label={t('common.events')}
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
                                <DateDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyConditions} />
                            </TabPanel>
                            <TabPanel value='2'>
                                <ActivityDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyActivities} />
                            </TabPanel>
                            <TabPanel value='3'>
                                <EventsDetails classes={classes} data={dynamicGroupModel} onUpdate={updateMyActivities} />
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
                                        // test={showTestGroups}
                                        selectedList={selectedGroups}
                                        callbackSelectedGroups={callbackUpdateGroups}
                                        callbackUpdateGroups={callbackUpdateGroups} //onUpdateGroups
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
                                onClick={() => { onSave(false) }}>
                                {t("common.save")}
                            </Button>
                            <Button
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded
                                )}
                                style={{ margin: '8px' }}
                                startIcon={<GiExitDoor />}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                                onClick={() => { onSave(true) }}
                            >
                                {t("common.SaveExit")}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </DefaultScreen>
    )
}

export default memo(EditDynamicGroup);