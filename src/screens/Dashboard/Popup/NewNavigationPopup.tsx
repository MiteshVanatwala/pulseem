import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Checkbox, FormControlLabel, IconButton } from "@material-ui/core";
import clsx from "clsx";
import { IoCloseCircleOutline } from "react-icons/io5";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { StateType } from "../../../Models/StateTypes";
import newNavigationEn from "../../../assets/images/dashboard/newNavigation/newNavigation-en.jpg";
import newNavigationHe from "../../../assets/images/dashboard/newNavigation/newNavigation-he.jpg";

const NewNavigationPopup = ({ classes, isOpen, onClose }: any) => {
    const { t } = useTranslation();
    const { language } = useSelector((state: StateType) => state.core);
    const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

    const image = language === 'he' ? newNavigationHe : newNavigationEn;

    return <BaseDialog
        classes={classes}
        open={isOpen}
        hideHeader={true}
        disableBackdropClick={true}
        showDefaultButtons={false}
        className={clsx(classes.newNavigationDialogPaper)}
        contentStyle={clsx(classes.newNavigationDialogContent)}
        childrenStyle={clsx(classes.newNavigationDialogChildren)}
        maxHeight="90vh"
        onClose={() => onClose(dontShowAgain)}
        onCancel={() => onClose(dontShowAgain)}
        renderButtons={() => null}
    >
        <>
            <IconButton className={clsx(classes.newNavigationCloseButton)} onClick={() => onClose(dontShowAgain)}>
                <IoCloseCircleOutline size={40} />
            </IconButton>
            <img src={image} alt="" style={{ width: '100%', display: 'block' }} />
            <FormControlLabel
                style={{ margin: 10 }}
                control={
                    <Checkbox
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        size="small"
                        color="primary"
                    />
                }
                label={t("common.doNotShow")}
            />
        </>
    </BaseDialog>
}
export default NewNavigationPopup;
