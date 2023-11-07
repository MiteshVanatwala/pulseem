import { useState, memo } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
    Box
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import Toast from '../../../components/Toast/Toast.component';
import { Title } from '../../../components/managment/Title';
import EditDynamicGroup from './EditDynamicGroup';


const DynamicGroupsContainer = ({ classes }: any) => {
    const { t } = useTranslation();
    const [dialog, setDialog] = useState<any | never>(null);
    const [toastMessage, setToastMessage] = useState<any | never>(null);

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

                    </Box>
                </Box>

                {dialog !== null && showDialog()}
            </Box>
        </DefaultScreen>
    )
}

export default memo(DynamicGroupsContainer);