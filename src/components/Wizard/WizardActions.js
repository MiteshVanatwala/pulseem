import clsx from 'clsx'
import { useTranslation } from "react-i18next";
import { Grid, Button, Box } from '@material-ui/core'
import { BsTrash } from "react-icons/bs";
import { BiSave } from 'react-icons/bi'
import { useSelector } from 'react-redux';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'
import { GrGallery } from 'react-icons/gr';
import { GiExitDoor } from "react-icons/gi";

const WizardActions = ({
    classes,
    innerStyle,
    additionalButtons = null,
    additionalButtonsOnStart = null,
    onSave = null,
    onExit = null,
    onBack = null,
    onDelete = null,
    onTestSend = null,
    onShowGallery = null,
    onShowDocuments = null,
    helperText = null,
    disabled = false,
    ignorePaddingBottom = false
}) => {
    const { t } = useTranslation();
    const { isRTL, windowSize, userRoles } = useSelector(state => state.core);
    return (
        <Grid container style={{ ...innerStyle }}
            className={disabled ? classes.disableChildButtons : null}>
            <Grid item xs={12}>
                <Box className={clsx(classes.wizardButtonContainer, classes.baseButtonsContainer, 'baseButtonsContainer', { [classes.flexJustifyCenter]: windowSize === 'xs', [classes.flexWrap]: windowSize === 'xs' })} style={{ paddingBottom: ignorePaddingBottom ? null : 40 }}>
                    {onBack &&
                        <Button
                            size="small"
                            onClick={() => { onBack?.callback() }}
                            className={clsx(
                                classes.btn,
                                classes.btnRounded,
                                classes.backButton
                            )}
                            startIcon={!isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            style={{ margin: '8px' }}
                        >{onBack?.text ?? t('notifications.back')}</Button>
                    }
                    {additionalButtonsOnStart}
                    <Box style={isRTL ? { marginRight: "auto" } : { marginLeft: "auto" }}>
                        {
                            helperText && <span className={clsx(classes.paddingSides5, classes.semibold)}>{helperText}</span>
                        }
                        {userRoles?.AllowDelete && onDelete &&
                            <Button
                                size="small"
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded
                                )}
                                style={{ margin: '8px' }}
                                onClick={() => { onDelete() }}
                            >
                                <BsTrash className={'trash'} style={{ fontSize: "20", marginLeft: '0 !important', marginRight: '0 !important' }} />
                            </Button>
                        }
                        {onShowDocuments &&
                            <Button
                                size="small"
                                onClick={() => onShowDocuments()}
                                style={{ marginInline: 8, paddingInline: 10 }}
                                className={clsx(classes.btn, classes.btnRounded)}
                                startIcon={<GrGallery />}
                            >
                                {t("common.documentGallery")}
                            </Button>
                        }
                        {onShowGallery &&
                            <Button
                                size="small"
                                onClick={() => onShowGallery()}
                                style={{ marginInline: 8, paddingInline: 10 }}
                                className={clsx(classes.btn,
                                    classes.btnRounded)}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >
                                {/* <RiImageAddLine style={{ fontSize: "20", paddingInline: 5 }} /> */}
                                {t("common.imageGallery")}
                            </Button>
                        }
                        {onTestSend && userRoles?.AllowSend &&
                            <Button
                                size="small"
                                onClick={() => onTestSend()}
                                style={{ marginInline: 8, paddingInline: 10 }}
                                className={clsx(classes.btn,
                                    classes.btnRounded)}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >
                                {/* <RiSendPlaneFill style={{ fontSize: "25" }} /> */}
                                {t("campaigns.sendTest")}
                            </Button>
                        }
                        {onExit &&
                            <Button
                                size="small"
                                onClick={() =>
                                    onExit()}
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded,
                                    classes.backButton
                                )}
                                style={{ margin: '8px' }}
                                endIcon={<GiExitDoor />}
                            >{t("common.exit")}
                            </Button>
                        }
                        {onSave &&
                            <Button
                                size="small"
                                onClick={() =>
                                    onSave()}
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded,
                                    classes.backButton
                                )}
                                style={{ margin: '8px' }}
                                startIcon={<BiSave />}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >{t("common.save")}
                            </Button>
                        }
                        {onSave &&
                            <Button
                                size="small"
                                onClick={() => onSave(true)}
                                className={clsx(
                                    classes.btn,
                                    classes.backButton,
                                )}
                                style={{ marginInlineStart: '8px' }}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >{t('common.continue')}</Button>
                        }
                        {additionalButtons}
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default WizardActions;
