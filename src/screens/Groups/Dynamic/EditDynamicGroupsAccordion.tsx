import { useDispatch, useSelector } from 'react-redux';
import { useState, memo, useEffect } from 'react';
import clsx from 'clsx';
import {
    Box, Typography, Grid, TextField, Accordion, AccordionSummary, AccordionDetails, FormControl, InputLabel, MenuItem, FormControlLabel, Checkbox
} from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { GrFormAdd, GrFormSubtract } from 'react-icons/gr';
import GroupTags from '../../../components/Groups/GroupTags';
import moment from "moment";
import { DateField } from '../../../components/managment';
import { getGroups, getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';

const DynamicGroups = ({ classes }: any) => {
    const dispatch: any = useDispatch();
    const { t } = useTranslation();
    const { isRTL, windowSize } = useSelector(
        (state: { core: any }) => state.core
    );
    const { groupData, subAccountAllGroups } = useSelector((state: any) => state.group);
    const [showLoader, setLoader] = useState(true);
    const [expandedIndexes, setExpandedIndexes] = useState([1,2,3,4,5,6]);
    const [ searchRules, setSearchRules ] = useState({
        firstName: {value: '', operator: 1},
        lastName: {value: '', operator: 1},
        email: {value: '', operator: 1},
        telephone: {value: '', operator: 1},
        cellphone: {value: '', operator: 1},
        company: {value: '', operator: 1},
        address: {value: '', operator: 1},
        country: {value: '', operator: 1},
        state: {value: '', operator: 1},
        city: {value: '', operator: 1},
        zipcode: {value: '', operator: 1},
        birthdayFromStartDate: '',
        birthdayFromEndDate: '',
        birthdayWithoutYearStartDate: '',
        birthdayWithoutYearEndDate: '',
        reminderFromStartDate: '',
        reminderFromEndDate: '',
        createFromStartDate: '',
        createFromEndDate: '',
        isOpenedInLast: false,
        isOpenedInLastTime: 0,
        isNotOpenedInLast: false,
        isNotOpenedInLastTime: 0,
        groups: [],
        updateGroupRecipientsEvery: 0,
        lastUpdated: '',
        numberOfClientsInGroup: 0,
    })

    const getData = async () => {
        setLoader(true);
        // @ts-ignore
        await dispatch(getGroups({
            PageIndex: 1,
            PageSize: 1000,
            SearchTerm: '',
        }));
        setLoader(false);
        if (subAccountAllGroups.length === 0) {
            dispatch(getGroupsBySubAccountId());
        }
    };

    useEffect(() => {
        getData();
    }, []);
    
    const getPersonalDetails = () => {
        return (
            <Accordion expanded={expandedIndexes.indexOf(1) !== -1}>
                <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    expandIcon={expandedIndexes.indexOf(1) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
                    onClick={() => setExpandedIndexes(expandedIndexes.indexOf(1) === -1 ? expandedIndexes.concat(1) : expandedIndexes.filter(item => item !== 1))}
                    className={classes.greyBackground}
                >
                    <Typography className={clsx(classes.fBlack, classes.bold)}>{t('common.PersonalDetails')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Grid item xs={4} sm={4} md={4}>
                            <Grid container>
                                <Grid item xs={8} sm={8} md={8} className={clsx(classes.p10)}>
                                    <InputLabel className={classes.fBlack}>{t('common.first_name')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.firstName.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                firstName: {
                                                    ...searchRules.firstName,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.firstName.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    firstName: {
                                                        ...searchRules.firstName,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                        value={searchRules.lastName.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                lastName: {
                                                    ...searchRules.lastName,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.lastName.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    lastName: {
                                                        ...searchRules.lastName,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                        value={searchRules.email.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                email: {
                                                    ...searchRules.email,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.email.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    email: {
                                                        ...searchRules.email,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                        value={searchRules.telephone.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                telephone: {
                                                    ...searchRules.telephone,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.telephone.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    telephone: {
                                                        ...searchRules.telephone,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                    <InputLabel className={classes.fBlack}>{t('common.cellphone')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.cellphone.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                cellphone: {
                                                    ...searchRules.cellphone,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.cellphone.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    cellphone: {
                                                        ...searchRules.cellphone,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                    <InputLabel className={classes.fBlack}>{t('common.company')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.company.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                company: {
                                                    ...searchRules.company,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.company.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    company: {
                                                        ...searchRules.company,
                                                        operator: event.target.value
                                                    }
                                                })
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
                    </Grid>
                </AccordionDetails>
            </Accordion>
        )
    }

    const getLocationDetails = () => {
        return (
            <Accordion expanded={expandedIndexes.indexOf(2) !== -1}>
                <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    expandIcon={expandedIndexes.indexOf(2) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
                    onClick={() => setExpandedIndexes(expandedIndexes.indexOf(2) === -1 ? expandedIndexes.concat(2) : expandedIndexes.filter(item => item !== 2))}
                    className={classes.greyBackground}
                >
                    <Typography className={clsx(classes.fBlack, classes.bold)}>{t('common.Location')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Grid item xs={8} sm={8} md={8}>
                            <Grid container>
                                <Grid item xs={10} sm={10} md={10} className={clsx(classes.p10)}>
                                    <InputLabel className={classes.fBlack}>{t('common.address')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.address.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                address: {
                                                    ...searchRules.address,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.address.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    address: {
                                                        ...searchRules.address,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                    <InputLabel className={classes.fBlack}>{t('common.country')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.country.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                country: {
                                                    ...searchRules.country,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.country.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    country: {
                                                        ...searchRules.country,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                    <InputLabel className={classes.fBlack}>{t('common.state')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.state.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                state: {
                                                    ...searchRules.state,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.state.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    state: {
                                                        ...searchRules.state,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                    <InputLabel className={classes.fBlack}>{t('common.city')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.city.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                city: {
                                                    ...searchRules.city,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.city.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    city: {
                                                        ...searchRules.city,
                                                        operator: event.target.value
                                                    }
                                                })
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
                                    <InputLabel className={classes.fBlack}>{t('common.zip')}:</InputLabel>
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={searchRules.zipcode.value}
                                        onChange={(e) => {
                                            setSearchRules({
                                                ...searchRules,
                                                zipcode: {
                                                    ...searchRules.zipcode,
                                                    value: e.target.value.trim()
                                                }
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
                                            value={searchRules.zipcode.operator}
                                            onChange={(event: any) => 
                                                setSearchRules({
                                                    ...searchRules,
                                                    zipcode: {
                                                        ...searchRules.zipcode,
                                                        operator: event.target.value
                                                    }
                                                })
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
                    </Grid>
                </AccordionDetails>
            </Accordion>
        )
    }

    const getDateDetails = () => {
        return (
            <Accordion  expanded={expandedIndexes.indexOf(3) !== -1}>
                <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    expandIcon={expandedIndexes.indexOf(3) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
                    onClick={() => setExpandedIndexes(expandedIndexes.indexOf(3) === -1 ? expandedIndexes.concat(3) : expandedIndexes.filter(item => item !== 3))}
                    className={classes.greyBackground}
                >
                    <Typography className={clsx(classes.fBlack, classes.bold)}>{t('common.Dates')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Grid item xs={6} sm={6} md={6} className={clsx(classes.p10)}>
                            <InputLabel className={classes.fBlack}>{t('common.birthdayFrom')}:</InputLabel>
                            <Grid container spacing={3} className={clsx(classes.pt25)}>
                                <Grid item xs={6} sm={6} md={6}>
                                    <DateField
                                        minDate={moment()}
                                        maximumDate={moment().add(100, 'y')}
                                        classes={classes}
                                        value={searchRules.birthdayFromStartDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                birthdayFromStartDate: value
                                            })
                                        }}
                                        placeholder={t('common.FromDate')}
                                        timePickerOpen={true}
                                        dateActive={true}
                                        onTimeChange={() => {}}
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
                                        value={searchRules.birthdayFromEndDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                birthdayFromEndDate: value
                                            })
                                        }}
                                        placeholder={t('common.ToDate')}
                                        timePickerOpen={false}
                                        dateActive={true}
                                        onTimeChange={() => {}}
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
                                        value={searchRules.birthdayWithoutYearStartDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                birthdayWithoutYearStartDate: value
                                            })
                                        }}
                                        placeholder={t('common.FromDate')}
                                        timePickerOpen={true}
                                        dateActive={true}
                                        onTimeChange={() => {}}
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
                                        value={searchRules.birthdayWithoutYearEndDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                birthdayWithoutYearEndDate: value
                                            })
                                        }}
                                        placeholder={t('common.ToDate')}
                                        timePickerOpen={false}
                                        dateActive={true}
                                        onTimeChange={() => {}}
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
                                        value={searchRules.birthdayWithoutYearStartDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                birthdayWithoutYearStartDate: value
                                            })
                                        }}
                                        placeholder={t('common.FromDate')}
                                        timePickerOpen={true}
                                        dateActive={true}
                                        onTimeChange={() => {}}
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
                                        value={searchRules.birthdayWithoutYearEndDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                birthdayWithoutYearEndDate: value
                                            })
                                        }}
                                        placeholder={t('common.ToDate')}
                                        timePickerOpen={false}
                                        dateActive={true}
                                        onTimeChange={() => {}}
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
                                        value={searchRules.createFromStartDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                createFromStartDate: value
                                            })
                                        }}
                                        placeholder={t('common.FromDate')}
                                        timePickerOpen={true}
                                        dateActive={true}
                                        onTimeChange={() => {}}
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
                                        value={searchRules.createFromEndDate}
                                        onChange={(value: any) => {
                                            setSearchRules({
                                                ...searchRules,
                                                createFromEndDate: value
                                            })
                                        }}
                                        placeholder={t('common.ToDate')}
                                        timePickerOpen={false}
                                        dateActive={true}
                                        onTimeChange={() => {}}
                                        timeActive={false}
                                        buttons={[]}    
                                        removePadding={true}
                                        hideInvalidDateMessage={true}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        )
    }

    const getActivityLevelDetails = () => {
        return (
            <Accordion  expanded={expandedIndexes.indexOf(4) !== -1}>
                <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    expandIcon={expandedIndexes.indexOf(4) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
                    onClick={() => setExpandedIndexes(expandedIndexes.indexOf(4) === -1 ? expandedIndexes.concat(4) : expandedIndexes.filter(item => item !== 4))}
                    className={classes.greyBackground}
                >
                    <Typography className={clsx(classes.fBlack, classes.bold)}>{t('common.ActivityLevel')}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.pt10}>
                    <Grid container spacing={4}>
                        <Grid item xs={6} sm={3} md={3}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!searchRules.isOpenedInLast}
                                        onChange={(event) =>
                                            setSearchRules({
                                                ...searchRules,
                                                isOpenedInLast: !!event.target.checked
                                            })
                                        }
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
                                    value={searchRules.isOpenedInLastTime}
                                    onChange={(event: any) => 
                                        setSearchRules({
                                            ...searchRules,
                                            isOpenedInLastTime: event.target.value
                                        })
                                    }
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
                                        checked={!!searchRules.isNotOpenedInLast}
                                        onChange={(event) =>
                                            setSearchRules({
                                                ...searchRules,
                                                isNotOpenedInLast: !!event.target.checked
                                            })
                                        }
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
                                    value={searchRules.isNotOpenedInLastTime}
                                    onChange={(event: any) => 
                                        setSearchRules({
                                            ...searchRules,
                                            isNotOpenedInLastTime: event.target.value
                                        })
                                    }
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
                </AccordionDetails>
            </Accordion>
        )
    }

    const getGroupsDetails = () => {
        return (
            <Accordion  expanded={expandedIndexes.indexOf(5) !== -1}>
                <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    expandIcon={expandedIndexes.indexOf(5) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
                    onClick={() => setExpandedIndexes(expandedIndexes.indexOf(5) === -1 ? expandedIndexes.concat(5) : expandedIndexes.filter(item => item !== 5))}
                    className={classes.greyBackground}
                >
                    <Typography className={clsx(classes.fBlack, classes.bold)}>{t('common.Groups')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={clsx(classes.fullWidth, classes.pt10)}>
                        <GroupTags
                            classes={classes}
                            title={'siteTracking.typeGroupName'}
                            // @ts-ignore
                            style={{ width: windowSize === 'xs' ? 320 : 460 }}
                            dropdown
                            //@ts-ignore
                            dropDownProps={{
                                //@ts-ignore
                                onChange: (e: any, val: any, reason: string, details: any) => {
                                    if (reason === "remove-option" || val.length === 0) {
                                        setSearchRules({
                                            ...searchRules,
                                            groups: []
                                        });
                                    }
                                    const idArr = val.reduce((prevVal: any, newVal: any) => [...prevVal, newVal.GroupID], [])
                                    setSearchRules({
                                        ...searchRules,
                                        groups: idArr
                                    });
                                },
                                selectedGroups: searchRules.groups
                            }}
                        />
                    </div>
                </AccordionDetails>
            </Accordion>
        )
    }

    const getSystemDetails = () => {
        return (
            <Accordion  expanded={expandedIndexes.indexOf(6) !== -1}>
                <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    expandIcon={expandedIndexes.indexOf(6) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
                    onClick={() => setExpandedIndexes(expandedIndexes.indexOf(6) === -1 ? expandedIndexes.concat(6) : expandedIndexes.filter(item => item !== 6))}
                    className={classes.greyBackground}
                >
                    <Typography className={clsx(classes.fBlack, classes.bold)}>{t('common.systemDetails')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                            <InputLabel className={classes.fBlack}>{t('common.updateGroupRecipientsEvery')}:</InputLabel>
                                <FormControl
                                    variant="standard"
                                    className={clsx(classes.selectInputFormControl, classes.w50)}
                                >
                                    <Select
                                        variant='standard'
                                        value={searchRules.updateGroupRecipientsEvery}
                                        onChange={(event: any) => 
                                            setSearchRules({
                                                ...searchRules,
                                                updateGroupRecipientsEvery: event.target.value
                                            })
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
                                        <MenuItem value={0}>{t('common.daily2AM')}</MenuItem>
                                        <MenuItem value={1}>{t('common.weekly2AM')}</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                            <InputLabel className={classes.fBlack}>{t('common.UpdatedOn')}:</InputLabel>
                            <div className={clsx(classes.pt10)}>
                                {searchRules.lastUpdated}
                            </div>
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                            <InputLabel className={classes.fBlack}>{t('common.numberOfClientsInGroup')}:</InputLabel>
                            <div className={clsx(classes.pt10)}>
                                {searchRules.numberOfClientsInGroup}
                            </div>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        )
    }

    return (
        <>
            {getPersonalDetails()}
            {getLocationDetails()}
            {getDateDetails()}
            {getActivityLevelDetails()}
            {getGroupsDetails()}
            {getSystemDetails()}
        </>
    )
}

export default memo(DynamicGroups);