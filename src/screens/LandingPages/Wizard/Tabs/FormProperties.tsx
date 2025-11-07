import { Box, Checkbox, FormControl, FormControlLabel, Grid, IconButton, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { LandingPagesAnswerType } from "../../../../helpers/Constants";
import { coreProps } from "../../../Whatsapp/Campaign/Types/WhatsappCampaign.types";
import { isShortUrlExist } from "../../../../redux/reducers/landingPagesSlice";
import { LangugeCode } from "../../../../model/PulseemFields/Fields";
import { useEffect, useState } from "react";

const POPUP_LANGUAGES = [0, 1, 14];

const FormProperties = ({ classes, data, onUpdate, onSetDialog, errors, setErrors, isPopup }: any) => {
    const { t: translator } = useTranslation();
    const { isRTL, language } = useSelector(
        (state: { core: coreProps }) => state.core
    );
    const dispatch = useDispatch();
    const PAYMENT_URL = 'https://pulseem.co.il/Pulseem/Home/PaymentPage';
    const [urlLocked, setUrlLoceked] = useState<boolean>(false);

    const checkShortURLExist = async (event: any) => {
        const shortUrl = event.target.value.replace(/ /g, '_')
        const req = { WebFormID: data?.ID, ShortUrl: shortUrl };
        //@ts-ignore
        const isExistRes: any = await dispatch(isShortUrlExist(req));
        setErrors({
            ...errors,
            shortURL: isExistRes?.payload?.Data === true ? translator('landingPages.shortURLExist') : ''
        })
    }

    const domain = ' https://l-p.site/clientpages/';

    useEffect(() => {
        const languageToId = {
            'he': 0,
            'en': 1,
            'fr': 2, // French
            'es': 3, // Spanish
            'de': 4, // German
            'ru': 5, // Russian
            'ja': 6, // Japanese
            'ro': 7, // Romanian
            'ar': 8, // Arabic
            'hu': 9, // Hungarian
            'sk': 10, // Slovak
            'pt': 11, // Portuguese
            'nl': 12, // Dutch
            'pl': 14  // Polish
        } as any;


        onUpdate({ ...data, BaseLanguage: languageToId[language] });
    }, [language])

    useEffect(() => {
        if (isPopup && data.IsAccessibility !== false) {
            onUpdate({ ...data, IsAccessibility: false });
        }
    }, [isPopup]);

    const renderPaymentFields = () => {
        return <>
            <Grid item md={2} className={classes.w100}>
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
            </Grid>

            <Grid item md={1} className={classes.w100}>
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
            </Grid>
            <Grid item md={1} className={classes.w100}>
                <Typography title={translator("landingPages.departmentNumber")} className={classes.alignDir}>
                    {translator("landingPages.departmentNumber")}
                </Typography>
                <TextField
                    label=""
                    variant="outlined"
                    value={data.DepartmentId}
                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.DepartmentId })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, DepartmentId: e.target.value })}
                    error={!!errors.DepartmentId}
                    title={data.DepartmentId}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.DepartmentId ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.DepartmentId ?? errors.DepartmentId}
                    </Typography>
                </Box>
            </Grid>
        </>
    }

    const handlePageName = (e: any) => {
        if (isPopup) {
            onUpdate({ ...data, PageName: e.target.value, IsAccessibility: false });
        }
        else if (urlLocked || data.ID > 0) {
            onUpdate({ ...data, PageName: e.target.value });
        }
        else {
            onUpdate({ ...data, PageName: e.target.value, PageUrl: "".toValidLPName(e.target.value) });
        }

    }

    return <Grid container spacing={2} className={clsx(classes.p15, classes.mb4)}>
        <Grid item md={3} xs={12} sm={12}>
            <Typography title={translator(isPopup ? "PopupTriggers.summary.popupName" : "landingPages.formName")} className={classes.alignDir}>
                {translator(isPopup ? "PopupTriggers.summary.popupName" : "landingPages.formName")}
            </Typography>
            <TextField
                id="campaignName"
                label=""
                variant="outlined"
                name="Name"
                value={data.PageName}
                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.PageName })}
                autoComplete="off"
                onBlur={() => { if (data.PageName !== '') setUrlLoceked(true) }}
                onChange={(e: any) => { handlePageName(e) }}
                error={!!errors.PageName}
                title={data.PageName}
            />
            <Box className='textBoxWrapper'>
                <Typography className={clsx(errors.PageName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.PageName ?? errors.PageName}
                </Typography>
            </Box>
        </Grid>

        <Grid item md={3} className={classes.w100}>
            <Typography title={translator(isPopup ? "PopupTriggers.summary.popupLanguage" : "landingPages.formLanguage")} className={classes.alignDir}>
                {translator(isPopup ? "PopupTriggers.summary.popupLanguage" : "landingPages.formLanguage")}
            </Typography>
            <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                <Select
                    native
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
                    {LangugeCode
                        .filter(item => !isPopup || POPUP_LANGUAGES.includes(item.value))
                        .map((item) => <option key={item.value} value={item.value}>{translator(item.label)}</option>)
                    }
                </Select>
            </FormControl>
            <Box className='textBoxWrapper'>
                <Typography className={clsx(errors.formLanguage ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.formLanguage ?? errors.formLanguage}
                </Typography>
            </Box>
        </Grid>

        {data.PageType < 3 && <Grid item md={3} className={classes.w100}>
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
                value={"".toValidLPName(data.PageUrl)}
                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.shortURL })}
                autoComplete="off"
                onChange={(e: any) => onUpdate({ ...data, PageUrl: "".toValidLPName(e.target.value) })}
                error={!!errors.shortURL}
                title={"".toValidLPName(data.PageUrl)}
                onBlur={checkShortURLExist}
                disabled={isPopup}
            />
            <Box className='textBoxWrapper'>
                <Typography className={clsx(classes.f13)} style={{ direction: 'ltr' }}>
                    {domain}{"".toValidLPName(data.PageUrl)}
                </Typography>
                <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.shortURL ?? errors.shortURL}
                </Typography>
            </Box>
        </Grid>}
        <Grid item md={data.PageType < 3 ? 3 : 6} xs={12} sm={12} className={classes.mt25} style={{ visibility: isPopup ? 'hidden' : 'visible' }}>
            <FormControlLabel
                control={
                    <Checkbox
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                        onClick={() => onUpdate({
                            ...data,
                            IsAccessibility: !data.IsAccessibility
                        })}
                        checked={data.IsAccessibility}
                        value={data.IsAccessibility}
                    />
                }
                label={translator("common.accessibility")}
            />
        </Grid>

        {
            data.PageType !== 2 && (
                <Grid item md={3} className={classes.w100}>
                    <Typography title={translator("landingPages.answerType")} className={classes.alignDir}>
                        {translator("landingPages.answerType")}
                    </Typography>
                    <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                        <Select
                            native
                            variant="standard"
                            name="AnswerType"
                            value={data.AnswerType
                                // data.AnswerType === LandingPagesAnswerType.REDIRECT_URL && data.AnswerData.toLowerCase().indexOf('home/paymentpage') > -1
                                //     ? LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
                                //     : data.AnswerType
                            }
                            className={classes.pbt5}
                            onChange={(event: any, val: any) => {
                                const selection = parseInt(event.target.value);

                                // if (selection === LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE) {
                                //     onUpdate({ ...data, AnswerType: selection, AnswerData: PAYMENT_URL });
                                // }
                                // else {
                                //     onUpdate({ ...data, AnswerType: selection, AnswerData: '' })
                                // }
                                onUpdate({ ...data, AnswerType: selection, AnswerData: '' })
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
                            <option value={LandingPagesAnswerType.SYSTEM_DEFAULT_MESSAGE}>{translator("landingPages.systemDefaultMessage")}</option>
                            <option value={LandingPagesAnswerType.POPUP_MESSAGE}>{translator("landingPages.popupMessage")}</option>
                            <option value={LandingPagesAnswerType.REDIRECT_URL}>{translator("landingPages.redirectToURL")}</option>
                            {/* <option value={LandingPagesAnswerType.DOWNLOAD_FILE}>{translator("landingPages.downloadFile")}</option> */}
                            <option value={LandingPagesAnswerType.WITHOUT_ANSWER}>{translator("landingPages.withoutAnswer")}</option>
                            {/* <option value={LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE}>{translator("landingPages.transferToPaymentPage")}</option> */}
                            {/* <MenuItem value={LandingPagesAnswerType.SEND_WEBHOOK}>{translator("landingPages.sendWebhook")}</MenuItem> */}
                        </Select>
                    </FormControl>
                </Grid>
            )
        }

        {
            isPopup && [LandingPagesAnswerType.POPUP_MESSAGE,
            LandingPagesAnswerType.REDIRECT_URL
            ].indexOf(data.AnswerType) > -1 && (
                <>
                    <Grid item md={3} className={classes.w100}>
                        <Typography title={translator("landingPages.answerMessage")} className={classes.alignDir}>
                            {translator(data.AnswerType === LandingPagesAnswerType.REDIRECT_URL
                                ? "landingPages.redirectUrl"
                                : "landingPages.answerMessage"
                            )}
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
                    </Grid>
                    {data.AnswerData.toLowerCase().indexOf('home/paymentpage') > -1 && renderPaymentFields()}
                </>
            )
        }

        {
            isPopup ? (
                <Grid item md={3} className={classes.w100}>
                    <Typography title={translator("landingPages.Domain")} className={classes.alignDir}>
                        {translator("landingPages.Domain")}
                    </Typography>
                    <TextField
                        label=""
                        variant="outlined"
                        value={Array.isArray(data.PopupDomains) && data.PopupDomains.length > 0 ? data.PopupDomains[0] : ''}
                        className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.PopupDomains })}
                        autoComplete="off"
                        onChange={(e: any) => {
                            onUpdate({ ...data, PopupDomains: e.target.value ? [e.target.value] : [] });
                            if (errors.PopupDomains && e.target.value) {
                                setErrors({ ...errors, PopupDomains: '' });
                            }
                        }}
                        error={!!errors.PopupDomains}
                        title={Array.isArray(data.PopupDomains) && data.PopupDomains.length > 0 ? data.PopupDomains[0] : ''}
                        placeholder="https://example.com"
                    />
                    <Box className='textBoxWrapper'>
                        <Typography className={clsx(errors.PopupDomains ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                            {errors.PopupDomains || ''}
                        </Typography>
                    </Box>
                </Grid>
            ) : null
        }

        {
            !isPopup && [LandingPagesAnswerType.POPUP_MESSAGE,
            LandingPagesAnswerType.REDIRECT_URL
            ].indexOf(data.AnswerType) > -1 && (
                <>
                    <Grid item md={3} className={classes.w100}>
                        <Typography title={translator("landingPages.answerMessage")} className={classes.alignDir}>
                            {translator(data.AnswerType === LandingPagesAnswerType.REDIRECT_URL
                                ? "landingPages.redirectUrl"
                                : "landingPages.answerMessage"
                            )}
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
                    </Grid>
                    {data.AnswerData.toLowerCase().indexOf('home/paymentpage') > -1 && renderPaymentFields()}
                </>
            )
        }

        {/* {[LandingPagesAnswerType.DOWNLOAD_FILE].indexOf(data.AnswerType) > -1 && (
            <>
                <Grid item md={3} className={classes.w100}>
                    <Typography title={translator("landingPages.answerMessage")} className={classes.alignDir}>
                        {translator(
                            data.AnswerType === LandingPagesAnswerType.DOWNLOAD_FILE
                                ? "landingPages.downloadFileUrl"
                                : (
                                    data.AnswerType === LandingPagesAnswerType.REDIRECT_URL
                                        ? "landingPages.redirectUrl"
                                        : "landingPages.answerMessage"
                                )
                        )}
                    </Typography>
                    <TextField
                        label=""
                        variant="outlined"
                        value={data.DownloadUrl}
                        className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.AnswerData })}
                        autoComplete="off"
                        onChange={(e: any) => onUpdate({ ...data, DownloadUrl: e.target.value })}
                        error={!!errors.DownloadUrl}
                        title={data.DownloadUrl}
                    />
                    <Box className='textBoxWrapper'>
                        <Typography className={clsx(errors.DownloadUrl ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                            {errors.DownloadUrl ?? errors.DownloadUrl}
                        </Typography>
                    </Box>
                </Grid>
                {data.AnswerData.toLowerCase().indexOf('home/paymentpage') > -1 && renderPaymentFields()}
            </>)
        } 
        {
            data.AnswerType === LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE && (
                <>
                    <Grid item md={3} className={classes.w100}>
                        <Typography title={translator("landingPages.URL")} className={classes.alignDir}>
                            {translator("landingPages.URL")}
                        </Typography>
                        <TextField
                            label=""
                            variant="outlined"
                            value={data.AnswerData}
                            style={{ direction: 'ltr' }}
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
                    </Grid>
                    {renderPaymentFields()}
                </>
            )
        } */}
    </Grid >

}
export default FormProperties;