import {
    Box,
    makeStyles
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../components/managment/Dialog";
import { UploadSettings } from "../tempConstants";
import UploadXL from '../../../components/Files/UploadXL'

const useStyles = makeStyles({
    contentBox: {
        "width": 560,
        "height": '50vh'
    },
    accordionIcons: {
        position: 'absolute',
        '& path': {
            stroke: '#0371ad'
        }
    }
});

const AddBulkRecipientPopup = ({ classes,
    isOpen = false,
    onClose,
    selectedGroups,
    onAddRecipient = () => null
}) => {
    const { t } = useTranslation();
    const localClasses = useStyles()

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            title={t('recipient.bulkImportTitle')}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            renderButtons={() => (<></>)}
            customContainerStyle=""
        >
            <Box className={localClasses.contentBox}>
                <UploadXL
                    classes={classes}
                    onDone={onAddRecipient}
                    settings={UploadSettings.GROUPS}
                    uploadToGroups={selectedGroups}
                    showUploadButton={true}
                />
            </Box>
        </Dialog>
    );
};

export default AddBulkRecipientPopup;
