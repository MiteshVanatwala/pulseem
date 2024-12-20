import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { MdTaskAlt } from "react-icons/md";
import moment from 'moment';
import { PermissionsHistoryInterface } from "../../Models/UsersAndPermissions/UsersAndPermissions";
import { DateFormats } from "../../helpers/Constants";
import { first } from "@amcharts/amcharts4/.internal/core/utils/Array";
import { without } from "lodash";

const PermissionsHistory = ({ classes, isOpen, onClose }: any) => {
  const { windowSize, language } = useSelector((state: StateType) => state.core);
	const { t } = useTranslation();
	const rowStyle = { head: clsx(classes.tableRowHead, classes.pt10, classes.pb10), root: classes.tableRowRoot }
  const cellStyle = { head: clsx(classes.tableCellHead, classes.noPadding, classes.f16), body: classes.tableCellBody, root: clsx(classes.tableCellRoot, classes.p0) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody, classes.f16), root: clsx(classes.tableCellRoot) }
	const [ permissionsHistory, setPermissionsHistory ] = useState<PermissionsHistoryInterface[]>([
		{
			HistoryID: 1,
			PermissionType: '',
			Permissions: 'Limited Access|Allow Sending|Allow Export|Allow deleting',
      Date: '2024-12-12T05:18:09.527'
		},
		{
			HistoryID: 2,
			PermissionType: '',
			Permissions: 'Read Only',
      Date: '2024-12-13T05:38:09.527'
		},
		{
			HistoryID: 2,
			PermissionType: '',
			Permissions: 'Admin',
      Date: '2024-12-15T05:28:09.527'
		}
	]);
  moment.locale(language);
	
	useEffect(() => {  
  }, []);

	const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.Dates")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("UsersAndPermissions.permissions")}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

	const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle} style={{ width: 'auto' }}>
        <Table>
          {windowSize !== 'xs' && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTableBody = () => {
    if (permissionsHistory.length === 0) {
      return (
        <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
          <Typography>{t("common.NoDataTryFilter")}</Typography>
        </Box>
      );
    }

    return (
      <TableBody>
        {permissionsHistory.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
      </TableBody>
    )
  }

	const renderPhoneRow = (row: PermissionsHistoryInterface) => {
		const limitedAccessPermissions = row.Permissions.split('|');
    const subRights = without(limitedAccessPermissions, first(limitedAccessPermissions)).join(', ');
    return (
      <TableRow
        key={row.HistoryID}
        component='div'
        classes={rowStyle}
      >
        <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.p10) }}>
					<Box className={clsx(classes.pt5)}>
            <span className={clsx(classes.semibold)}>{t('common.CreationDate')}: </span><b>{moment(row.Date).format(DateFormats.DATE_TIME_24)}</b>
          </Box>
					<Box className={clsx(classes.pt5)}>
						<span className={clsx(classes.semibold)}>{t("UsersAndPermissions.permissions")} :&nbsp; </span>
            {first(limitedAccessPermissions)}
            {
              subRights !== '' && (
                <span>
                  <b> - </b>{subRights}
                </span>
              )
            }
          </Box>
        </TableCell>
      </TableRow>
    )
  }

	const renderRow = (row: PermissionsHistoryInterface) => {
    const limitedAccessPermissions = row.Permissions.split('|');
    const subRights = without(limitedAccessPermissions, first(limitedAccessPermissions)).join(', ');
    return (
      <TableRow
        key={row.HistoryID}
        classes={rowStyle}
      >
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex1}>
						{moment(row.Date).format(DateFormats.DATE_TIME_24)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex2, classes.p10, classes.dInlineBlock)}>
						<b>{first(limitedAccessPermissions)}</b>
            {
              subRights !== '' && (
                <span>
                  <b> : </b>{subRights}
                </span>
              )
            }
        </TableCell>
      </TableRow>
    )
  }

  return (
    <BaseDialog
			classes={classes}
			open={isOpen}
			title={t('UsersAndPermissions.permissionsHistory')}
			icon={<MdTaskAlt />}
			showDivider={false}
			onClose={() => onClose(false)}
			onCancel={() => onClose(false)}
			onConfirm={() => {}}
			reduceTitle
			paperStyle={clsx(windowSize !== 'xs' ? classes.w50VW : null)}
			childrenPadding={false}
			renderButtons={() => (<></>)}
		>
      <Box>
				{renderTable()}
      </Box> 
    </BaseDialog>
  )
}

export default PermissionsHistory;