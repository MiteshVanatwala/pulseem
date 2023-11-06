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


const DynamicGroupsContainer = ({ classes }: any) => {
    const dispatch: any = useDispatch();
    
    const navigate = useNavigate()
    const { t } = useTranslation();
    const [toastMessage, setToastMessage] = useState<any | never>(null);
    const [showLoader, setLoader] = useState(false);
    const [dialog, setDialog] = useState<any | never>(null);
    const { isRTL, CoreToastMessages } = useSelector((state: any) => state.core);

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return (
            <Toast data={toastMessage} />
        );
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
                        <EditDynamicGroup classes={classes} />
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