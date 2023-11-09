import clsx from 'clsx';
import {
    Grid, TextField, FormControl, InputLabel, MenuItem
} from '@material-ui/core'
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { CondType } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';

const PersonalDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();

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
            {/* <Grid item xs={4} sm={4} md={4}>
                <Grid container>
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <InputLabel className={classes.fBlack}>{t('common.telephone')}:</InputLabel>
                        <TextField
                            placeholder={t('common.telephone')}
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Telephone}
                            onChange={(event: any) => onUpdate('Telephone', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data.dynamicData.MyConditions[0]?.Telephone === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.TelephoneCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('TelephoneCond', event.target.value)}
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
                        <InputLabel className={classes.fBlack}>{t('common.cellphone')}:</InputLabel>
                        <TextField
                            placeholder={t('common.cellphone')}
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Cellphone}
                            onChange={(event: any) => onUpdate('Cellphone', event.target.value.trim())}
                            className={clsx(classes.w100, classes.textField, classes.mt25)}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                        <FormControl
                            variant="standard"
                            className={clsx(classes.selectInputFormControl, classes.w100)}
                        >
                            <Select
                                disabled={data.dynamicData.MyConditions[0]?.Cellphone === ''}
                                variant='standard'
                                value={data?.dynamicData.MyConditions[0]?.CellphoneCond ?? CondType.Undefined}
                                onChange={(event: any) => onUpdate('CellphoneCond', event.target.value)}
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
            </Grid> */}
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
        </Grid>
    )
}

export default PersonalDetails;