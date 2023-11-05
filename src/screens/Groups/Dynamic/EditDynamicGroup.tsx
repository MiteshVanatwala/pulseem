import { useDispatch, useSelector } from 'react-redux';
import { useState, memo, useEffect } from 'react';
import clsx from 'clsx';
import {
    Grid, TextField, FormControl, InputLabel, MenuItem, FormControlLabel, Checkbox, Tabs, Tab
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import moment from "moment";
import { DateField } from '../../../components/managment';
import { getGroups, getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import Groups from '../../Whatsapp/Campaign/Components/Groups/Groups';
import { TabContext, TabPanel } from '@material-ui/lab';
import { Loader } from '../../../components/Loader/Loader';
import { ActivityGroup, Conditions } from '../../../Models/Groups/DynamicGroup';

const EditDynamicGroup = ({ classes, Data }: any) => {
    const dispatch: any = useDispatch();
    const { t } = useTranslation();
    // const { isRTL, windowSize } = useSelector(
    //     (state: { core: any }) => state.core
    // );
    const { subAccountAllGroups } = useSelector((state: any) => state.group);
    const { testGroups } = useSelector((state: any) => state.sms);
    const [showLoader, setLoader] = useState(true);
    const [dynamicGroupModel, setDynamicGroupModel] = useState(null);
    const [tabValue, setTabValue] = useState('0');
    const [selectedGroups, setSelectedGroups] = useState<any>([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);
    const [showTestGroups, setShowTestGroups] = useState(false);

    const getData = async () => {
        setLoader(true);
        setLoader(false);
        if (subAccountAllGroups.length === 0) {
            dispatch(getGroupsBySubAccountId());
        }
    };

    useEffect(() => {
        getData();
        if(subAccountAllGroups)
        {
            setDynamicGroupModel(Data);
        }
    }, [subAccountAllGroups]);

    useEffect(() => {
        const selectedgroupsList = [] as any;
        Data?.dynamicData?.MyGroups.forEach((gl: number) => {
            const exist = subAccountAllGroups?.filter(g => { return g.GroupID === gl });
            if (exist && exist.length > 0) {
                selectedgroupsList.push(exist[0]);
            }
        });

        setSelectedGroups(selectedgroupsList);
    }, [dynamicGroupModel])

    const getPersonalDetails = () => {
        return (
            <Grid container className={clsx(classes.pt25)}>
                <Grid item xs={4} sm={4} md={4}>
                    <Grid container>
                        <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                            <InputLabel className={classes.fBlack}>{t('common.first_name')}:</InputLabel>
                            <TextField
                                variant='outlined'
                                size='small'
                                // value={searchRules.firstName.value}
                                value={dynamicGroupModel?.dynamicData?.MyConditions[0]?.FirstName}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel?.dynamicData?.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { FirstName: event.target.value.trim() } as Conditions
                                        ]
                                    })
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.FirstNameCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel.dynamicData,
                                            MyConditions: [conditions[0],
                                            { FirstNameCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
                                    }
                                    }
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.LastName}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel.dynamicData,
                                        MyConditions: [conditions[0],
                                        { LastName: event.target.value.trim() } as Conditions
                                        ]
                                    })
                                }
                                }
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.LastNameCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { LastNameCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
                                    }
                                    }
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.Email}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { Email: event.target.value.trim() } as Conditions
                                        ]
                                    })
                                }
                                }
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.EmailCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { EmailCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
                                    }
                                    }
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.Telephone}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { Telephone: event.target.value.trim() } as Conditions
                                        ]
                                    })
                                }
                                }
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.TelephoneCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { TelephoneCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.Cellphone}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { Cellphone: event.target.value.trim() } as Conditions
                                        ]
                                    })
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.CellphoneCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { CellphoneCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.Company}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { Company: event.target.value.trim() } as Conditions
                                        ]
                                    })
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.ComapnyCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { ComapnyCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    const getLocationDetails = () => {
        return (
            <Grid container className={classes.pt25}>
                <Grid item xs={8} sm={8} md={8}>
                    <Grid container>
                        <Grid item xs={10} sm={10} md={10} className={clsx(classes.p10)}>
                            <InputLabel className={classes.fBlack}>{t('common.address')}:</InputLabel>
                            <TextField
                                variant='outlined'
                                size='small'
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.Address}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { Address: event.target.value.trim() } as Conditions
                                        ]
                                    })
                                }}
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.AddressCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { AddressCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.Country}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { Country: event.target.value.trim() } as Conditions
                                        ]
                                    })
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.CountryCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { CountryCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.State}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { State: event.target.value.trim() } as Conditions
                                        ]
                                    })
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.StateCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { StateCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.City}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { City: event.target.value.trim() } as Conditions
                                        ]
                                    })
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.CityCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { CityCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
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
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.Zip}
                                onChange={(event: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { Zip: event.target.value.trim() } as Conditions
                                        ]
                                    })
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
                                    value={dynamicGroupModel.dynamicData?.MyConditions[0]?.ZipCond}
                                    onChange={(event: any) => {
                                        const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                        setDynamicGroupModel({
                                            ...dynamicGroupModel,
                                            MyConditions: [conditions[0],
                                            { ZipCond: event.target.value.trim() } as Conditions
                                            ]
                                        })
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
                                    <MenuItem value={0}>{t('common.equal')}</MenuItem>
                                    <MenuItem value={1}>{t('common.like')}</MenuItem>
                                    <MenuItem value={2}>{t('common.notEqual')}</MenuItem>
                                    <MenuItem value={3}>{t('common.startsWith')}</MenuItem>
                                    <MenuItem value={4}>{t('common.startsWith')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    const getDateDetails = () => {
        return (
            <Grid container className={classes.pt25}>
                <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.birthdayFrom')}:</InputLabel>
                    <Grid container spacing={3} className={clsx(classes.pt25)}>
                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.BirthDateFrom}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { BirthDateFrom: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.FromDate')}
                                timePickerOpen={true}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>

                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.BirthDateTo}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { BirthDateTo: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.ToDate')}
                                timePickerOpen={false}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.birthdayWithoutYear')}:</InputLabel>
                    <Grid container spacing={3} className={clsx(classes.pt25)}>
                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.BirthDateFromWithoutYear}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { BirthDateFromWithoutYear: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.FromDate')}
                                timePickerOpen={true}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>

                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.BirthDateToWithoutYear}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { BirthDateToWithoutYear: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.ToDate')}
                                timePickerOpen={false}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.reminderFrom')}:</InputLabel>
                    <Grid container spacing={3} className={clsx(classes.pt25)}>
                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.BirthDateFromWithoutYear}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { BirthDateFromWithoutYear: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.FromDate')}
                                timePickerOpen={true}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>

                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.BirthDateToWithoutYear}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { BirthDateToWithoutYear: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.ToDate')}
                                timePickerOpen={false}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.createFrom')}:</InputLabel>
                    <Grid container spacing={3} className={clsx(classes.pt25)}>
                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.CreatedFrom}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { CreatedFrom: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.FromDate')}
                                timePickerOpen={true}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>

                        <Grid item xs={6} sm={6} md={6}>
                            <DateField
                                minDate={moment()}
                                maximumDate={moment().add(100, 'y')}
                                classes={classes}
                                value={dynamicGroupModel.dynamicData?.MyConditions[0]?.CreatedTo}
                                onChange={(value: any) => {
                                    const conditions = [...dynamicGroupModel.dynamicData.MyConditions];
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyConditions: [conditions[0],
                                        { CreatedTo: value } as Conditions
                                        ]
                                    })
                                }}
                                placeholder={t('common.ToDate')}
                                timePickerOpen={false}
                                dateActive={true}
                                onTimeChange={() => { }}
                                timeActive={false}
                                buttons={[]}
                                removePadding={true}
                                hideInvalidDateMessage={true}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    const getActivityLevelDetails = () => {
        return (
            <Grid container spacing={4} className={classes.pt25}>
                <Grid item xs={6} sm={3} md={3}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={(event: any) => {
                                    const activities = { ...dynamicGroupModel.dynamicData.MyActivities };
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyActivities: { ...activities, IsOpened: !!event.target.checked } as ActivityGroup
                                    })
                                }}
                                checked={!!dynamicGroupModel.dynamicData?.MyActivities?.IsOpened}
                                name="openedinlast"
                                color="primary"
                            />
                        }
                        label={t('common.isOpenedInTheLast')}
                        className={clsx(classes.pt5, classes.floatRight)}
                    />
                </Grid>
                <Grid item xs={6} sm={3} md={3}>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl, classes.w50)}
                    >
                        <Select
                            variant='standard'
                            value={dynamicGroupModel.dynamicData?.MyActivities.IsOpenedInterval}
                            onChange={(event: any) => {
                                const activities = { ...dynamicGroupModel.dynamicData.MyActivities };
                                setDynamicGroupModel({
                                    ...dynamicGroupModel,
                                    MyActivities: { ...activities, IsOpenedInterval: event.target.value } as ActivityGroup
                                })
                            }}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            className={clsx(classes.w100, classes.mt10)}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            <MenuItem value={0}>{t('common.lastWeek')}</MenuItem>
                            <MenuItem value={1}>{t('common.last2Weeks')}</MenuItem>
                            <MenuItem value={2}>{t('common.lastMonth')}</MenuItem>
                            <MenuItem value={3}>{t('common.last3Months')}</MenuItem>
                            <MenuItem value={4}>{t('common.last6Months')}</MenuItem>
                            <MenuItem value={5}>{t('common.lastYear')}</MenuItem>
                            <MenuItem value={6}>{t('common.specificDates')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={6} sm={3} md={3} className={classes.pt5}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!!dynamicGroupModel.dynamicData?.MyActivities.IsNotOpened}
                                onChange={(event: any) => {
                                    const activities = { ...dynamicGroupModel.dynamicData.MyActivities };
                                    setDynamicGroupModel({
                                        ...dynamicGroupModel,
                                        MyActivities: { ...activities, IsNotOpened: !!event.target.checked } as ActivityGroup
                                    })
                                }}
                                name="notopenedinlast"
                                color="primary"
                            />
                        }
                        label={t('common.isNotOpenedInTheLast')}
                        className={clsx(classes.pt5, classes.floatRight)}
                    />
                </Grid>
                <Grid item xs={6} sm={3} md={3}>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl, classes.w50)}
                    >
                        <Select
                            variant='standard'
                            value={dynamicGroupModel.dynamicData?.MyActivities.IsNotOpenedInterval}
                            onChange={(event: any) => {
                                const activities = { ...dynamicGroupModel.dynamicData.MyActivities };
                                setDynamicGroupModel({
                                    ...dynamicGroupModel,
                                    MyActivities: { ...activities, IsNotOpenedInterval: event.target.value } as ActivityGroup
                                })
                            }}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            className={clsx(classes.w100, classes.mt10)}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            <MenuItem value={0}>{t('common.lastWeek')}</MenuItem>
                            <MenuItem value={1}>{t('common.last2Weeks')}</MenuItem>
                            <MenuItem value={2}>{t('common.lastMonth')}</MenuItem>
                            <MenuItem value={3}>{t('common.last3Months')}</MenuItem>
                            <MenuItem value={4}>{t('common.last6Months')}</MenuItem>
                            <MenuItem value={5}>{t('common.lastYear')}</MenuItem>
                            <MenuItem value={6}>{t('common.specificDates')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        )
    }

    const callbackUpdateGroups = (groups: any | never) => {
        // setSelectedGroups(groups) as any;
        const found = selectedGroups.map((group: any) => { return group.GroupID; }).includes(groups.GroupID);
        if (found) {
            setSelectedGroups(selectedGroups.filter((g: any) => g.GroupID !== groups.GroupID));
        } else {
            setSelectedGroups([...selectedGroups, groups]);
        }
    }
    const callbackSelectAll = () => {
        if (!allGroupsSelected) {
            if (showTestGroups) {
                setSelectedGroups([...testGroups, ...subAccountAllGroups]);
            }
            else {
                setSelectedGroups([...subAccountAllGroups]);
            }
        } else {
            setSelectedGroups([]);
        }
        setAllGroupsSelected(!allGroupsSelected);
    }

    const callbackShowTextGroups = async (showTestGroups: boolean) => {
        if (!showTestGroups && testGroups.length > 0) {
            setShowTestGroups(true);
        }
        else {
            setShowTestGroups(false);
        }
    }

    const callbackSelectedGroups = (group: any) => {
        const found = selectedGroups.map((group: any) => { return group.GroupID }).includes(group.GroupID)
        if (found) {
            setSelectedGroups(selectedGroups.filter((g: any) => g.GroupID !== group.GroupID))
        } else {
            setSelectedGroups([...selectedGroups, group])
        }
    }

    // const getGroupsDetails = () => {
    //     return (
    //         <div className={clsx(classes.fullWidth, classes.pt25)}>
    //             <Groups
    //                 classes={classes}
    //                 list={
    //                     showTestGroups
    //                         ? [...subAccountAllGroups, ...testGroups]
    //                         : [...subAccountAllGroups]
    //                 }
    //                 showTestGroups={showTestGroups}
    //                 selectedList={selectedGroups}
    //                 callbackSelectedGroups={callbackUpdateGroups}
    //                 callbackUpdateGroups={() => { }} //onUpdateGroups
    //                 callbackSelectAll={callbackSelectAll}
    //                 callbackReciFilter={() => { }} // onReciFilter
    //                 callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
    //                 uniqueKey={'groups_1'}
    //                 innerHeight={325}
    //                 showSortBy={true}
    //                 showFilter={false}
    //                 showSelectAll={true}
    //             />
    //         </div>
    //     )
    // }

    const getSystemDetails = () => {
        return (
            <Grid container className={classes.pt25}>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.updateGroupRecipientsEvery')}:</InputLabel>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl, classes.w50)}
                    >
                        <Select
                            variant='standard'
                            value={dynamicGroupModel?.Group?.DynamicUpdatePolicy}
                            onChange={(event: any) => {
                                setDynamicGroupModel({
                                    ...dynamicGroupModel.Group,
                                    Groups: { DynamicUpdatePolicy: event.target.value } as any
                                })
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
                            <MenuItem value={0}>{t('common.daily2AM')}</MenuItem>
                            <MenuItem value={1}>{t('common.weekly2AM')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.UpdatedOn')}:</InputLabel>
                    <div className={clsx(classes.pt10)}>
                        {dynamicGroupModel?.Group?.DynamicLastUpdate}
                    </div>
                </Grid>
                <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                    <InputLabel className={classes.fBlack}>{t('common.numberOfClientsInGroup')}:</InputLabel>
                    <div className={clsx(classes.pt10)}>
                        {dynamicGroupModel?.Group?.Recipients}
                    </div>
                </Grid>
            </Grid>
        )
    }

    return (
        <>
            <Loader isOpen={showLoader || dynamicGroupModel === null} />
            {dynamicGroupModel && <><Tabs
                value={tabValue}
                onChange={(e, value) => setTabValue(value)}
                className={clsx(classes.mr15, classes.ml15)}
                classes={{ indicator: classes.hideIndicator }}
            >
                <Tab
                    label={t('common.PersonalDetails')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='0'
                />

                <Tab
                    label={t('common.Location')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='1'
                />

                <Tab
                    label={t('common.Dates')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='2'
                />

                <Tab
                    label={t('common.ActivityLevel')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='3'
                />

                <Tab
                    label={t('common.Groups')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='4'
                />

                <Tab
                    label={t('common.systemDetails')}
                    classes={{ root: classes.tabText, selected: classes.activeTab }}
                    className={classes.iconTab}
                    value='5'
                />
            </Tabs>

                <TabContext value={`${tabValue}`}>
                    <TabPanel value='0'>
                        {getPersonalDetails()}
                    </TabPanel>

                    <TabPanel value='1'>
                        {getLocationDetails()}
                    </TabPanel>

                    <TabPanel value='2'>
                        {getDateDetails()}
                    </TabPanel>

                    <TabPanel value='3'>
                        {getActivityLevelDetails()}
                    </TabPanel>

                    <TabPanel value='4'>
                        <div className={clsx(classes.fullWidth, classes.pt25)}>
                            <Groups
                                classes={classes}
                                list={
                                    showTestGroups
                                        ? [...subAccountAllGroups, ...testGroups]
                                        : [...subAccountAllGroups]
                                }
                                showTestGroups={showTestGroups}
                                selectedList={selectedGroups}
                                callbackSelectedGroups={callbackUpdateGroups}
                                callbackUpdateGroups={() => { }} //onUpdateGroups
                                callbackSelectAll={callbackSelectAll}
                                callbackReciFilter={() => { }} // onReciFilter
                                callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
                                uniqueKey={'groups_4'}
                                innerHeight={325}
                                showSortBy={true}
                                showFilter={false}
                                showSelectAll={true}
                            />
                        </div>
                    </TabPanel>

                    <TabPanel value='5'>
                        {getSystemDetails()}
                    </TabPanel>
                </TabContext>
            </>
            }
        </>
    )
}

export default memo(EditDynamicGroup);