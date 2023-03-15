import clsx from 'clsx';
import 'moment/locale/he';
import moment from 'moment';
import { HtmlHTMLAttributes, useEffect, useState } from "react";
import { FormControl, Box, Link, Grid, Button, TextField, makeStyles } from '@material-ui/core'
import { coreProps } from '../../../model/Core/corePros.types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { CalendarIcon, SearchIcon } from '../../../assets/images/managment/index'
import ClearIcon from '@material-ui/icons/Clear';
import { Autocomplete } from '@mui/material';


const useStyles = makeStyles({
    dBlock: {
        display: 'block',
        paddingTop: 5
    },
    padding11: {
        padding: 11
    }
})

type RequestObject = {
    Text: string,
    PageSize: Number,
    PageIndex: Number,
    ToNumber: string,
    IsExport: Boolean,
    FromNumber: String,
    TextMessage: String
    ToDate: string | null,
    FromDate: string | null,
    CampaignID: string | null
}

interface SearchObject {
    classes: any,
    currentPage: Number,
    onFilterRequest: Function,
    onSetPage: Function,
    onSetIsSearching: Function,
    showAutoCompleteForm: boolean
}

const SearchLine = ({
    classes,
    currentPage,
    onFilterRequest,
    onSetPage,
    onSetIsSearching,
    showAutoCompleteForm
}: SearchObject) => {
    const { t: translator } = useTranslation();
    const localClasses = useStyles();

    const priorDate = moment().subtract(30, 'days').utcOffset(0).format('YYYY-MM-DD HH:mm').toString();

    const defaultsDates = {
        from: priorDate,
        to: moment({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm')
    }

    const DEFAULT_REQUEST: RequestObject = {
        FromDate: defaultsDates.from,
        ToDate: defaultsDates.to.toString(),
        FromNumber: '',
        ToNumber: '',
        TextMessage: '',
        Text: '',
        PageIndex: currentPage,
        PageSize: 6,
        IsExport: false,
        CampaignID: null
    };

    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [request, setRequest] = useState<RequestObject>(DEFAULT_REQUEST);
    const [searchRequest, setSearchRequest] = useState<RequestObject>(DEFAULT_REQUEST);
    const [isFromDatePickerOpen, setIsFromDatePickerOpen] = useState<boolean | undefined>(false);
    const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean | undefined>(false);
    const [advanceSearch, setAdvanceSearch] = useState<boolean | undefined>(false);
    const { finishedCampaigns } = useSelector((state: { sms: any }) => state.sms);
    const [autoCompleteKey, setAutoCompleteKey] = useState<number>(0);
    const [autoCompleteOptions, setAutoCompleteOptions] = useState<any>(null);

    const { windowSize, isRTL } = useSelector(
        (state: { core: coreProps }) => state.core
    );

    useEffect(() => {
        if (!isSearching) {
            setSearchRequest(DEFAULT_REQUEST);
        }
    }, [isSearching]);

    useEffect(() => {
        const campaigns = finishedCampaigns.map((item: any, idx: number) => {
            return { Name: item.Name, CampaignID: item.SMSCampaignID, key: idx }
        });
        setAutoCompleteOptions(campaigns.slice(0, 200));
    }, [finishedCampaigns]);

    const handleFromDate = (val: string | null | undefined) => {
        if (val) {
            let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm');
            setSearchRequest({ ...searchRequest, FromDate: dateVal });
        }
    }

    const handleToDate = (val: string | null | undefined) => {
        if (val) {
            let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm');
            setSearchRequest({ ...searchRequest, ToDate: dateVal });
        }
    }

    const renderDateFields = () => {
        return (
            <>
                {showAutoCompleteForm && <Grid item>
                    <FormControl variant="outlined" className={clsx(classes.formControl, classes.smsReplies)} style={{ width: '100%' }}>
                        <Autocomplete
                            disableListWrap
                            key={autoCompleteKey}
                            id='searchByCampaign'
                            getOptionLabel={(option: Partial<any>) => option.Name ?? ''}
                            noOptionsText={translator("campaigns.newsLetterEditor.errors.CampaignNotFound")}
                            clearOnBlur={false}
                            options={autoCompleteOptions}
                            renderOption={renderOptions}
                            onChange={(option: any, selected: any) => {
                                setSearchRequest({
                                    ...searchRequest, PageIndex: 1,
                                    CampaignID: selected?.CampaignID
                                });
                            }}
                            disableClearable={false}
                            onInputChange={(e: any, searchTerm: any) => {
                                if (searchTerm === '') {
                                    setAutoCompleteOptions(finishedCampaigns.slice(0, 200));
                                }
                            }}
                            renderInput={(params) => {
                                return (<TextField
                                    {...params}
                                    onChange={(e: any) => {
                                        if (e.target.value !== '') {
                                            const campaigns = finishedCampaigns.map((item: any, idx: number) => {
                                                return { Name: item.Name, CampaignID: item.SMSCampaignID, key: idx }
                                            });
                                            const filtered = campaigns.filter((cmp: any) => { return cmp.Name.indexOf(e.target.value) > -1 })
                                            setAutoCompleteOptions(filtered);
                                        }
                                        else {
                                            setAutoCompleteOptions(finishedCampaigns.slice(0, 200));
                                        }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        placeholder: translator('common.searchByCampaign'),

                                    }}
                                    style={{
                                        width: 240,
                                    }}
                                    variant="outlined" />)
                            }}
                        />
                    </FormControl>
                </Grid>}
                {dateFields()}
                {windowSize !== 'xs' && <Grid item>
                    <TextField
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        type="tel"
                        variant='outlined'
                        size='small'
                        value={searchRequest.FromNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={translator('common.FrmNumber')}
                    />
                </Grid>
                }
            </>
        )
    }
    const dateFields = () => {
        return <>
            <Grid item>
                <KeyboardDatePicker
                    inputVariant='outlined'
                    className={clsx(classes.textField,
                        classes.NoPaddingtextField
                    )}
                    inputProps={{
                        className: clsx(classes.datePickerInput, localClasses.padding11)
                    }}
                    variant='inline'
                    keyboardIcon={<CalendarIcon />}
                    format={'DD/MM/YYYY'}
                    placeholder={translator(
                        'mms.locFromDateResource1.Text'
                    )}
                    initialFocusedDate={moment()}
                    value={searchRequest?.FromDate}
                    onChange={(date: any, value?: string | null | undefined) => {
                        handleFromDate(date)
                    }}
                    onClose={() => setIsFromDatePickerOpen(false)}
                    open={isFromDatePickerOpen}
                    onClick={() => setIsFromDatePickerOpen(true)}
                    autoOk={true}
                />
            </Grid>
            <Grid item>
                <KeyboardDatePicker
                    inputVariant='outlined'
                    className={clsx(
                        classes.textField,
                        classes.NoPaddingtextField
                    )}
                    inputProps={{
                        className: clsx(classes.datePickerInput, localClasses.padding11)
                    }}
                    minDate={searchRequest?.FromDate}
                    variant='inline'
                    keyboardIcon={<CalendarIcon />}
                    format={'DD/MM/YYYY'}
                    placeholder={translator('mms.locToDateResource1.Text')}
                    initialFocusedDate={moment()}
                    value={searchRequest?.ToDate}
                    onChange={(date: any, value?: string | null | undefined) => {
                        handleToDate(date)
                    }}
                    onClose={() => setIsToDatePickerOpen(false)}
                    open={isToDatePickerOpen}
                    onClick={() => setIsToDatePickerOpen(true)}
                    autoOk={true}
                />
            </Grid>
        </>
    }
    const renderAdvanceSearch = () => {
        return (
            <>
                <Grid item>
                    <TextField
                        type="tel"
                        variant='outlined'
                        size='small'
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        value={searchRequest.FromNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={translator('common.FrmNumber')}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        type="tel"
                        variant='outlined'
                        size='small'
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        value={searchRequest.ToNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, ToNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={translator('common.ToNumber')}
                    />
                </Grid>
                {dateFields()}
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={searchRequest.TextMessage}
                        onChange={(e) => setSearchRequest({ ...searchRequest, TextMessage: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={translator('common.messageContent')}
                    />
                </Grid>
            </>
        )
    }
    const handleSearch = () => {
        onSetPage(1);
        setIsSearching(true);
        onSetIsSearching(true);
        onFilterRequest({ ...request, ...searchRequest });
    }
    const handleClearSearchForm = (e: any) => {
        e.preventDefault();
        onFilterRequest(DEFAULT_REQUEST);
        onSetIsSearching(false);
        setIsSearching(false);
        showAutoCompleteForm && setAutoCompleteKey(autoCompleteKey + 1);
        showAutoCompleteForm && setAutoCompleteOptions(finishedCampaigns.slice(0, 200));
    }
    const renderOptions = (props: HtmlHTMLAttributes<HTMLElement>, option: Partial<any>) => {
        return (<Box component="li" {...props} key={option.CampaignID}>
            {option.Name}
        </Box>)
    }

    return (
        <Grid container spacing={2} className={clsx(classes.lineTopMarging, classes.mb15)}>
            {showAutoCompleteForm && <Grid item>
                <FormControl variant="outlined" className={clsx(classes.formControl, classes.smsReplies)} style={{ width: '100%' }}>
                    <Autocomplete
                        disableListWrap
                        key={autoCompleteKey}
                        id='searchByCampaign'
                        getOptionLabel={(option: Partial<any>) => option.Name ?? ''}
                        // @ts-ignore
                        noOptionsText={translator("campaigns.newsLetterEditor.errors.CampaignNotFound")}
                        clearOnBlur={false}
                        options={autoCompleteOptions}
                        renderOption={renderOptions}
                        onChange={(option: any, selected: any) => {
                            setSearchRequest({
                                ...searchRequest, PageIndex: 1,
                                CampaignID: selected?.CampaignID
                            });
                        }}
                        disableClearable={false}
                        onInputChange={(e: any, searchTerm: any) => {
                            if (searchTerm === '') {
                                setAutoCompleteOptions(finishedCampaigns.slice(0, 200));
                            }
                        }}
                        renderInput={(params) => {
                            return (<TextField
                                {...params}
                                onChange={(e: any) => {
                                    if (e.target.value !== '') {
                                        const campaigns = finishedCampaigns.map((item: any, idx: number) => {
                                            return { Name: item.Name, CampaignID: item.SMSCampaignID, key: idx }
                                        });
                                        const filtered = campaigns.filter((cmp: any) => { return cmp.Name.indexOf(e.target.value) > -1 })
                                        setAutoCompleteOptions(filtered);
                                    }
                                    else {
                                        setAutoCompleteOptions(finishedCampaigns.slice(0, 200));
                                    }
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    placeholder: translator('common.searchByCampaign'),

                                }}
                                style={{
                                    width: 240,
                                }}
                                variant="outlined" />)
                        }}
                    />
                </FormControl>
            </Grid>}
            {advanceSearch ? renderAdvanceSearch() : renderDateFields()}
            <Grid item>
                <Button
                    size='large'
                    variant='contained'
                    onClick={handleSearch}
                    className={classes.searchButton}
                    endIcon={<SearchIcon />}>
                    {translator<string>('campaigns.btnSearchResource1.Text')}
                </Button>
                {windowSize !== 'xs' && <Link
                    color='initial'
                    component='button'
                    underline='none'
                    onClick={() => setAdvanceSearch(!advanceSearch)}
                    className={clsx(localClasses.dBlock, classes.dBlock, classes.mt1, advanceSearch && windowSize === 'lg' ? classes.mb15 : null)}>
                    {translator<string>(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
                </Link>
                }
            </Grid>
            {isSearching && <Grid item>
                <Button
                    size='large'
                    variant='contained'
                    onClick={(e) => {
                        handleClearSearchForm(e);
                    }}
                    className={classes.searchButton}
                    endIcon={<ClearIcon />}>
                    {translator<string>('common.clear')}
                </Button>
            </Grid>
            }
        </Grid>
    )

}
export default SearchLine;