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
    TextMessage: String
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
    const { t } = useTranslation();
    const localClasses = useStyles();
    const DEFAULT_REQUES: RequestObject = {
        FromDate: null,
        ToDate: null,
        FromNumber: '',
        ToNumber: '',
        TextMessage: '',
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
                        placeholder={t('common.FrmNumber')}
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
                    placeholder={t(
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
                    placeholder={t('mms.locToDateResource1.Text')}
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
                        value={searchRequest.FromNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.FrmNumber')}
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
                        placeholder={t('common.ToNumber')}
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
                        placeholder={t('common.messageContent')}
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
                    {t('campaigns.btnSearchResource1.Text')}
                </Button>
                {windowSize !== 'xs' && <Link
                    color='initial'
                    component='button'
                    underline='none'
                    onClick={() => setAdvanceSearch(!advanceSearch)}
                    className={clsx(localClasses.dBlock, classes.dBlock, classes.mt1, advanceSearch && windowSize === 'lg' ? classes.mb15 : null)}>
                    {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
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
                    {t('common.clear')}
                </Button>
            </Grid>
            }
        </Grid>
    )

}
export default SearchLine;