import { Box, FormControl, Grid, IconButton, MenuItem, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { LandingPagesAnswerType } from "../../../../helpers/Constants";
import { coreProps } from "../../../Whatsapp/Campaign/Types/WhatsappCampaign.types";
import { isShortUrlExist } from "../../../../redux/reducers/landingPagesSlice";
import { LangugeCode } from "../../../../model/PulseemFields/Fields";
import { WebformsToReportLeadByApi } from "../../../../Models/LandingPage/WebformsToReportLeadByApi";


const FormProperties = ({ classes, data, onUpdate, onSetDialog, errors, setErrors }: any) => {
    const { t: translator } = useTranslation();
    const { isRTL, windowSize } = useSelector(
        (state: { core: coreProps }) => state.core
    );
    const dispatch = useDispatch();

    const checkShortURLExist = async (event: any) => {
        const shortUrl = event.target.value.replace(/ /g, '_')
        //@ts-ignore
        const isExistRes: any = await dispatch(isShortUrlExist(shortUrl));
        setErrors({
            ...errors,
            shortURL: isExistRes?.payload?.Data === true ? translator('landingPages.shortURLExist') : ''
        })
    }

    return <Grid container spacing={2} className={clsx(classes.p15, classes.mb4)}>
        <Grid item md={3} xs={12} sm={12}>
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
                onChange={(e: any) => onUpdate({ ...data, PageName: e.target.value, PageUrl: e.target.value.replace(/ /g, '_') })}
                error={!!errors.PageName}
                title={data.PageName}
            // onBlur={handleFromName}
            />
            <Box className='textBoxWrapper'>
                <Typography className={clsx(errors.PageName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.PageName ?? errors.PageName}
                </Typography>
            </Box>
        </Grid>

        <Grid item md={3} className={classes.w100}>
            <Typography title={translator("landingPages.formLanguage")} className={classes.alignDir}>
                {translator("landingPages.formLanguage")}
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
                    {LangugeCode.map((item) => <option key={item.value} value={item.value}>{translator(item.label)}</option>)}
                </Select>
            </FormControl>
            <Box className='textBoxWrapper'>
                <Typography className={clsx(errors.formLanguage ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.formLanguage ?? errors.formLanguage}
                </Typography>
            </Box>
        </Grid>

        <Grid item md={3} className={classes.w100}>
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
                onBlur={checkShortURLExist}
            />
            <Box className='textBoxWrapper'>
                <Typography className={clsx(classes.f16)}>
                    https://testpul.site/{data.PageUrl}
                </Typography>
                <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.shortURL ?? errors.shortURL}
                </Typography>
            </Box>
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
                            value={data.AnswerType}
                            className={classes.pbt5}
                            onChange={(event, val) => onUpdate({ ...data, AnswerType: event.target.value })}
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
                            <option value={LandingPagesAnswerType.DOWNLOAD_FILE}>{translator("landingPages.downloadFile")}</option>
                            <option value={LandingPagesAnswerType.WITHOUT_ANSWER}>{translator("landingPages.withoutAnswer")}</option>
                            <option value={LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE}>{translator("landingPages.transferToPaymentPage")}</option>
                            {/* <MenuItem value={LandingPagesAnswerType.SEND_WEBHOOK}>{translator("landingPages.sendWebhook")}</MenuItem> */}
                        </Select>
                    </FormControl>
                </Grid>
            )
        }

        {
            [LandingPagesAnswerType.POPUP_MESSAGE,
            LandingPagesAnswerType.REDIRECT_URL,
            LandingPagesAnswerType.DOWNLOAD_FILE
            ].indexOf(data.AnswerType) > -1 && (
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
            )
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

                    <Grid item md={3} className={classes.w100}>
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

                    <Grid item md={2} className={classes.w100}>
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
                </>
            )
        }
    </Grid >

}
export default FormProperties;