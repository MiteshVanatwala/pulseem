import clsx from 'clsx'
import { useTranslation } from "react-i18next";
import { Grid, Button, Box } from '@material-ui/core'
import { BsTrash } from "react-icons/bs";
import { RiSendPlaneFill } from 'react-icons/ri'
import { BiSave } from 'react-icons/bi'
import { useSelector } from 'react-redux';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md'
import { RiImageAddLine } from 'react-icons/ri'
import { AiOutlineFileAdd } from 'react-icons/ai'

const WizardActions = ({
    classes,
    innerStyle,
    additionalButtons = null,
    onSave = null,
    onExit = null,
    onBack = null,
    onDelete = null,
    onTestSend = null,
    onShowGallery = null,
    onShowDocuments = null,
    onLoadTemplate = null,
    onSaveTemplate = null,
    helperText = null,
    disabled = false
}) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state.core);
    return (
        <Grid container style={{ ...innerStyle, paddingBottom: 40 }} className={disabled ? classes.disableChildButtons : null}>
            <Grid item xs={12}>
                <Box className={clsx(classes.wizardButtonContainer)}>
                    {onBack &&
                        <Button onClick={() => { onBack?.callback() }}
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonLightBlue,
                                classes.backButton
                            )}
                            startIcon={!isRTL ? <MdOutlineKeyboardArrowLeft /> : <MdOutlineKeyboardArrowRight />}
                            style={{ margin: '8px' }}
                            color="primary"
                        >{onBack?.text ?? t('notifications.back')}</Button>
                    }
                    <Button onClick={onLoadTemplate}
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonOutlinedBlue
                        )}
                        style={{ margin: '8px' }}
                    >
                        {t('common.templates')}
                    </Button>
                    <Button onClick={onSaveTemplate}
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonOutlinedBlue,
                        )}
                        style={{ margin: '8px' }}
                        startIcon={<BiSave />}
                    >
                        {t('common.saveTemplate')}
                    </Button>
                    <Box style={isRTL ? { marginRight: "auto" } : { marginLeft: "auto" }}>
                        {onDelete &&
                            <Button
                                variant='contained'
                                size='medium'
                                className={clsx(
                                    classes.actionButton,
                                    classes.actionButtonRed
                                )}
                                style={{ margin: '8px', padding: '9px 0' }}
                                onClick={() => { onDelete() }}
                            >
                                <BsTrash style={{ fontSize: "25" }} />
                            </Button>
                        }
                        {onShowDocuments &&
                            <Button
                                variant='contained'
                                size='medium'
                                onClick={() => onShowDocuments()}
                                style={{ marginInline: 8, paddingInline: 10 }}
                                className={clsx(classes.actionButton,
                                    classes.actionButtonOutlinedBlue)}>
                                <AiOutlineFileAdd style={{ fontSize: "20", paddingInline: 5 }} />
                                {t("common.documentGallery")}
                            </Button>
                        }
                        {onShowGallery &&
                            <Button
                                variant='contained'
                                size='medium'
                                onClick={() => onShowGallery()}
                                style={{ marginInline: 8, paddingInline: 10 }}
                                className={clsx(classes.actionButton,
                                    classes.actionButtonOutlinedBlue)}>
                                <RiImageAddLine style={{ fontSize: "20", paddingInline: 5 }} />
                                {t("common.imageGallery")}
                            </Button>
                        }
                        {onTestSend &&
                            <Button
                                variant='contained'
                                size='medium'
                                onClick={() => onTestSend()}
                                style={{ marginInline: 8, paddingInline: 10 }}
                                className={clsx(classes.actionButton,
                                    classes.actionButtonOutlinedBlue)}>
                                <RiSendPlaneFill style={{ fontSize: "25" }} />
                                {t("campaigns.sendTest")}
                            </Button>
                        }
                        {onExit &&
                            <Button
                                onClick={() =>
                                    onExit()}
                                variant='contained'
                                size='medium'
                                className={clsx(
                                    classes.actionButton,
                                    classes.actionButtonLightBlue,
                                    classes.backButton
                                )}
                                style={{ margin: '8px' }}
                                color="primary"
                            >{t("common.exit")}
                            </Button>
                        }
                        {onSave &&
                            <Button
                                onClick={() =>
                                    onSave()}
                                variant='contained'
                                size='medium'
                                className={clsx(
                                    classes.actionButton,
                                    classes.actionButtonLightBlue,
                                    classes.backButton
                                )}
                                style={{ margin: '8px' }}
                                startIcon={<BiSave />}
                                color="primary"
                            >{t("common.save")}
                            </Button>
                        }
                        {onSave &&
                            <Button onClick={() => onSave(true)}
                                variant='contained'
                                size='medium'
                                className={clsx(
                                    classes.actionButton,
                                    classes.actionButtonLightGreen,
                                    classes.backButton
                                )}
                                style={{ marginInlineStart: '8px' }}
                                color="primary"
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
