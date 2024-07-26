import { useEffect, useState } from 'react';
import uniqid from 'uniqid';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../components/Loader/Loader';
import { coreProps } from '../../model/Core/corePros.types';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { DateField } from '../../components/managment';
import { CreditHistoryAccountType, CreditHistoryType, DateFormats, SizeOptionsOfHandHeldDevices } from '../../helpers/Constants';
import { GetBulkHistory } from '../../redux/reducers/SubAccountSlice';
import { BulkHistory } from '../../Models/SubAccount/SubAccounts';
import moment from 'moment';
import { get } from 'lodash';

const CreditHistory = ({ classes, id = '' }: any) => {
	const dispatch: any = useDispatch();
	const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot) }
	const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const { t } = useTranslation();
	const { isRTL, language, windowSize  } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { isGlobal } = useSelector((state: any) => state.subAccount);
	const defaultFilter = {
		type: '',
		accountType: '',
		fromDate: null,
		toDate: null,
		IsPulseemCreditsOnly: false,
		IsGlobalAccount: isGlobal,
		CustomGuidEnc: id
	}
	const [ isLoader, setIsLoader ] = useState<boolean>(false);
	const [ filter, setFilter ] = useState<any>(defaultFilter);
	const [ history, setHistory ] = useState<BulkHistory[]>([]);
	moment.locale(language);
	
	useEffect(() => {
		getData();
	}, []);

	const getData = async (isReset: boolean = false) => {
		setIsLoader(true);
		if (isReset) setFilter(defaultFilter);
		const response = await dispatch(GetBulkHistory(isReset ? defaultFilter : filter));
		setHistory(response.payload.Data || []);
		setIsLoader(false);
	}

	const renderSearchSection = () => {
    return (
			<Grid container spacing={2}>
				{
					!isGlobal && (
						<>
							<Grid item md={3}>
								<Typography>{t("SubAccount.type")}</Typography>
								<FormControl className={clsx(classes.selectInputFormControl, classes.w100, classes.pt10)}>
									<Select
										native
										variant="standard"
										value={filter.type}
										onChange={(event: any) => setFilter({
											...filter,
											type: event.target.value
										})}
										IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
										MenuProps={{
											PaperProps: {
												style: {
													maxHeight: 300,
													direction: isRTL ? 'rtl' : 'ltr'
												},
											},
										}}
										style={{
											padding: 2
										}}
									>
										<option value=''>{t("common.all")}</option>
										{
											Object.keys(CreditHistoryType).map((item: any) => 
												<option value={item}>{t(`${get(CreditHistoryType, item, '')}`)}</option>
											)
										}
									</Select>
								</FormControl>
							</Grid>
						
							<Grid item md={3}>
								<Typography>{t("SubAccount.accountType")}</Typography>
								<FormControl className={clsx(classes.selectInputFormControl, classes.w100, classes.pt10)}>
									<Select
										native
										variant="standard"
										value={filter.accountType}
										onChange={(event: any) => setFilter({
											...filter,
											accountType: event.target.value
										})}
										IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
										MenuProps={{
											PaperProps: {
												style: {
													maxHeight: 300,
													direction: isRTL ? 'rtl' : 'ltr'
												},
											},
										}}
										style={{
											padding: 2
										}}
									>
										<option value=''>{t("common.all")}</option>
										{
											Object.keys(CreditHistoryAccountType).map((item: any) => 
												<option value={item}>{t(`${get(CreditHistoryAccountType, item, '')}`)}</option>
											)
										}
									</Select>
								</FormControl>
							</Grid>
						</>
					)
				}
				<Grid item md={3}>
					<Typography>{t("common.FromDate")}</Typography>
					{/* @ts-ignore */}
					<DateField
						toolbarDisabled={false}
						classes={classes}
						placeholder={t('notifications.date')}
						value={filter.fromDate}
						onChange={(value: any) =>
							setFilter({
								...filter,
								fromDate: moment(value).format(DateFormats.DATE_ONLY)
							})
						}
						timePickerOpen={true}
						dateActive={true}
						minDate={undefined}
						timeActive={false}
						buttons={{
							ok: t("common.confirm"),
							cancel: t("common.cancel"),
						} as any}
						removePadding={true}
						hideInvalidDateMessage={true}
					/>
				</Grid>
				<Grid item md={3}>
					<Typography>{t("common.ToDate")}</Typography>
					{/* @ts-ignore */}
					<DateField
						toolbarDisabled={false}
						classes={classes}
						placeholder={t('notifications.date')}
						value={filter.toDate}
						onChange={(value: any) =>
							setFilter({
								...filter,
								toDate: moment(value).format(DateFormats.DATE_ONLY)
							})
						}
						timePickerOpen={true}
						dateActive={true}
						minDate={filter.fromDate}
						timeActive={false}
						buttons={{
							ok: t("common.confirm"),
							cancel: t("common.cancel"),
						} as any}
						removePadding={true}
						hideInvalidDateMessage={true}
					/>
				</Grid>
				<Grid item md={12} className={clsx(classes.textRight)}>
					{
						!isGlobal && (
							<FormControlLabel
								control={
									<Checkbox
										checked={filter.IsPulseemCreditsOnly}
										onChange={() => setFilter({
											...filter,
											IsPulseemCreditsOnly: !filter.IsPulseemCreditsOnly
										})}
										name="pulseemCredit"
										color="primary"
									/>
								}
								label={t('SubAccount.showPulseemCreditsOnly')}
							/>
						)
					}
					<Button
						onClick={() => getData(false)}
						className={clsx(classes.btn, classes.btnRounded)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
						{t("campaigns.btnSearchResource1.Text")}
					</Button>
					<Button
						onClick={() => getData(true)}
						className={clsx(classes.btn, classes.btnRounded, classes.mlr10)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
							{t("common.clear")}
					</Button>
					<Button
						onClick={() => {}}
						className={clsx(classes.btn, classes.btnRounded)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
						{t("common.Export")}
					</Button>
				</Grid>
		</Grid>);
  };

	const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.f16)} align='center'>{t('common.Dates')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.f16)} align='center'>{t('SubAccount.amount')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.f16)} align='center'>{t('SubAccount.type')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.f16)} align='center'>{t('SubAccount.accountType')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.f16)} align='center'>{t('SubAccount.transferringFromAccount')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.f16)} align='center'>{t('SubAccount.transferredToAccount')}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

	const renderRow = (row: BulkHistory) => {
		return (
      <TableRow
        key={uniqid()}
        classes={rowStyle}
      >
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex2}
				>
					{moment(row.Date).format(DateFormats.FULL_DATE)}
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex1}
				>
					{row.Amount}
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex1}
				>
					{t(`${get(CreditHistoryType, row.Type, '')}`)}
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex1}
				>
					{t(`${get(CreditHistoryAccountType, row.AccountType ? 1 : 0, '')}`)}
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex2}
				>
					{row.TransferedFromSubAccountName}
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex2}
				>
					{row.TransferredToName}
				</TableCell>
			</TableRow>
		);
	}

	const renderPhoneRow = (item: any) => {
		return <></>;
	}

	const renderTableBody = () => {
    if (history.length > 0) {
      return (
        <TableBody>
          {history
            .map((item: any, index: number) => SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? renderPhoneRow(item) : renderRow(item))}
        </TableBody>
      )
    }
    return (
			<Box className={clsx(classes.p10)}>
				<Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
					{t('common.NoDataTryFilter')}
				</Grid>
			</Box>
		)
  }

	const renderTable = () => {
    return (
      <TableContainer className={clsx(classes.tableStyle, classes.mt4, classes.mb15)} style={{ width: 'auto' }}>
        <Table className={clsx(classes.tableContainer, classes.borderRadius30)}>
          {SizeOptionsOfHandHeldDevices.indexOf(windowSize) === -1 && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

	return (
		<>
			{renderSearchSection()}
			{renderTable()}
			<Loader isOpen={isLoader} />
		</>
	);
};

export default CreditHistory;
