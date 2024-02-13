import { Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { resetGroups } from '../../../../redux/reducers/groupSlice';
import { useDispatch } from 'react-redux';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

const ResetGroupPopup = ({
    onClose,
    classes,
    isOpen,
    windowSize,
    getData,
    selectedGroup = { GroupID: null },
    handleResponses = (response, actions) => {}
}) => {

    const { t } = useTranslation();
    const dispatch = useDispatch()

    const handleSubmit = async () => {
        const response = await new Promise((resolve, reject) => resolve(dispatch(resetGroups(selectedGroup))))


        //TODO: RESPONSE MESSAGES LEFT 
        handleResponses(response, {
            'S_201': {
                code: 201,
                message: '',
                Func: () => {
                    new Promise(async (resolutionFunc, rejectionFunc) => {
                        await resolutionFunc(getData());
                        onClose();
                    })
                }
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
            'S_405': {
                code: 405,
                message: '',
                Func: () => null
            },
            'S_422': {
                code: 422,
                message: '',
                Func: () => null
            },
            'default': {
                message: '',
                Func: () => null
            },
        })
    }

    return (
        <BaseDialog
            classes={classes}
            open={isOpen}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={handleSubmit}
            customContainerStyle={{}}
            title={<span className={clsx(classes.textCapitalize, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} >
                {t("group.resetTitle")}
            </span>}
            showDivider
            cancelText="common.No"
            confirmText="common.Yes"
        >
            <Typography className={clsx(windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null, classes.textCenter)} >
                {t("group.resetConfirm")}
            </Typography>
        </BaseDialog>
    )
}

export default ResetGroupPopup