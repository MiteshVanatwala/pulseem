import clsx from 'clsx';
import {
    Grid, TextField,
    // FormControl, InputLabel, MenuItem,
    // Button,
    Box, Accordion, AccordionSummary, Typography, makeStyles, AccordionDetails,
} from '@material-ui/core'
import 'moment/locale/he';
// import { Select } from '@mui/material';
// import { IoIosArrowDown } from 'react-icons/io';
import { CondType } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getAccountExtraData } from '../../../../redux/reducers/smsSlice';
import { useEffect, useState } from 'react';
import { GrFormAdd, GrFormSubtract } from 'react-icons/gr';
// import { DateField } from '../../../../components/managment';
// import moment from 'moment';
// import { DateFormats } from '../../../../helpers/Constants';
import SelectConditionType from '../Components/SelectConditionType';

const useStyles = makeStyles({
    accordionIcons: {
        position: 'absolute',
        '& path': {
            stroke: '#ff3343'
        }
    },
    headLabel: {
        paddingBottom: 5,
        background: '#f0f5ff',
        paddingLeft: 5,
        borderRadius: 5,
    },
    expandedBox: {
        border: '2px solid #f0f5ff',
        borderRadius: 10,
        marginBottom: 16,

        '& .MuiAccordionSummary-root': {
            minHeight: 30,
            maxHeight: 48,
            padding: 0
        },
        '& .MuiAccordionSummary-content': {
            margin: 0
        }
    },
});



const PersonalDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();
    const { extraData } = useSelector((state: any) => state.sms);
    const dispatch = useDispatch();
    const localClasses = useStyles();
    const [showExtraFields, setShowExtraFields] = useState<boolean>(false);

    useEffect(() => {
        if (!extraData || extraData.length === 0) {
            dispatch(getAccountExtraData());
        }
    }, [])

    const mergedExtraFields = {
        "ExtraField1": extraData.ExtraField1 && extraData.ExtraField1 !== '' ? extraData.ExtraField1 : t('common.ExtraField1'),
        "ExtraField2": extraData.ExtraField2 && extraData.ExtraField2 !== '' ? extraData.ExtraField2 : t('common.ExtraField2'),
        "ExtraField3": extraData.ExtraField3 && extraData.ExtraField3 !== '' ? extraData.ExtraField3 : t('common.ExtraField3'),
        "ExtraField4": extraData.ExtraField4 && extraData.ExtraField4 !== '' ? extraData.ExtraField4 : t('common.ExtraField4'),
        "ExtraField5": extraData.ExtraField5 && extraData.ExtraField5 !== '' ? extraData.ExtraField5 : t('common.ExtraField5'),
        "ExtraField6": extraData.ExtraField6 && extraData.ExtraField6 !== '' ? extraData.ExtraField6 : t('common.ExtraField6'),
        "ExtraField7": extraData.ExtraField7 && extraData.ExtraField7 !== '' ? extraData.ExtraField7 : t('common.ExtraField7'),
        "ExtraField8": extraData.ExtraField8 && extraData.ExtraField8 !== '' ? extraData.ExtraField8 : t('common.ExtraField8'),
        "ExtraField9": extraData.ExtraField9 && extraData.ExtraField9 !== '' ? extraData.ExtraField9 : t('common.ExtraField9'),
        "ExtraField10": extraData.ExtraField10 && extraData.ExtraField10 !== '' ? extraData.ExtraField10 : t('common.ExtraField10'),
        "ExtraField11": extraData.ExtraField11 && extraData.ExtraField11 !== '' ? extraData.ExtraField11 : t('common.ExtraField11'),
        "ExtraField12": extraData.ExtraField12 && extraData.ExtraField12 !== '' ? extraData.ExtraField12 : t('common.ExtraField12'),
        "ExtraField13": extraData.ExtraField13 && extraData.ExtraField13 !== '' ? extraData.ExtraField13 : t('common.ExtraField13'),
        "ExtraDate1": extraData.ExtraDate1 && extraData.ExtraDate1 !== '' ? extraData.ExtraDate1 : t('common.ExtraDate1'),
        "ExtraDate2": extraData.ExtraDate2 && extraData.ExtraDate2 !== '' ? extraData.ExtraDate2 : t('common.ExtraDate2'),
        "ExtraDate3": extraData.ExtraDate3 && extraData.ExtraDate3 !== '' ? extraData.ExtraDate3 : t('common.ExtraDate3'),
        "ExtraDate4": extraData.ExtraDate4 && extraData.ExtraDate4 !== '' ? extraData.ExtraDate4 : t('common.ExtraDate4'),
    } as any;

    // const mergedExtraFields = { ...extraFieldsTemp, ...extraData };

    return (
        <Grid container className={clsx(classes.pt25)}>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10, classes.pb25)}>
                        {/* <InputLabel className={classes.fBlack}>{t('common.first_name')}:</InputLabel> */}
                        <TextField
                            label={t('common.first_name')}
                            variant='standard'
                            size='small'
                            value={data.dynamicData.MyConditions[0]?.FirstName}
                            onChange={(event: any) => onUpdate('FirstName', event.target.value)}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data.dynamicData.MyConditions[0]?.FirstName === ''}
                            OnUpdate={(event: any) => onUpdate('FirstNameCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.FirstNameCond || CondType.Undefined}
                            classes={classes}
                            key={'FirstNameCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <TextField
                            label={t('common.last_name')}
                            variant='standard'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.LastName}
                            onChange={(event: any) => onUpdate('LastName', event.target.value)}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data.dynamicData.MyConditions[0]?.LastName === ''}
                            OnUpdate={(event: any) => onUpdate('LastNameCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.LastNameCond ?? CondType.Undefined}
                            classes={classes}
                            key={'LastNameCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <TextField
                            label={t('common.email')}
                            variant='standard'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Email}
                            onChange={(event: any) => onUpdate('Email', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data.dynamicData.MyConditions[0]?.Email === ''}
                            OnUpdate={(event: any) => onUpdate('EmailCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.EmailCond ?? CondType.Undefined}
                            classes={classes}
                            key={'EmailCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <TextField
                            label={t('common.country')}
                            variant='standard'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Country}
                            onChange={(event: any) => onUpdate('Country', event.target.value)}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data.dynamicData.MyConditions[0]?.Country === ''}
                            OnUpdate={(event: any) => onUpdate('CountryCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.CountryCond ?? CondType.Undefined}
                            classes={classes}
                            key={'CountryCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <TextField
                            label={t('common.city')}
                            variant='standard'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.City}
                            onChange={(event: any) => onUpdate('City', event.target.value)}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data.dynamicData.MyConditions[0]?.City === ''}
                            OnUpdate={(event: any) => onUpdate('CityCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.CityCond ?? CondType.Undefined}
                            classes={classes}
                            key={'CityCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <TextField
                            label={t('common.company')}
                            variant='standard'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Company}
                            onChange={(event: any) => onUpdate('Company', event.target.value)}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data?.dynamicData.MyConditions[0]?.Company === ''}
                            OnUpdate={(event: any) => onUpdate('ComapnyCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.ComapnyCond ?? CondType.Undefined}
                            classes={classes}
                            key={'ComapnyCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <TextField
                            label={t('common.state')}
                            variant='standard'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.State}
                            onChange={(event: any) => onUpdate('State', event.target.value)}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data?.dynamicData.MyConditions[0]?.State === ''}
                            OnUpdate={(event: any) => onUpdate('StateCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.StateCond ?? CondType.Undefined}
                            classes={classes}
                            key={'StateCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <TextField
                            label={t('common.cellphone')}
                            variant='standard'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Cellphone}
                            onChange={(event: any) => onUpdate('Cellphone', event.target.value)}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                            InputLabelProps={{
                                style: {
                                    fontSize: 17
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <SelectConditionType
                            Disabled={data?.dynamicData.MyConditions[0]?.Cellphone === ''}
                            OnUpdate={(event: any) => onUpdate('CellphoneCond', event.target.value)}
                            Value={data?.dynamicData.MyConditions[0]?.CellphoneCond ?? CondType.Undefined}
                            classes={classes}
                            key={'CellphoneCond'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Box className={clsx(classes.fullWidth, classes.pt25)}>
                <Accordion
                    expanded={showExtraFields}
                    className={clsx(classes.noBoxShadow, localClasses.expandedBox)}
                    key={1}
                >
                    <AccordionSummary
                        expandIcon={""}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        onClick={() => setShowExtraFields(!showExtraFields)}
                    >
                        <Box className={classes.fullWidth}>
                            <Typography align="left" className={clsx(classes.font18, classes.bold, localClasses.headLabel)}>{t('common.extraFields')}
                                {
                                    !showExtraFields ? <GrFormAdd size={26} className={localClasses.accordionIcons} /> : <GrFormSubtract size={26} className={localClasses.accordionIcons} />
                                }
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container>
                            {Object.keys(mergedExtraFields).map((field: any) => {
                                const fieldName = mergedExtraFields[field];
                                return <Grid item xs={4} sm={4} md={4} key={fieldName ?? field}>
                                    <Grid container>
                                        {field.toLowerCase().indexOf('date') > -1 ? (
                                            <>
                                                {/* @ts-ignore */}
                                                {/* <DateField
                                                    toolbarDisabled={false}
                                                    classes={classes}
                                                    value={data.dynamicData.MyConditions[0][field]}
                                                    onChange={(value: any) => onUpdate(field, moment(value).format(DateFormats.DATE_ONLY))}
                                                    placeholder={t('common.ToDate')}
                                                    timePickerOpen={false}
                                                    dateActive={true}
                                                    onTimeChange={() => { }}
                                                    timeActive={false}
                                                    buttons={[]}
                                                    removePadding={true}
                                                    hideInvalidDateMessage={true}
                                                />
                                                {
                                                    data.dynamicData.MyConditions[0][field] && <Button className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)} onClick={() => onUpdate(field, null)}>{t("recipient.reset")}</Button>
                                                } */}
                                            </>) : (<><Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                                                <TextField
                                                    label={fieldName ?? field}
                                                    variant='standard'
                                                    size='small'
                                                    value={data.dynamicData.MyConditions[0][field]}
                                                    onChange={(event: any) => onUpdate(field, event.target.value)}
                                                    className={clsx(classes.w100, classes.textField, classes.mt25)}
                                                    InputLabelProps={{
                                                        style: {
                                                            fontSize: 17
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                                                    <SelectConditionType
                                                        Disabled={!data.dynamicData.MyConditions[0][field] || data.dynamicData.MyConditions[0][field] === ''}
                                                        OnUpdate={(event: any) => onUpdate(`${field}Cond`, event.target.value)}
                                                        Value={data.dynamicData.MyConditions[0][`${field}Cond`] ?? CondType.Undefined}
                                                        classes={classes}
                                                        key={`${field}Cond`}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </Grid>
                            })}

                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Grid >
    )
}

export default PersonalDetails;