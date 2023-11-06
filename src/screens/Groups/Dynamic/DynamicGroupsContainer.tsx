import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
    Box, Button
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';
import { Title } from '../../../components/managment/Title';
import EditDynamicGroup from './EditDynamicGroup';
import { BiSave } from 'react-icons/bi';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { sitePrefix } from '../../../config';
import { getById } from '../../../redux/reducers/DynamicGroupsSlice';

const DynamicGroupsContainer = ({ classes }: any) => {
    const dispatch: any = useDispatch();
    const { id } = useParams();
    const navigate = useNavigate()
    const { t } = useTranslation();
    const [toastMessage, setToastMessage] = useState<any | never>(null);
    const [showLoader, setLoader] = useState(false);
    const [dialog, setDialog] = useState<any | never>(null);
    const { isRTL, CoreToastMessages } = useSelector((state: any) => state.core);
    const { dynamicGroup } = useSelector((state: any) => state.dynamicGroups);

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return (
            <Toast data={toastMessage} />
        );
    }


    const getData = async () => {
        await dispatch(getById(id));
    };

    useEffect(() => {
        getData();
    }, []);

    const handleResponses = (response: any, actions = {
        'S_200': {
            code: 200,
            message: '',
            Func: () => null
        },
        'S_201': {
            code: 201,
            message: '',
            Func: () => null
        },
        'S_202': {
            code: 202,
            message: '',
            Func: () => null
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
        'S_403': {
            code: 403,
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
        switch (response?.payload?.StatusCode || response?.payload?.Message?.StatusCode) {
            case 200: {
                actions?.S_200?.Func?.();
                actions?.S_200?.message && setToastMessage(actions?.S_200?.message);
                break;
            }
            case 201: {
                actions?.S_201?.Func?.();
                actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
                setDialog(null);
                // getData()
                break;
            }
            case 202: {
                actions?.S_202?.Func?.();
                actions?.S_202?.message && setToastMessage(actions?.S_202?.message);
                setDialog(null);
                // getData()
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
            case 403: {
                setToastMessage(CoreToastMessages?.XSS_ERROR);
                // actions?.403?.Func?.();
                // actions?.403?.message && setToastMessage(CoreToastMessages?.XSS_ERROR);
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

    const showDialog = () => {
        return <></>;
    }

    const onSave = () => {

    }

    const onBack = () => {
        navigate(`${sitePrefix}Groups/Dynamic`);
    }


    return (
        <DefaultScreen
            key="groups"
            currentPage='groups'
            subPage='DynamicGroupsContainer'
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            <Box className={classes.mb50}>
                {toastMessage && renderToast()}
                <Box className={'topSection'}>
                    <Title Text={t('recipient.logPageHeaderResource1.Dynamic')} classes={classes} />

                    <Box className={clsx(classes.p20)}>
                        <EditDynamicGroup classes={classes} Data={dynamicGroup?.Data} />
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
                    </Box>
                </Box>

                {dialog !== null && showDialog()}
                <Loader isOpen={showLoader} showBackdrop={true} />
            </Box>
        </DefaultScreen>
    )
}

export default memo(DynamicGroupsContainer);