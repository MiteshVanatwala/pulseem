import clsx from 'clsx';
import {
    Grid, TextField, FormControl, InputLabel, MenuItem
} from '@material-ui/core'
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { CondType } from '../../../../Models/Groups/DynamicGroup';
import { useTranslation } from 'react-i18next';

const LocationDetails = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();

    return (<Grid container className={classes.pt25}>
        <Grid item xs={8} sm={8} md={8}>
            <Grid container>
                <Grid item xs={10} sm={10} md={10} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.address')}:</InputLabel>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={data?.dynamicData.MyConditions[0]?.Address}
                        onChange={(event: any) => onUpdate('Address', event.target.value.trim())}
                        className={clsx(classes.w100, classes.textField, classes.mt25)}
                    />
                </Grid>
                <Grid item xs={2} sm={2} md={2} className={clsx(classes.p10, classes.mt15)}>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl, classes.w100)}
                    >
                        <Select
                            variant='standard'
                            value={data?.dynamicData.MyConditions[0]?.AddressCond}
                            onChange={(event: any) => onUpdate('AddressCond', event.target.value)}
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
                            variant='standard'
                            value={data?.dynamicData.MyConditions[0]?.CountryCond}
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
                    <InputLabel className={classes.fBlack}>{t('common.state')}:</InputLabel>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={data?.dynamicData.MyConditions[0]?.State}
                        onChange={(event: any) => onUpdate('State', event.target.value.trim())}
                        className={clsx(classes.w100, classes.textField, classes.mt25)}
                    />
                </Grid>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl, classes.w100)}
                    >
                        <Select
                            variant='standard'
                            value={data?.dynamicData.MyConditions[0]?.StateCond}
                            onChange={(event: any) => onUpdate('StateCond', event.target.value)}
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
                            variant='standard'
                            value={data?.dynamicData.MyConditions[0]?.CityCond}
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
                    <InputLabel className={classes.fBlack}>{t('common.zip')}:</InputLabel>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={data?.dynamicData.MyConditions[0]?.Zip}
                        onChange={(event: any) => onUpdate('Zip', event.target.value.trim())}
                        className={clsx(classes.w100, classes.textField, classes.mt25)}
                    />
                </Grid>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10, classes.mt15)}>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl, classes.w100)}
                    >
                        <Select
                            variant='standard'
                            value={data?.dynamicData.MyConditions[0]?.ZipCond}
                            onChange={(event: any) => onUpdate('ZipCond', event.target.value)}
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

export default LocationDetails;