import { Box, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../../components/managment/Dialog";
import { UploadSettings } from "../../tempConstants";
import UploadXL from '../../../../components/Files/UploadXL'
import { AiOutlineCloudUpload } from 'react-icons/ai';
import clsx from 'clsx';
import { Tooltip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    contentBox: {
        "width": '100%',
    },
    accordionIcons: {
        position: 'absolute',
        '& path': {
            stroke: '#0371ad'
        }
    },
    customWidth: {
        maxWidth: 200,
        backgroundColor: "black",
        fontSize: 15,
        textAlign: 'center'
    },
    arrow: {
        color: theme.palette.common.black,
    },
    tooltip: {
        backgroundColor: theme.palette.common.black,
    },
}));

const AddBulkRecipientPopup = ({ classes,
    isOpen = false,
    onClose,
    selectedGroups,
    setToastMessage,
    onAddRecipient = () => null
}) => {
    const { t } = useTranslation();
    const localClasses = useStyles()

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            childrenStyle={classes.h50v}
            maxHeight={"45vh"}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box className={classes.flex}>
                        {t('recipient.bulkImportTitle')}
                        <Tooltip
                            arrow
                            placement={'top'}
                            disableFocusListener
                            title={t('recipient.uploadLimitation')}
                            classes={{ tooltip: localClasses.customWidth, arrow: localClasses.arrow }}
                            sx={{ justifyContent: 'center', zIndex: 9999999999999 }}
                        >
                            <Typography className={classes.bodyInfo} style={{ marginInline: 10 }}>i</Typography>
                        </Tooltip>
                    </Box>
                    <Box style={{ cursor: 'pointer' }}>
                        <label htmlFor="uploadxl">
                            <AiOutlineCloudUpload style={{ fontSize: 30, color: '#000' }} />
                        </label>
                    </Box>
                </Box>


            }
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            renderButtons={() => (<></>)}
            customContainerStyle={classes.addRecipientDialog}
        >
            {/* <Box> */}
            <UploadXL
                classes={classes}
                onDone={onAddRecipient}
                settings={UploadSettings.GROUPS}
                uploadToGroups={selectedGroups}
                setToastMessage={setToastMessage}
                placeHolder={"recipient.addRecTextareaPlaceholder"}
                tooltipText='recipient.bulkRecUpldTooltipText'
            />
            {/* </Box> */}
        </Dialog>
    );
};

export default AddBulkRecipientPopup;
