import {
    Box,
    Grid,
    Checkbox,
    TextField,
    Typography,
    FormControl,
    MenuItem,
    FormHelperText
} from '@material-ui/core'
import Select from '@mui/material/Select';
import clsx from "clsx";
import { FaGoogle } from 'react-icons/fa';
import { BiUpload } from 'react-icons/bi';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'
import { LangugeCode, MobileSupport, PulseemFeatures } from "../../../../model/PulseemFields/Fields";
import CustomTooltip from '../../../../components/Tooltip/CustomTooltip';
import PulseemTags from '../../../../components/Tags/PulseemTags'
import { IoIosArrowDown } from 'react-icons/io';
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils';

export const AdvancedSettings = ({
    classes,
    localClasses,
    campaingnValues,
    setShowGallery,
    setCampaingnValues,
    removeAttachmentFile,
}) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector((state) => state.core);
    const { accountFeatures } = useSelector((state) => state.common);
    return <Box pt={3}>
        <Typography className={localClasses.suHeading}>{t("common.AdvancedSettings")}</Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} className='selectWrapper'>
                <Typography title={t("campaigns.newsLetterEditor.mobileSupport")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.mobileSupport")}</Typography>
                <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                        variant="standard"
                        displayEmpty
                        className={classes.pbt5}
                        value={campaingnValues?.IsResponsive ? 1 : 0}
                        onChange={(event) => {
                            setCampaingnValues({
                                ...campaingnValues,
                                IsResponsive: Number(event.target.value) === 1 ? true : false
                            })
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        renderValue={(selected) => {
                            const lc = MobileSupport.find(e => { return e.value === selected });
                            return t(lc?.label);
                        }}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 48 * 4.5 + 8,
                                    width: 250,
                                    direction: isRTL ? 'rtl' : 'ltr'
                                },
                            },
                        }}
                        inputProps={{ 'aria-label': 'Without label' }}
                    >
                        {MobileSupport.map((item) => (
                            <MenuItem
                                key={item.value}
                                value={item.value}
                                name={item.value}
                            >
                                {t(item.label)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {!campaingnValues?.IsResponsive && <FormHelperText className={clsx(classes.f14, classes.red)}>{RenderHtml(t('campaigns.newsLetterEditor.helpTexts.cellularSupportCaution'))}</FormHelperText>}
            </Grid>
            <Grid item xs={12} sm={6} className='selectWrapper'>
                <Typography title={t("campaigns.newsLetterEditor.pre_text")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.pre_text")}</Typography>
                <TextField
                    id="previewText"
                    label=""
                    variant="outlined"
                    name="PreviewText"
                    value={campaingnValues.PreviewText}
                    className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, 'fullWidth')}
                    autoComplete="off"
                    onChange={(e) => {
                        setCampaingnValues({ ...campaingnValues, PreviewText: e.target.value });
                    }}
                    title={campaingnValues.PreviewText}
                // helperText={t('campaigns.newsLetterEditor.helpTexts.pre_helper_text')}
                />
                <Typography className={clsx('MuiFormHelperText-root', classes.f14)}>
                    {t('campaigns.newsLetterEditor.helpTexts.pre_helper_text')}
                </Typography>
            </Grid>
        </Grid>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} className={clsx('selectWrapper', classes.middle)} >
                <Typography title={t("campaigns.newsLetterEditor.language")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.language")}</Typography>
                <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                        variant="standard"
                        displayEmpty
                        value={campaingnValues.LanguageCode}
                        className={classes.pbt5}
                        onChange={(event) => {
                            setCampaingnValues({ ...campaingnValues, LanguageCode: event.target.value })
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        renderValue={(selected) => {
                            const lc = LangugeCode.find(e => { return e.value === selected });
                            return t(lc?.label);
                        }}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 48 * 4.5 + 8,
                                    width: 250,
                                    direction: isRTL ? 'rtl' : 'ltr'
                                },
                            },
                        }}
                        inputProps={{ 'aria-label': 'Without label' }}
                    >
                        {LangugeCode.map((item) => (
                            <MenuItem
                                key={item.value}
                                value={item.value}
                                name={item.value}
                            >
                                {t(item.label)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                {accountFeatures?.indexOf(PulseemFeatures.FILE_ATTACHMENT) > -1 &&
                    <><CustomTooltip
                        isSimpleTooltip={false}
                        classes={classes}
                        interactive={true}
                        arrow={true}
                        placement={'top'}
                        title={<Typography noWrap={false}>{t("Upload File")} - ics, doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt, pptx, mp3, wav</Typography>}
                        text={t("Upload File - ics, doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt, pptx, mp3, wav")}
                    >
                        <Typography noWrap={false}>{t("common.UploadFile")} - ics, doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt, pptx, mp3, wav</Typography>
                    </CustomTooltip>
                        <>
                            <PulseemTags
                                title={""}
                                style={null}
                                classes={classes}
                                tagStyle={{ maxWidth: 150 }}
                                items={campaingnValues.FilesProperties?.map((f) => {
                                    return {
                                        Name: f.Name ?? f.FileName,
                                        ID: f.ID
                                    };
                                })}
                                onShowModal={() => setShowGallery(true)}
                                handleRemove={removeAttachmentFile}
                                icon={<BiUpload />}
                            />
                            <label className={localClasses.helperText}>{t("campaigns.newsLetterEditor.helpTexts.upload")}</label>
                        </>
                        {
                            campaingnValues?.FilesProperties?.length > 0 && <>
                                <Box className={classes.dFlex} style={{ justifyContent: 'space-between' }}>
                                    <Box className={classes.lightBlueTicket}>
                                        <label className={localClasses.helperText}>{t('campaigns.totalSize')} {campaingnValues?.TotalBytes?.toLocaleString() || '0'} {t('campaigns.kb')}</label>
                                        {/* <Loader isOpen={showCostLoader} key="campaigns.kb" size={25} showBackdrop={false} color={"#c9302c"} /> */}
                                    </Box>
                                    <Box className={classes.lightBlueTicket}>
                                        <label className={localClasses.helperText}>{t('campaigns.summaryTotal')} {campaingnValues?.TotalCost?.toLocaleString() || '0'} {t('report.Credits')}</label>
                                        {/* <Loader isOpen={showCostLoader} key="report.Credits" size={25} showBackdrop={false} color={"#c9302c"} /> */}
                                    </Box>
                                </Box>
                            </>
                        }
                    </>
                }
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs={12} sm={6}>
                <Box className={clsx(classes.flex, localClasses.googleCheck)}>
                    <Checkbox
                        color="primary"
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                        name='googleAnalytics'
                        checked={campaingnValues.GoogleAnalytics === true}
                        onClick={() => {
                            setCampaingnValues({ ...campaingnValues, GoogleAnalytics: !campaingnValues.GoogleAnalytics })
                        }}
                    />
                    <FaGoogle />
                    <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.gAnalytics")} align="left">{t("campaigns.newsLetterEditor.gAnalytics")}</Typography>
                </Box>
            </Grid>
        </Grid>
    </Box>
}