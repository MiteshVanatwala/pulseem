import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { MdTaskAlt } from "react-icons/md";
import moment from 'moment';
import { PermissionsHistoryInterface, SubUserChangeLog, SubUserModel } from "../../Models/SubUser/SubUsers";
import { DateFormats } from "../../helpers/Constants";
import { first } from "@amcharts/amcharts4/.internal/core/utils/Array";
import { without } from "lodash";
import { Loader } from "../Loader/Loader";
import { getChangeLog } from "../../redux/reducers/SubUserSlice";
import PermissionList from "../../screens/UsersAndPermissions/PermissionList";

interface refs {
  classes: any;
  subUser: SubUserModel;
  isOpen: boolean;
  onClose: any;
}


const PermissionsHistory = ({ classes, subUser, isOpen, onClose }: refs) => {
  const { windowSize, language } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const rowStyle = { head: clsx(classes.tableRowHead, classes.pt10, classes.pb10), root: classes.tableRowRoot }
  const cellStyle = { head: clsx(classes.tableCellHead, classes.noPadding, classes.f16), body: classes.tableCellBody, root: clsx(classes.tableCellRoot, classes.p0) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody, classes.f16), root: clsx(classes.tableCellRoot) }
  const [changeLogs, setChangeLogs] = useState<SubUserChangeLog[]>([]);

  const getData = async () => {
    const response = await dispatch(getChangeLog(subUser?.ID)) as any;
    if (response?.payload?.StatusCode === 201) {
      setChangeLogs(response?.payload?.Data);
    }
    setShowLoader(false);
  }

  moment.locale(language);

  useEffect(() => {
    getData();
  }, []);

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.Dates")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("SubUsers.permissions")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>IP</TableCell>
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
    if (changeLogs?.length === 0) {
      return (
        <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
          <Typography>{t("common.NoDataTryFilter")}</Typography>
        </Box>
      );
    }

    return (
      <TableBody>
        {changeLogs.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
      </TableBody>
    )
  }

  const renderPhoneRow = (row: SubUserChangeLog) => {
    const rowObj: any = JSON.parse(row?.NewPermssions);
    const limitedAccessPermissions = rowObj?.Permissions.split(',');

    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}
      >
        <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.p10) }}>
          <Box className={clsx(classes.pt5)}>
            <span className={clsx(classes.semibold)}>{t('common.CreationDate')}: </span><b>{moment(row.CreatedDate).format(DateFormats.DATE_TIME_24)}</b>
          </Box>
          <Box className={clsx(classes.pt5)}>
            <span className={clsx(classes.semibold)}>{t("SubUsers.permissions")} :&nbsp; </span>
            <PermissionList list={limitedAccessPermissions} />
          </Box>
        </TableCell>
      </TableRow>
    )
  }

  const renderRow = (row: SubUserChangeLog) => {
    const rowObj: any = JSON.parse(row?.NewPermssions);
    const limitedAccessPermissions = rowObj?.Permissions.split(',');

    return (
      <TableRow
        key={row.ID}
        classes={rowStyle}
      >
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex1}>
          {moment(row.CreatedDate).format(DateFormats.DATE_TIME_24)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex2, classes.p10, classes.dInlineBlock)}>
          <PermissionList list={limitedAccessPermissions} />
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1, classes.p10, classes.dInlineBlock)}>
          {row.IpAddress}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <BaseDialog
      classes={classes}
      open={isOpen}
      title={t('SubUsers.permissionsHistory')}
      icon={<MdTaskAlt />}
      showDivider={false}
      onClose={() => onClose(false)}
      onCancel={() => onClose(false)}
      onConfirm={() => { }}
      reduceTitle
      paperStyle={clsx(windowSize !== 'xs' ? classes.w50VW : null)}
      childrenPadding={false}
      renderButtons={() => (<></>)}
    >
      <Box>
        {renderTable()}
        <Loader isOpen={showLoader} zIndex={9999} showBackdrop={false} />
      </Box>
    </BaseDialog>
  )
}

export default PermissionsHistory;