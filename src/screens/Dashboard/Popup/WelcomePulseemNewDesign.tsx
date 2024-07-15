import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import { Button, Checkbox, FormControlLabel, Grid } from "@material-ui/core";
import { getCookie, setCookie } from "../../../helpers/Functions/cookies";
import clsx from "clsx";
import { MdCelebration } from "react-icons/md";
import { useSelector } from "react-redux";
import { WhiteLabelObject } from "../../../components/WhiteLabel/WhiteLabelMigrate";
import { useEffect, useState } from "react";

const WelcomePulseemNewDesign = ({ classes, isOpen, onClose }: any) => {
    const { t } = useTranslation();
    const { accountSettings } = useSelector((state: any) => state.common);
    const [isWhiteLabel, setIsWhiteLabel] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (accountSettings && WhiteLabelObject !== null) {
            const refId: any = accountSettings?.Account?.ReferrerID;
            // @ts-ignore
            setIsWhiteLabel(WhiteLabelObject[refId] !== undefined);
            setIsLoaded(true);
        }
    }, [accountSettings])

    const handleShowDomainCookie = () => {
        const cookie = getCookie("popup_hide_NewDesign");
        setCookie("popup_hide_NewDesign", cookie !== 'true' ? 'true' : 'false', { maxAge: 2147483647 });
    }

    return <BaseDialog
        icon={<MdCelebration />}
        title={t('dashboard.welcomeNewDesignTitle')}
        children={<>
            {/* @ts-ignore */}
            {isLoaded && RenderHtml(t(WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['WelcomeMesasge']))}
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