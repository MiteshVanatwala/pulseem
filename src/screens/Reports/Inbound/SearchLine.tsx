import clsx from 'clsx';
import 'moment/locale/he';
import moment from 'moment';
import { useEffect, useState } from "react";
import { Link, Grid, Button, TextField, makeStyles } from '@material-ui/core'
import { coreProps } from '../../../model/Core/corePros.types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { CalendarIcon, SearchIcon } from '../../../assets/images/managment/index'
import ClearIcon from '@material-ui/icons/Clear';


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
    MessageText: String
    ToDate: string | null,
    FromDate: string | null,
}

interface SearchObject {
    classes: any,
    currentPage: Number,
    onFilterRequest: Function,
    onSetPage: Function,
    onSetIsSearching: Function
}

const SearchLine = ({
    classes,
    currentPage,
    onFilterRequest,
    onSetPage,
    onSetIsSearching

}: SearchObject) => {
    const { t: translator } = useTranslation();
    const localClasses = useStyles();
    const DEFAULT_REQUES: RequestObject = {
        FromDate: null,
        ToDate: null,
        FromNumber: '',
        ToNumber: '',
        MessageText: '',
        Text: '',
        PageIndex: currentPage,
        PageSize: 6,
        IsExport: false
    };

    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [request, setRequest] = useState<RequestObject>(DEFAULT_REQUES);
    const [searchRequest, setSearchRequest] = useState<RequestObject>(DEFAULT_REQUES);
    const [isFromDatePickerOpen, setIsFromDatePickerOpen] = useState<boolean | undefined>(false);
    const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean | undefined>(false);
    const [advanceSearch, setAdvanceSearch] = useState<boolean | undefined>(false);

    const { windowSize } = useSelector(
        (state: { core: coreProps }) => state.core
    );


    useEffect(() => {
        if (!isSearching) {
            setSearchRequest(DEFAULT_REQUES);
        }
    }, [isSearching]);

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
                {dateFields()}
                {windowSize !== 'xs' && <Grid item>
                    <TextField
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
                    className={clsx(
                        classes.textField,
                        classes.NoPaddingtextField
                    )}
                    inputProps={{
                        className: clsx(classes.datePickerInput, localClasses.padding11)
                    }}
                    variant='inline'
                    keyboardIcon={<CalendarIcon />}
                    format={'DD/MM/YYYY'}
                    placeholder={translator('mms.locFromDateResource1.Text')}
                    initialFocusedDate={moment()}
                    value={searchRequest.FromDate}
                    onChange={(date: any, value?: string | null | undefined) => {
                        console.log(date);
                        console.log(value);
                        handleFromDate(value)
                    }}
                    onClose={() => setIsFromDatePickerOpen(false)}
                    open={isFromDatePickerOpen}
                    onClick={() => setIsFromDatePickerOpen(true)}
                    autoOk={true}
                    disableFuture
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
                    minDate={searchRequest.FromDate}
                    variant='inline'
                    keyboardIcon={<CalendarIcon />}
                    format={'DD/MM/YYYY'}
                    placeholder={translator('mms.locToDateResource1.Text')}
                    initialFocusedDate={moment()}
                    value={searchRequest.ToDate}
                    onChange={(date: any, value?: string | null | undefined) => {
                        console.log(date);
                        console.log(value);
                        handleToDate(value)
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
                        value={searchRequest.MessageText}
                        onChange={(e) => setSearchRequest({ ...searchRequest, MessageText: e.target.value })}
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
        onFilterRequest(DEFAULT_REQUES);
        onSetIsSearching(false);
        setIsSearching(false);
    }

    return (
        <Grid container spacing={2} className={clsx(classes.lineTopMarging, classes.mb15)}>
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