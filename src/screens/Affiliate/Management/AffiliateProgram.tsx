import { Box, Button, ButtonGroup, ClickAwayListener, Grid, Grow, MenuItem, MenuList, Paper, Popper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import DefaultScreen from "../../DefaultScreen";
import clsx from 'clsx'
import { Title } from "../../../components/managment/Title";
import { useTranslation } from "react-i18next";
import { getDetails } from "../../../redux/reducers/AffiliateSlice";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { StateType } from "../../../Models/StateTypes";
import { AffiliateDetails, eTimeFrame } from "../../../Models/Affiliates/Affiliates";
import { TablePagination } from "../../../components/managment";
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { actionURL } from "../../../config";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ArrowDropDownCircleOutlined } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../../components/Loader/Loader";

const AffiliateProgram = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { windowSize, rowsPerPage, isRTL } = useSelector((state: StateType) => state.core);
  const { affiliateDetails } = useSelector((state: StateType) => state.affiliates);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [timeFrame, setTimeFrame] = useState<eTimeFrame>(eTimeFrame.ALL_TIME);
  const [isSearching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchStr, setSearchStr] = useState<string>('');
  const [affiliateFee, setAffiliateFee] = useState<string>('');
  const [toBePaid, setToBePaid] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [paid, setPaid] = useState<number>(0);
  const [refId, setRefId] = useState<any>('');
  const [page, setPage] = useState(1);
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [showTimeFrame, setShowTimeFrame] = useState<boolean>(false);
  const rowsOptions = [6, 10, 20, 50];
  const timeFrameOptions = [eTimeFrame.ALL_TIME, eTimeFrame.LAST_MONTH, eTimeFrame.LAST_QUARTER];
  const anchorRef = React.useRef<HTMLDivElement>(null);


  const getData = async () => {
    setShowLoader(true);
    // @ts-ignore
    await dispatch(getDetails(timeFrame))
  }

  useEffect(() => {
    getData();
  }, [, timeFrame]);

  const handleAffilatePage = () => {
    if (affiliateDetails?.Data) {
      switch (affiliateDetails?.StatusCode) {
        case 201: {
          if (affiliateDetails?.Data[0]) {
            const fee = ` - ${affiliateDetails?.Data[0]?.AffiliateFee}%`
            const paid = affiliateDetails?.Data[0]?.Paid;
            const toPay = affiliateDetails?.Data.reduce((n: any, { ToPay }: any) => n + ToPay, 0);
            const referralID = affiliateDetails?.Data[0]?.ReferralID;
            setAffiliateFee(fee);
            setPaid(paid);
            setToBePaid(toPay);
            setBalance(toPay - paid);
            setRefId(referralID);
            setShowLoader(false);
          }
          else if (affiliateDetails?.Message !== '') {
            setRefId(affiliateDetails?.Message);
          }
          break;
        }
        case 406: {
          navigate(-1);
          break;
        }
        default: {
          setShowLoader(false);
          break;
        }
      }
    }

  }

  useEffect(() => {
    handleAffilatePage();
  }, [affiliateDetails])
  const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {windowSize !== 'xs' && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }
  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("affiliate.account")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("affiliate.paidByCustomer")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("affiliate.incomeFromCustomer")} {affiliateFee}</TableCell>
        </TableRow>
      </TableHead>
    )
  }
  const renderTableBody = () => {
    let sortData = isSearching ? searchResults : affiliateDetails?.Data;
    let rpp = parseInt(rowsPerPage.toString())
    sortData = sortData?.length > 0 && sortData?.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {sortData?.length > 0 ? sortData.map(windowSize === 'xs' ? renderPhoneRow : renderRow) : (
            <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
              <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
                {t('common.NoDataTryFilter')}
              </Grid>
            </Box>
          )}
        </TableBody>
      </Box>
    )
  }
  const renderRow = (row: AffiliateDetails) => {
    return (
      <TableRow
        key={row.AccountID}
        classes={rowStyle}>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          <Typography className={classes.font18}>{row.CompanyName}</Typography>
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
          <Typography className={classes.font18}>{row?.Payments?.toLocaleString()} {t('common.NIS')}</Typography>

        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
          <Typography className={classes.font18}>{row.ToPay?.toLocaleString()} {t('common.NIS')}</Typography>
        </TableCell>
      </TableRow>
    )
  }
  const renderPhoneRow = () => {
    return <></>
  }
  const renderTablePagination = () => {
    const handleRowsPerPageChange = (val: any) => {
      dispatch(setRowsPerPage(val))
    }
    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? searchResults.length : affiliateDetails?.Data?.lengh}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }
  useEffect(() => {
    const filteredData = affiliateDetails?.Data && affiliateDetails?.Data?.length > 0 && affiliateDetails?.Data?.filter((item: AffiliateDetails) => { return item.CompanyName.indexOf(searchStr) > -1 });
    setSearchResults(filteredData);
  }, [isSearching]);
  const handleCopyScript = () => {
    setCopyStatus(true);
    setTimeout(() => {
      setCopyStatus(false);
    }, 1000);
  }
  const renderBalance = () => {
    return <Box style={{ marginTop: 15 }}>
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          <TableHead>
            <TableRow classes={rowStyle}>
              <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("affiliate.OpenForPayment")}</TableCell>
              <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("affiliate.paid")}</TableCell>
              <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("affiliate.balance")}</TableCell>
            </TableRow>
          </TableHead>
          <Box className='tableBodyContainer'>
            <TableBody>
              <TableRow
                key={toBePaid}
                classes={rowStyle}>
                <TableCell
                  classes={cellStyle}
                  align='center'
                  className={classes.flex1}>
                  <Typography className={classes.font18}>{toBePaid?.toLocaleString()}</Typography>
                </TableCell>
                <TableCell
                  classes={cellStyle}
                  align='center'
                  className={classes.flex2}>
                  <Typography className={classes.font18}>{paid?.toLocaleString()} {t('common.NIS')}</Typography>
                </TableCell>
                <TableCell
                  classes={cellStyle}
                  align='center'
                  className={classes.flex2}>
                  <Typography className={classes.font18}>{balance?.toLocaleString()} {t('common.NIS')}</Typography>

                </TableCell>
              </TableRow>
            </TableBody>
          </Box>
        </Table>
      </TableContainer>
    </Box>
  }
  const renderManagementLine = () => {
    return <Box>
      <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
        <b style={{ marginInlineEnd: 15 }}>{t('affiliate.referralLink')}: </b>
        <a title={t('affiliate.referralLink')} rel="noreferrer" href={`${actionURL?.replace('/Pulseem/', '/react/')}sign-up?refId=${refId}&culture=${isRTL ? 'he' : 'en'}`} target="_blank">{`${actionURL?.replace('/Pulseem/', '/react/')}sign-up?refId=${refId}`}</a>
        <Box style={{ marginInlineStart: 15 }}>
          <CopyToClipboard text={`${actionURL?.replace('/Pulseem/', '/react/')}sign-up?refId=${refId}&culture=${isRTL ? 'he' : 'en'}`} onCopy={handleCopyScript}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<div className={classes.copyIcon}>{copyStatus ? '\uE134' : '\ue0b0'}</div>}
              className={classes.mb2}
            >
              {copyStatus ? t('notifications.copied') : t('notifications.copy')}
            </Button>
          </CopyToClipboard>
        </Box>
      </Box>
    </Box>
  }
  const renderSearchSection = () => {
    const handleKeyDown = (event: any) => {
      if (event.keyCode === 13 || event.code === "Enter") {
        setSearching(true);
      }
    };

    return (
      <Grid container>
        <Grid item style={{ marginInline: 15 }}>
          <TextField
            variant="outlined"
            size="small"
            value={searchStr}
            onKeyPress={handleKeyDown}
            onChange={(e: any) => setSearchStr(e.target.value)}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t("affiliate.searchAccount")}
          />
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              setSearching(true);
            }}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t("campaigns.btnSearchResource1.Text")}
          </Button>
        </Grid>
        {isSearching && <Grid item className={classes.mInline15}>
          <Button
            onClick={() => {
              setSearchStr("");
              setPage(1);
              setSearching(false);
            }}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t("common.clear")}
          </Button>
        </Grid>}
      </Grid>
    );
  }
  const renderTimeFrame = () => {
    return (
      <React.Fragment>
        <ButtonGroup
          variant="contained"
          ref={anchorRef}
          aria-label="Button group with a nested menu"
          //@ts-ignore
          color={'primary'}
          style={{ maxHeight: 50, alignSelf: 'center' }}
        >
          <Button onClick={handleClick}>
            {timeFrame === eTimeFrame.ALL_TIME && t('affiliate.allTime')}
            {timeFrame === eTimeFrame.LAST_MONTH && t('affiliate.lastMonth')}
            {timeFrame === eTimeFrame.LAST_QUARTER && t('affiliate.lastQuarter')}
          </Button>
          <Button
            size="small"
            aria-controls={showTimeFrame ? 'split-button-menu' : undefined}
            aria-expanded={showTimeFrame ? 'true' : undefined}
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownCircleOutlined />
          </Button>
        </ButtonGroup>
        {/* @ts-ignore */}
        <Popper sx={{ zIndex: 1 }}
          open={showTimeFrame}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                {/* @ts-ignore */}
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {timeFrameOptions.map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={index === timeFrame}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {index === eTimeFrame.ALL_TIME && t('affiliate.allTime')}
                        {index === eTimeFrame.LAST_QUARTER && t('affiliate.lastQuarter')}
                        {index === eTimeFrame.LAST_MONTH && t('affiliate.lastMonth')}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </React.Fragment>
    );
  }

  const handleClick = () => {
    console.info(`You clicked ${timeFrameOptions[timeFrame]}`);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setTimeFrame(index);
    setShowTimeFrame(false);
  };

  const handleToggle = () => {
    setShowTimeFrame((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setShowTimeFrame(false);
  };

  const renderGrandTotal = () => {
    if (affiliateDetails?.Data && affiliateDetails?.Data?.length > 0) {
      // return <Box className={classes.dFlex} style={{ width: '100%', alignItems: 'center', marginTop: 10, marginInlineEnd: 25 }}>
      return <Typography className={clsx(classes.font18, classes.bold)}>{toBePaid?.toLocaleString()} {t('common.NIS')}</Typography>
      // </Box>
    }
    return <></>
  }

  return <DefaultScreen
    key="affiliateManagement"
    currentPage='settings'
    subPage='affiliateManagement'
    classes={classes}
    containerClass={clsx(classes.management, classes.mb50)}>
    <Box className={clsx('topSection', classes.mb4)}>
      <Title Text={t('affiliate.pageTitle')} classes={classes} />
      <Box style={{ paddingInlineStart: 25, paddingBlockStart: 20 }} className={classes.dFlex}>
        {renderManagementLine()}
      </Box>
    </Box>
    <Grid item xs={12} style={{ marginBlock: 25 }}>
      {renderBalance()}
    </Grid>
    <Grid item xs={12} style={{ marginBlock: 25, paddingInlineStart: 25 }}>
      <Box style={{ alignItems: "center", width: '100%' }} className={classes.dFlex}>
        <Typography className={clsx(classes.managementTitle, "mgmtTitle")} style={{ whiteSpace: 'nowrap', width: 'auto', paddingInlineEnd: 15 }}>{t('affiliate.affiliatedAccounts')}</Typography>
        <Box className={classes.flexContainerGap25}>
          <Box>
            {renderTimeFrame()}
          </Box>
          <Box>
            {renderSearchSection()}
          </Box>
        </Box>
      </Box>
    </Grid>
    {renderTable()}
    {/* {renderGrandTotal()} */}
    {renderTablePagination()}
    <Loader isOpen={showLoader} showBackdrop={true} />
  </DefaultScreen>
}

export default AffiliateProgram;