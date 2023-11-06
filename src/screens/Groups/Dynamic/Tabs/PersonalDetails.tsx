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
                    <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                        <InputLabel className={classes.fBlack}>{t('common.first_name')}:</InputLabel>
                        <TextField
                            variant='outlined'
                            size='small'
                            value={data.dynamicData.MyConditions[0]?.FirstName}
                            onChange={(event: any) => {
                                let newObj = JSON.parse(JSON.stringify(data));
                                // let condition = newObj?.dynamicData?.MyConditions[0] as any;
                                // condition.FirstName = event.target.value.trim();
                                newObj.dynamicData.MyConditions[0].FirstName = event.target.value.trim();

                                onUpdate({ ...data, newObj });
                            }}
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
                                value={data?.dynamicData.MyConditions[0]?.FirstNameCond}
                                onChange={(event: any) => {
                                    let newObj = { ...data };
                                    let condition = { ...newObj.dynamicData.MyConditions[0] };
                                    condition.FirstNameCond = event.target.value.trim();
                                    newObj.dynamicData.MyConditions[0] = [...condition];

                                    onUpdate({ ...data, newObj });
                                }}
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
                        <InputLabel className={classes.fBlack}>{t('common.last_name')}:</InputLabel>
                        <TextField
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.LastName}
                            onChange={(event: any) => {
                                let newObj = { ...data };
                                let condition = { ...newObj.dynamicData.MyConditions[0] };
                                condition.LastName = event.target.value.trim();
                                newObj.dynamicData.MyConditions[0] = [...condition];

                                onUpdate({ ...data, newObj });
                            }}
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
                                value={data?.dynamicData.MyConditions[0]?.LastNameCond}
                                onChange={(event: any) => {
                                    let newObj = { ...data };
                                    let condition = { ...newObj.dynamicData.MyConditions[0] };
                                    condition.LastNameCond = event.target.value.trim();
                                    newObj.dynamicData.MyConditions[0] = [...condition];

                                    onUpdate({ ...data, newObj });
                                }}
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
                        <InputLabel className={classes.fBlack}>{t('common.email')}:</InputLabel>
                        <TextField
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Email}
                            onChange={(event: any) => {
                                let newObj = { ...data };
                                let condition = { ...newObj.dynamicData.MyConditions[0] };
                                condition.Email = event.target.value.trim();
                                newObj.dynamicData.MyConditions[0] = [...condition];

                                onUpdate({ ...data, newObj });
                            }}
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
                                value={data?.dynamicData.MyConditions[0]?.EmailCond}
                                onChange={(event: any) => {
                                    let newObj = { ...data };
                                    let condition = { ...newObj.dynamicData.MyConditions[0] };
                                    condition.EmailCond = event.target.value.trim();
                                    newObj.dynamicData.MyConditions[0] = [...condition];

                                    onUpdate({ ...data, newObj });
                                }}
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
                        <InputLabel className={classes.fBlack}>{t('common.telephone')}:</InputLabel>
                        <TextField
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Telephone}
                            onChange={(event: any) => {
                                let newObj = { ...data };
                                let condition = { ...newObj.dynamicData.MyConditions[0] };
                                condition.Telephone = event.target.value.trim();
                                newObj.dynamicData.MyConditions[0] = [...condition];

                                onUpdate({ ...data, newObj });
                            }}
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
                                value={data?.dynamicData.MyConditions[0]?.TelephoneCond}
                                onChange={(event: any) => {
                                    let newObj = { ...data };
                                    let condition = { ...newObj.dynamicData.MyConditions[0] };
                                    condition.TelephoneCond = event.target.value.trim();
                                    newObj.dynamicData.MyConditions[0] = [...condition];

                                    onUpdate({ ...data, newObj });
                                }}
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
                        <InputLabel className={classes.fBlack}>{t('common.cellphone')}:</InputLabel>
                        <TextField
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Cellphone}
                            onChange={(event: any) => {
                                let newObj = { ...data };
                                let condition = { ...newObj.dynamicData.MyConditions[0] };
                                condition.Cellphone = event.target.value.trim();
                                newObj.dynamicData.MyConditions[0] = [...condition];

                                onUpdate({ ...data, newObj });
                            }}
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
                                value={data?.dynamicData.MyConditions[0]?.CellphoneCond}
                                onChange={(event: any) => {
                                    let newObj = { ...data };
                                    let condition = { ...newObj.dynamicData.MyConditions[0] };
                                    condition.CellphoneCond = event.target.value.trim();
                                    newObj.dynamicData.MyConditions[0] = [...condition];

                                    onUpdate({ ...data, newObj });
                                }}
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
                        <InputLabel className={classes.fBlack}>{t('common.company')}:</InputLabel>
                        <TextField
                            variant='outlined'
                            size='small'
                            value={data?.dynamicData.MyConditions[0]?.Company}
                            onChange={(event: any) => {
                                let newObj = { ...data };
                                let condition = { ...newObj.dynamicData.MyConditions[0] };
                                condition.Company = event.target.value.trim();
                                newObj.dynamicData.MyConditions[0] = [...condition];

                                onUpdate({ ...data, newObj });
                            }}
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
                                value={data?.dynamicData.MyConditions[0]?.ComapnyCond}
                                onChange={(event: any) => {
                                    let newObj = { ...data };
                                    let condition = { ...newObj.dynamicData.MyConditions[0] };
                                    condition.ComapnyCond = event.target.value.trim();
                                    newObj.dynamicData.MyConditions[0] = [...condition];

                                    onUpdate({ ...data, newObj });
                                }}
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

export default PersonalDetails;