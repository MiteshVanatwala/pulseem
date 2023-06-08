import clsx from 'clsx'
import { useTranslation } from "react-i18next";
import { Grid, Button, Box } from '@material-ui/core'
import { BsTrash } from "react-icons/bs";
import { BiSave } from 'react-icons/bi'
import { useSelector } from 'react-redux';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'

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
    disabled = false
}) => {
    const { t } = useTranslation();
    const { isRTL, windowSize } = useSelector(state => state.core);
    return (
        <Grid container style={{ ...innerStyle, paddingBottom: 40 }}
            className={disabled ? classes.disableChildButtons : null}>
            <Grid item xs={12}>
                <Box className={clsx(classes.wizardButtonContainer, classes.baseButtonsContainer, 'baseButtonsContainer', { [classes.flexJustifyCenter]: windowSize === 'xs', [classes.flexWrap]: windowSize === 'xs' })} style={{ paddingBottom: 40 }}>
                    {onBack &&
                        <Button onClick={() => { onBack?.callback() }}
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
                        {onDelete &&
                            <Button
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded
                                )}
                                style={{ margin: '8px' }}
                                onClick={() => { onDelete() }}
                            >
                                <BsTrash style={{ fontSize: "25", marginInlineStart: 0 }} />
                            </Button>
                        }
                        {onShowDocuments &&
                            <Button
                                onClick={() => onShowDocuments()}
                                style={{ marginInline: 8, paddingInline: 10 }}
                                className={clsx(classes.btn,
                                    classes.btnRounded)}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >
                                {/* <AiOutlineFileAdd style={{ fontSize: "20", paddingInline: 5 }} /> */}
                                {t("common.documentGallery")}
                            </Button>
                        }
                        {onShowGallery &&
                            <Button
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
                        {onTestSend &&
                            <Button
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
                                onClick={() =>
                                    onExit()}
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded,
                                    classes.backButton
                                )}
                                style={{ margin: '8px' }}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >{t("common.exit")}
                            </Button>
                        }
                        {onSave &&
                            <Button
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
                            <Button onClick={() => onSave(true)}
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
            {helperText && <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {helperText}
            </Grid>}
        </Grid>
    );
}

export default WizardActions;
