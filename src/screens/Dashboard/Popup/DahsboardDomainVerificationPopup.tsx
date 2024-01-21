import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import { Button, Checkbox, FormControlLabel, Grid } from "@material-ui/core";
import { getCookie, setCookie } from "../../../helpers/Functions/cookies";
import clsx from "clsx";
import { useNavigate } from "react-router";

const DahsboardDomainVerificationPopup = ({ classes, isOpen, onClose }: any) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleShowDomainCookie = () => {
        const cookie = getCookie("popup_hide_domain_verification");
        setCookie("popup_hide_domain_verification", cookie !== 'true' ? 'true' : 'false');
    }

    return <BaseDialog
        children={<>
            {RenderHtml(t("common.domainVerificationDashboardPopupText"))}
            <FormControlLabel
                style={{ marginTop: 15 }}
                control={
                    <Checkbox onChange={handleShowDomainCookie} size="small" color="primary" />
                }
                label={t("common.doNotShow")}
            />
        </>}
        open={isOpen && getCookie("popup_hide_domain_verification") !== 'true'}
        classes={classes}
        confirmText={t("common.Ok")}
        disableBackdropClick={true}
        onCancel={onClose}
        onClose={onClose}
        onConfirm={onClose}
        showDefaultButtons={false}
        renderButtons={() => {
            return <>
                <Grid container spacing={2} className={classes.linePadding} style={{ justifyContent: 'flex-end' }}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='medium'
                            component="a"
                            onClick={() => window.open('https://site.pulseem.co.il/new-requirements-for-bulk-email-senders-to-gmail/')}
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonLightGreen
                            )}>
                            {t('common.moreDetails')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonLightBlue
                            )}
                            onClick={() => navigate('/react/AccountSettings?sdv=true')}
                        >
                            {t('common.testVerificationDomain')}
                        </Button>
                    </Grid>
                </Grid>
            </>
        }}
    />
}

export default DahsboardDomainVerificationPopup;