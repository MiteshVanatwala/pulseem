import { Box, Grid, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { UploadSettings } from "../../tempConstants";
import UploadXL from '../../../../components/Files/UploadXL'
import { AiOutlineCloudUpload } from 'react-icons/ai';
import clsx from 'clsx';
import { Tooltip } from "@material-ui/core";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useSelector } from "react-redux";

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
    const localClasses = useStyles();
    const { isRTL } = useSelector(state => state.core);

    return (
        <BaseDialog
            classes={classes}
            open={isOpen}
            childrenStyle={classes.h50v}
            maxHeight={"45vh"}
            title={
                <Box className={
                    clsx(classes.flex, classes.justifyBetween, isRTL ? classes.rtl : '')
                }>
                    <Grid container>
                        <Grid item sm={10}>
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
                        </Grid>
                        <Grid item sm={2}>
                            <label
                                htmlFor="uploadxl"
                                style={{
                                    cursor: 'pointer', width: 35, height: 35
                                }}>
                                <AiOutlineCloudUpload style={{ fontSize: 30, color: '#000' }} />
                            </label>
                        </Grid>
                    </Grid>
                </Box>
            }
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={false}
            onClose={onClose}
            onCancel={onClose}
            renderButtons={() => (<></>)}
            customContainerStyle={classes.addRecipientDialog}
        >
            <UploadXL
                classes={classes}
                onDone={onAddRecipient}
                settings={UploadSettings.GROUPS}
                uploadToGroups={selectedGroups}
                setToastMessage={setToastMessage}
                placeHolder={"recipient.addRecTextareaPlaceholder"}
                tooltipText='recipient.bulkRecUpldTooltipText'
            />
        </BaseDialog>
    );
};

export default AddBulkRecipientPopup;
