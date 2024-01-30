import { Box, FormControl, Grid, IconButton, MenuItem, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { useDispatch } from "react-redux";
import { LandingPagesAnswerType } from "../../../../helpers/Constants";
import { useState } from "react";


const FormProperties = ({ classes, data, onUpdate, onSetDialog }: any) => {
    const dispatch: any = useDispatch();
    const { t: translator } = useTranslation();

    const [errors, setErrors] = useState({
        formName: '',
        formLanguage: '',
        shortURL: '',
        pageTitle: '',
        answerMessage: '',
        paymentURL: '',
        paymentAPIUsername: '',
        paymentTerminalNumber: '',
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
                    value={data.formName}
                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.formName })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, formName: e.target.value })}
                    error={!!errors.formName}
                    title={data.formName}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.formName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.formName ?? errors.formName}
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
                        value={data.formLanguage}
                        className={classes.pbt5}
                        onChange={(event, val) => {
                            onUpdate({ ...data, formLanguage: event.target.value });
                            setErrors({ ...errors, formLanguage: '' });
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
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
                    value={data.shortURL}
                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.shortURL })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, shortURL: e.target.value })}
                    error={!!errors.shortURL}
                    title={data.shortURL}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(classes.f16)}>
                        https://testpul.site/{data.shortURL}
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
                        name="FromEmail"
                        value={data.answerType}
                        className={classes.pbt5}
                        onChange={(event, val) => {
                            onUpdate({ ...data, answerType: event.target.value });
                            if (event.target.value === LandingPagesAnswerType.SEND_WEBHOOK) onSetDialog({ type: 'sendWebhook' })
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                    >
                        <MenuItem value={LandingPagesAnswerType.SYSTEM_DEFAULT_MESSAGE}>{translator("landingPages.systemDefaultMessage")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.POPUP_MESSAGE}>{translator("landingPages.popupMessage")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.REDIRECT_URL}>{translator("landingPages.redirectToURL")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.DOWNLOAD_FILE}>{translator("landingPages.downloadFile")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE}>{translator("landingPages.transferToPaymentPage")}</MenuItem>
                        <MenuItem value={LandingPagesAnswerType.SEND_WEBHOOK}>{translator("landingPages.sendWebhook")}</MenuItem>
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
                            value={data.answerMessage}
                            className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.answerMessage })}
                            autoComplete="off"
                            onChange={(e: any) => onUpdate({ ...data, answerMessage: e.target.value })}
                            error={!!errors.answerMessage}
                            title={data.answerMessage}
                        />
                        <Box className='textBoxWrapper'>
                            <Typography className={clsx(errors.answerMessage ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                {errors.answerMessage ?? errors.answerMessage}
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
                                value={data.paymentURL}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.paymentURL })}
                                autoComplete="off"
                                onChange={(e: any) => onUpdate({ ...data, paymentURL: e.target.value })}
                                error={!!errors.paymentURL}
                                title={data.paymentURL}
                            />
                            <Box className='textBoxWrapper'>
                                <Typography className={clsx(errors.paymentURL ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                    {errors.paymentURL ?? errors.paymentURL}
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
                                value={data.paymentAPIUsername}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.paymentAPIUsername })}
                                autoComplete="off"
                                onChange={(e: any) => onUpdate({ ...data, paymentAPIUsername: e.target.value })}
                                error={!!errors.paymentAPIUsername}
                                title={data.paymentAPIUsername}
                            />
                            <Box className='textBoxWrapper'>
                                <Typography className={clsx(errors.paymentAPIUsername ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                    {errors.paymentAPIUsername ?? errors.paymentAPIUsername}
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
                                value={data.paymentTerminalNumber}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.paymentTerminalNumber })}
                                autoComplete="off"
                                onChange={(e: any) => onUpdate({ ...data, paymentTerminalNumber: e.target.value })}
                                error={!!errors.paymentTerminalNumber}
                                title={data.paymentTerminalNumber}
                            />
                            <Box className='textBoxWrapper'>
                                <Typography className={clsx(errors.paymentTerminalNumber ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                    {errors.paymentTerminalNumber ?? errors.paymentTerminalNumber}
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