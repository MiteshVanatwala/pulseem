import {
    Box,
    makeStyles,
    Typography
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../components/managment/Dialog";
import { UploadSettings } from "../tempConstants";
import UploadXL from '../../../components/Files/UploadXL'
import { AiOutlineCloudUpload } from 'react-icons/ai';
import clsx from 'clsx';
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { BsInfoCircleFill } from "react-icons/bs";

const useStyles = makeStyles({
    contentBox: {
        "width": '100%',
        // "height": '50vh'
    },
    accordionIcons: {
        position: 'absolute',
        '& path': {
            stroke: '#0371ad'
        }
    }
});

// xs: "200px",
//     sm: "350px",
//         md: "350px",
//             lg: "460px",

const AddBulkRecipientPopup = ({ classes,
    isOpen = false,
    onClose,
    selectedGroups,
    windowSize,
    setToastMessage,
    onAddRecipient = () => null
}) => {
    const { t } = useTranslation();
    const localClasses = useStyles()

    return (
        <Dialog
            classes={classes}
            open={isOpen}

            // style={{ width: (windowSize === "sm" || windowSize === "sm") && 350 || (windowSize === "md" || windowSize === "lg") && 560 }}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box>
                        {t('recipient.bulkImportTitle')}
                        <CustomTooltip
                            isSimpleTooltip={false}
                            interactive={true}
                            classes={{
                                tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                                arrow: classes.fBlack,
                            }}
                            arrow={true}
                            // style={{ fontSize: 18 }}
                            placement={"top"}
                            title={<Typography noWrap={false}>{t('recipient.bulkRecUpldTooltipText')}</Typography>}
                            text={t('recipient.bulkRecUpldTooltipText')}
                        >
                            <span >
                                <BsInfoCircleFill className={classes.plr10} size={24} style={{ color: '#000' }} />
                            </span>
                        </CustomTooltip>
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
            paperStyle={classes.addRecipientDialog}
        >
            <Box>
                <UploadXL
                    classes={classes}
                    onDone={onAddRecipient}
                    settings={UploadSettings.GROUPS}
                    uploadToGroups={selectedGroups}
                    setToastMessage={setToastMessage}
                    placeHolder={"recipient.addRecTextareaPlaceholder"}
                />
            </Box>
        </Dialog>
    );
};

export default AddBulkRecipientPopup;
