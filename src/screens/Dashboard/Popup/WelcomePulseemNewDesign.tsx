import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import { Box, Button, Checkbox, FormControlLabel, Grid, Typography } from "@material-ui/core";
import { getCookie, setCookie } from "../../../helpers/Functions/cookies";
import clsx from "clsx";
import { MdCelebration } from "react-icons/md";
import { StateType } from "../../../Models/StateTypes";
import { useSelector } from "react-redux";


const WelcomePulseemNewDesign = ({ classes, isOpen, onClose }: any) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector((state: StateType) => state.core);
    const handleShowDomainCookie = () => {
        const cookie = getCookie("popup_hide_NewDesign");
        setCookie("popup_hide_NewDesign", cookie !== 'true' ? 'true' : 'false', { maxAge: 2147483647 });
    }

    return <BaseDialog
        icon={<MdCelebration />}
        title={t('dashboard.welcomeNewDesignTitle')}
        children={<>
            {RenderHtml(t("dashboard.welcomeNewDesignDesc"))}
            <FormControlLabel
                style={{ marginTop: 15 }}
                control={
                    <Checkbox onChange={handleShowDomainCookie} size="small" color="primary" />
                }
                label={t("common.doNotShow")}
            />
        </>}
        open={isOpen && getCookie("popup_hide_NewDesign") !== 'true'}
        classes={classes}
        confirmText={t("common.Ok")}
        disableBackdropClick={true}
        onCancel={onClose}
        onClose={onClose}
        onConfirm={onClose}
        showDefaultButtons={false}
        renderButtons={() => {
            return <>
                <Grid container style={{ justifyContent: 'center' }}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.btn,
                                classes.btnRounded
                            )}
                            onClick={onClose}
                        >
                            {t('common.close')}
                        </Button>
                    </Grid>
                </Grid>
            </>
        }}
    />
}
export default WelcomePulseemNewDesign;