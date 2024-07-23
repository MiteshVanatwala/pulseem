import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../components/Loader/Loader';
import { coreProps } from '../../model/Core/corePros.types';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { Select } from '@mui/material';
import { CreditHistoryAccountType, CreditHistoryType } from '../../config/enum';
import { IoIosArrowDown } from 'react-icons/io';
import { DateField } from '../../components/managment';
import moment from 'moment';
import { DateFormats, SizeOptionsOfHandHeldDevices } from '../../helpers/Constants';

const CreditHistory = ({ classes }: any) => {
	const dispatch: any = useDispatch();
	const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot) }
	const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const { t } = useTranslation();
	const { isRTL, windowSize  } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { isGlobal } = useSelector((state: any) => state.subAccount);
	const [ isLoader, setIsLoader ] = useState<boolean>(false);
	const [ filter, setFilter ] = useState<any>({
		type: -1,
		accountType: -1,
		fromDate: null,
		toDate: null,
		showPulseemCreditOnly: false,
	});
	const [ history, setHistory ] = useState<any>([]);

	useEffect(() => {
	}, []);

	const renderSearchSection = () => {
    const handleKeyDown = (event: any) => {
			if (event.keyCode === 13 || event.code === "Enter") {
				// initPageState(rowsPerPage, 1);
			}
    };

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
											<option value={CreditHistoryType.All}>{t("common.all")}</option>
											<option value={CreditHistoryType.Email}>{t("common.Mail")}</option>
											<option value={CreditHistoryType.SMS}>{t("common.SMS")}</option>
											<option value={CreditHistoryType.MMS}>{t("common.MMS")}</option>
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
											<option value={CreditHistoryAccountType.All}>{t("common.all")}</option>
											<option value={CreditHistoryAccountType.Standard}>{t("SubAccount.standard")}</option>
											<option value={CreditHistoryAccountType.Direct}>{t("SubAccount.direct")}</option>
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
							onTimeChange={() => { }}
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
							minDate={undefined}
							onTimeChange={() => { }}
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
											checked={filter.showPulseemCreditOnly}
											onChange={() => setFilter({
												...filter,
												showPulseemCreditOnly: !filter.showPulseemCreditOnly
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
              // onClick={() => initPageState(rowsPerPage, 1)}
              className={clsx(classes.btn, classes.btnRounded)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              {t("campaigns.btnSearchResource1.Text")}
            </Button>
						<Button
							onClick={() => {}}
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
      </Grid>
    );
  };

	const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.f16)} align='center'>{t('common.Dates')}1</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.f16)} align='center'>{t('SubAccount.amount')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.f16)} align='center'>{t('SubAccount.type')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.f16)} align='center'>{t('SubAccount.accountType')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.f16)} align='center'>{t('SubAccount.transferringFromAccount')}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.f16)} align='center'>{t('SubAccount.transferredToAccount')}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

	const renderRow = (row: any) => {
		return (
      <TableRow
        key={row?.ID}
        classes={rowStyle}
      >
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex2}
				>
					Test
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex1}
				>
					Test
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex1}
				>
					Test
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex1}
				>
					Test
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex2}
				>
					Test
				</TableCell>
				<TableCell
					classes={cellBodyStyle}
					align='center'
					className={classes.flex2}
				>
					Test
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
