import clsx from 'clsx';
import {
    Grid, TextField, FormControl, InputLabel, MenuItem, Box, Accordion, AccordionSummary, Typography, makeStyles, AccordionDetails
} from '@material-ui/core'
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { CondType } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getAccountExtraData } from '../../../../redux/reducers/smsSlice';
import { useEffect, useState } from 'react';
import { GrFormAdd, GrFormSubtract } from 'react-icons/gr';

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

    const extraFieldsTemp = {
        "ExtraField1": t('common.ExtraField1'),
        "ExtraField2": t('common.ExtraField2'),
        "ExtraField3": t('common.ExtraField3'),
        "ExtraField4": t('common.ExtraField4'),
        "ExtraField5": t('common.ExtraField5'),
        "ExtraField6": t('common.ExtraField6'),
        "ExtraField7": t('common.ExtraField7'),
        "ExtraField8": t('common.ExtraField8'),
        "ExtraField9": t('common.ExtraField9'),
        "ExtraField10": t('common.ExtraField10'),
        "ExtraField11": t('common.ExtraField11'),
        "ExtraField12": t('common.ExtraField12'),
        "ExtraField13": t('common.ExtraField13'),
        "ExtraDate1": t('common.ExtraDate1'),
        "ExtraDate2": t('common.ExtraDate2'),
        "ExtraDate3": t('common.ExtraDate3'),
        "ExtraDate4": t('common.ExtraDate4')
    }

    const mergedExtraFields = { ...extraFieldsTemp, ...extraData };

    return (
        <Grid container className={clsx(classes.pt25)}>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10, classes.pb25)}>
                        <InputLabel className={classes.fBlack}>{t('common.first_name')}:</InputLabel>
                        <TextField
                            placeholder={t('common.first_name')}
                            variant='outlined'
                            size='small'
                            value={data.dynamicData.MyConditions[0]?.FirstName}
                            onChange={(event: any) => onUpdate('FirstName', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data.dynamicData.MyConditions[0]?.FirstName === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.FirstNameCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('FirstNameCond', event.target.value)}
                                IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                className={clsx(classes.w100, classes.mt20)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value={CondType.Undefined}>{t('common.select')}</MenuItem>
                                <MenuItem value={CondType.Equal}>{t('common.equal')}</MenuItem>
                                <MenuItem value={CondType.Like}>{t('common.like')}</MenuItem>
                                <MenuItem value={CondType.NotEqual}>{t('common.notEqual')}</MenuItem>
                                <MenuItem value={CondType.StartsWith}>{t('common.startsWith')}</MenuItem>
                                <MenuItem value={CondType.NoValue}>{t('common.noValue')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <InputLabel className={classes.fBlack}>{t('common.last_name')}:</InputLabel>
                        <TextField
                            placeholder={t('common.last_name')}
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.LastName}
                            onChange={(event: any) => onUpdate('LastName', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data.dynamicData.MyConditions[0]?.LastName === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.LastNameCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('LastNameCond', event.target.value)}
                                IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                className={clsx(classes.w100, classes.mt20)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value={CondType.Undefined}>{t('common.select')}</MenuItem>
                                <MenuItem value={CondType.Equal}>{t('common.equal')}</MenuItem>
                                <MenuItem value={CondType.Like}>{t('common.like')}</MenuItem>
                                <MenuItem value={CondType.NotEqual}>{t('common.notEqual')}</MenuItem>
                                <MenuItem value={CondType.StartsWith}>{t('common.startsWith')}</MenuItem>
                                <MenuItem value={CondType.NoValue}>{t('common.noValue')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <InputLabel className={classes.fBlack}>{t('common.email')}:</InputLabel>
                        <TextField
                            placeholder={t('common.email')}
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Email}
                            onChange={(event: any) => onUpdate('Email', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data.dynamicData.MyConditions[0]?.Email === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.EmailCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('EmailCond', event.target.value)}
                                IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                className={clsx(classes.w100, classes.mt20)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value={CondType.Undefined}>{t('common.select')}</MenuItem>
                                <MenuItem value={CondType.Equal}>{t('common.equal')}</MenuItem>
                                <MenuItem value={CondType.Like}>{t('common.like')}</MenuItem>
                                <MenuItem value={CondType.NotEqual}>{t('common.notEqual')}</MenuItem>
                                <MenuItem value={CondType.StartsWith}>{t('common.startsWith')}</MenuItem>
                                <MenuItem value={CondType.NoValue}>{t('common.noValue')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <InputLabel className={classes.fBlack}>{t('common.country')}:</InputLabel>
                        <TextField
                            placeholder={t('common.country')}
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Country}
                            onChange={(event: any) => onUpdate('Country', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data?.dynamicData.MyConditions[0]?.Country === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.CountryCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('CountryCond', event.target.value)}
                                IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                className={clsx(classes.w100, classes.mt20)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value={CondType.Undefined}>{t('common.select')}</MenuItem>
                                <MenuItem value={CondType.Equal}>{t('common.equal')}</MenuItem>
                                <MenuItem value={CondType.Like}>{t('common.like')}</MenuItem>
                                <MenuItem value={CondType.NotEqual}>{t('common.notEqual')}</MenuItem>
                                <MenuItem value={CondType.StartsWith}>{t('common.startsWith')}</MenuItem>
                                <MenuItem value={CondType.NoValue}>{t('common.noValue')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <InputLabel className={classes.fBlack}>{t('common.city')}:</InputLabel>
                        <TextField
                            placeholder={t('common.city')}
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.City}
                            onChange={(event: any) => onUpdate('City', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data?.dynamicData.MyConditions[0]?.City === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.CityCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('CityCond', event.target.value)}
                                IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                className={clsx(classes.w100, classes.mt20)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value={CondType.Undefined}>{t('common.select')}</MenuItem>
                                <MenuItem value={CondType.Equal}>{t('common.equal')}</MenuItem>
                                <MenuItem value={CondType.Like}>{t('common.like')}</MenuItem>
                                <MenuItem value={CondType.NotEqual}>{t('common.notEqual')}</MenuItem>
                                <MenuItem value={CondType.StartsWith}>{t('common.startsWith')}</MenuItem>
                                <MenuItem value={CondType.NoValue}>{t('common.noValue')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <InputLabel className={classes.fBlack}>{t('common.company')}:</InputLabel>
                        <TextField
                            placeholder={t('common.company')}
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Company}
                            onChange={(event: any) => onUpdate('Company', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data.dynamicData.MyConditions[0]?.Company === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.ComapnyCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('ComapnyCond', event.target.value)}
                                IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                className={clsx(classes.w100, classes.mt20)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value={CondType.Undefined}>{t('common.select')}</MenuItem>
                                <MenuItem value={CondType.Equal}>{t('common.equal')}</MenuItem>
                                <MenuItem value={CondType.Like}>{t('common.like')}</MenuItem>
                                <MenuItem value={CondType.NotEqual}>{t('common.notEqual')}</MenuItem>
                                <MenuItem value={CondType.StartsWith}>{t('common.startsWith')}</MenuItem>
                                <MenuItem value={CondType.NoValue}>{t('common.noValue')}</MenuItem>
                            </Select>
                        </FormControl>
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
                            {Object.keys(mergedExtraFields).map((field: any, index: number) => {
                                const fieldName = mergedExtraFields[field];
                                return <Grid item xs={4} sm={4} md={4}>
                                    <Grid container>
                                        <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                                            <InputLabel className={classes.fBlack}>{fieldName}:</InputLabel>
                                            <TextField
                                                placeholder={fieldName}
                                                variant='outlined'
                                                size='small'
                                                value={data?.dynamicData?.MyConditions[0][field]}
                                                onChange={(event: any) => onUpdate(field, event.target.value.trim())}
                                                className={clsx(classes.w100, classes.textField, classes.mt25)}
                                            />
                                        </Grid>
                                        <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                                            <FormControl
                                                variant="standard"
                                                className={clsx(classes.selectInputFormControl, classes.w100)}
                                            >
                                                <Select
                                                    disabled={data?.dynamicData?.MyConditions[0][field] === ''}
                                                    variant='standard'
                                                    value={data?.dynamicData?.MyConditions[0][field + 'Cond'] ?? CondType.Undefined}
                                                    onChange={(event: any) => onUpdate(field + 'Cond', event.target.value)}
                                                    IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                                    className={clsx(classes.w100, classes.mt20)}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 300,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value={CondType.Undefined}>{t('common.select')}</MenuItem>
                                                    <MenuItem value={CondType.Equal}>{t('common.equal')}</MenuItem>
                                                    <MenuItem value={CondType.Like}>{t('common.like')}</MenuItem>
                                                    <MenuItem value={CondType.NotEqual}>{t('common.notEqual')}</MenuItem>
                                                    <MenuItem value={CondType.StartsWith}>{t('common.startsWith')}</MenuItem>
                                                    <MenuItem value={CondType.NoValue}>{t('common.noValue')}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            })}

                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Grid>
    )
}

export default PersonalDetails;