import { Box, FormControl, Grid, IconButton, MenuItem, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { LandingPagesAnswerType } from "../../../../helpers/Constants";
import { useState } from "react";
import { coreProps } from "../../../Whatsapp/Campaign/Types/WhatsappCampaign.types";


const FormProperties = ({ classes, data, onUpdate, onSetDialog }: any) => {
    const dispatch: any = useDispatch();
    const { t: translator } = useTranslation();
    const { isRTL } = useSelector(
        (state: { core: coreProps }) => state.core
    );

    console.log(data);

    const [errors, setErrors] = useState({
        PageName: '',
        formLanguage: '',
        shortURL: '',
        pageTitle: '',
        AnswerData: '',
        PageUrl: '',
        APIUserName: '',
        TerminalNumber: '',
        offlineURL: '',
        group: '',
        pageDescription: '',
        googleAnalytics: '',
        googleConvertion: '',
        googleTagManager: '',
        facebookPixel: '',
        cssStyle: '',
        previewTitle: '',
        previewIcon: '',
        previewDescription: '',
        seoPageTitle: '',
        seoKeywords: '',
        seoDescription: '',
        reportLeadsToEmails: '',
        updateExistingRecipients: '',
        limitSubscribers: '',
        emailId: '',
    });

    return <Grid container spacing={3} className={clsx(classes.p15)}>
        <Grid item md={4}>
            <Box>
                <Typography title={translator("campaigns.camapignName")} className={classes.alignDir}>
                    {translator("landingPages.formName")}
                </Typography>
                <TextField
                    id="campaignName"
                    label=""
                    variant="outlined"
                    name="Name"
                    value={data.PageName}
                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.PageName })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, PageName: e.target.value })}
                    error={!!errors.PageName}
                    title={data.PageName}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.PageName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.PageName ?? errors.PageName}
                    </Typography>
                </Box>
            </Box>
        </Grid>

        <Grid item md={4}>
            <Box>
                <Typography title={translator("landingPages.formLanguage")} className={classes.alignDir}>
                    {translator("landingPages.formLanguage")}
                </Typography>
                <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                        variant="standard"
                        name="FromEmail"
                        value={data.BaseLanguage}
                        className={classes.pbt5}
                        onChange={(event, val) => {
                            onUpdate({ ...data, BaseLanguage: event.target.value });
                            setErrors({ ...errors, formLanguage: '' });
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                    direction: isRTL ? 'rtl' : 'ltr'
                                },
                            },
                        }}
                    >
                        <MenuItem value={0}>{translator("languages.langCodes.hebrew")}</MenuItem>
                        <MenuItem value={1}>{translator("languages.langCodes.english")}</MenuItem>
                    </Select>
                </FormControl>
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.formLanguage ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.formLanguage ?? errors.formLanguage}
                    </Typography>
                </Box>
            </Box>
        </Grid>

        <Grid item md={4}>
            <Box>
                <Typography title={translator("landingPages.shortURL")} className={classes.alignDir}>
                    {translator("landingPages.shortURL")}
                    <Tooltip
                        disableFocusListener
                        title={translator('landingPages.shortURLTooltip')}
                        classes={{
                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                            arrow: classes.fBlack
                        }}
                        enterTouchDelay={50}
                        placement={"top"}
                    >
                        <IconButton className={clsx(classes.icon_Info, classes.noPadding, classes.ml5)}>
                            <BsInfoCircle />
                        </IconButton>
                    </Tooltip>
                </Typography>
                <TextField
                    id="shortURL"
                    label=""
                    variant="outlined"
                    name="Name"
                    value={data.PageUrl}
                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.shortURL })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, PageUrl: e.target.value })}
                    error={!!errors.shortURL}
                    title={data.PageUrl}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(classes.f16)}>
                        https://testpul.site/{data.PageUrl}
                    </Typography>
                    <Typography className={clsx(classes.errorText, classes.f14)}>
                        {errors.shortURL ?? errors.shortURL}
                    </Typography>
                </Box>
            </Box>
        </Grid>

        <Grid item md={4}>
            <Box>
                <Typography title={translator("landingPages.answerType")} className={classes.alignDir}>
                    {translator("landingPages.answerType")}
                </Typography>
                <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                        variant="standard"
                        name="AnswerType"
                        value={data.AnswerType}
                        className={classes.pbt5}
                        onChange={(event, val) => {
                            onUpdate({ ...data, AnswerType: event.target.value });
                            if (event.target.value === LandingPagesAnswerType.SEND_WEBHOOK) onSetDialog({ type: 'sendWebhook' })
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }
                            },
                        }}
                    >
                        <MenuItem value={LandingPagesAnswerType.SYSTEM_DEFAULT_MESSAGE.toString()}>{translator("landingPages.systemDefaultMessage")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.POPUP_MESSAGE.toString()}>{translator("landingPages.popupMessage")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.REDIRECT_URL.toString()}>{translator("landingPages.redirectToURL")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.DOWNLOAD_FILE.toString()}>{translator("landingPages.downloadFile")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE.toString()}>{translator("landingPages.transferToPaymentPage")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.SEND_WEBHOOK.toString()}>{translator("landingPages.sendWebhook")}</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Grid>

        {
            [LandingPagesAnswerType.POPUP_MESSAGE,
            LandingPagesAnswerType.REDIRECT_URL,
            LandingPagesAnswerType.DOWNLOAD_FILE
            ].indexOf(data.answerType) > -1 && (
                <Grid item md={4}>
                    <Box>
                        <Typography title={translator("landingPages.answerMessage")} className={classes.alignDir}>
                            {translator("landingPages.answerMessage")}
                        </Typography>
                        <TextField
                            label=""
                            variant="outlined"
                            value={data.AnswerData}
                            className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.AnswerData })}
                            autoComplete="off"
                            onChange={(e: any) => onUpdate({ ...data, AnswerData: e.target.value })}
                            error={!!errors.AnswerData}
                            title={data.AnswerData}
                        />
                        <Box className='textBoxWrapper'>
                            <Typography className={clsx(errors.AnswerData ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                {errors.AnswerData ?? errors.AnswerData}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            )
        }

        {
            data.answerType === LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE && (
                <>
                    <Grid item md={3}>
                        <Box>
                            <Typography title={translator("landingPages.URL")} className={classes.alignDir}>
                                {translator("landingPages.URL")}
                            </Typography>
                            <TextField
                                label=""
                                variant="outlined"
                                value={data.PageUrl}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.PageUrl })}
                                autoComplete="off"
                                onChange={(e: any) => onUpdate({ ...data, PageUrl: e.target.value })}
                                error={!!errors.PageUrl}
                                title={data.PageUrl}
                            />
                            <Box className='textBoxWrapper'>
                                <Typography className={clsx(errors.PageUrl ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                    {errors.PageUrl ?? errors.PageUrl}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item md={3}>
                        <Box>
                            <Typography title={translator("landingPages.APIUsername")} className={classes.alignDir}>
                                {translator("landingPages.APIUsername")}
                            </Typography>
                            <TextField
                                label=""
                                variant="outlined"
                                value={data.APIUserName}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.APIUserName })}
                                autoComplete="off"
                                onChange={(e: any) => onUpdate({ ...data, APIUserName: e.target.value })}
                                error={!!errors.APIUserName}
                                title={data.APIUserName}
                            />
                            <Box className='textBoxWrapper'>
                                <Typography className={clsx(errors.APIUserName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                    {errors.APIUserName ?? errors.APIUserName}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item md={2}>
                        <Box>
                            <Typography title={translator("landingPages.terminalNumber")} className={classes.alignDir}>
                                {translator("landingPages.terminalNumber")}
                            </Typography>
                            <TextField
                                label=""
                                variant="outlined"
                                value={data.TerminalNumber}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.TerminalNumber })}
                                autoComplete="off"
                                onChange={(e: any) => onUpdate({ ...data, TerminalNumber: e.target.value })}
                                error={!!errors.TerminalNumber}
                                title={data.TerminalNumber}
                            />
                            <Box className='textBoxWrapper'>
                                <Typography className={clsx(errors.TerminalNumber ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                    {errors.TerminalNumber ?? errors.TerminalNumber}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </>
            )
        }
    </Grid>

}
export default FormProperties;