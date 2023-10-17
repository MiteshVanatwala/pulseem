import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, memo, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import DataTable from "../../../components/Table/DataTable";
import {
    Box, Typography, TableBody, TableRow, TableCell,
    Grid, Button, TextField, Checkbox
} from '@material-ui/core'
import { PreviewIcon, AddRecipient, AddRecipients, ResetIcon, SettingIcon, AutomationIcon, DeleteIcon } from '../../../assets/images/managment/index'
import { TablePagination, ManagmentIcon } from '../../../components/managment/index'
import FlexGrid from "../../../components/Grids/FlexGrid";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import {
    getGroupsBySubAccountId
} from "../../../redux/reducers/groupSlice";
import {
    get,
    set,
    reset,
    deleteGroups
} from "../../../redux/reducers/DynamicGroupsSlice";
import { exportGroupsClients } from '../../../redux/reducers/clientSlice';
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import AddGroupPopUp from '../Management/Popup/AddGroupPopUp';
import AddRecipientPopup from '../Management/Popup/AddRecipientPopup';
import ConfirmDeletePopUp from '../Management/Popup/ConfirmDeletePopUp';
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { Loader } from '../../../components/Loader/Loader';
import { MdArrowBackIos, MdArrowForwardIos, MdOutlineLockClock } from "react-icons/md"
import { RiPagesLine } from "react-icons/ri"
import IconWrapper from "../../../components/icons/IconWrapper";
import AddBulkRecipientPopup from '../Management/Popup/AddBulkRecipientPopup';
import AddRecipientResponse from '../Management/Popup/AddRecipientResponse';
import EditGroupPopup from '../Management/Popup/EditGroupPopup';
import ResetGroupPopup from '../Management/Popup/ResetGroupPopup';
import SimplyClubPupup from '../Management/Popup/SimplyClubPupup';
import Toast from '../../../components/Toast/Toast.component';
import UnsubscribeOrDeletePopup from '../Management/Popup/UnsubscribeOrDeletePopup';
import { useNavigate, useLocation } from 'react-router';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog'
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes'
import { SetPageState, GetPageNyName } from '../../../helpers/UI/SessionStorageManager';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { Title } from '../../../components/managment/Title';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import { ClientStatus } from '../../../helpers/Constants';
import { ReplaceExtraFieldHeader } from '../../../helpers/UI/AccountExtraField';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { ClientExtraData } from '../../../Models/Integrations/ClientIntegrations';
import { Client } from '../../../Models/Clients/Client';

const DynamicGroups = ({ classes }: any) => {
    return (
        <DefaultScreen
            currentPage='dynamicGroups'
            subPage='groupManagement'
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            <Box className={classes.mb50}>
                {/* {toastMessage && renderToast()} */}
                <Box className={'topSection'}>

                    <Title Text={t('recipient.logPageHeaderResource1.Text')} classes={classes} />
                    {/* {renderSearchSection()} */}
                </Box>
                {/* {windowSize !== 'xs' ? renderManagmentLine() :
                    <Box
                        item
                        xs={windowSize === "xs" && 12}
                        className={clsx(classes.groupsLableContainer, classes.mt20)}
                    >
                        <Typography className={classes.groupsLable}>
                            {`${groupData ? groupData.RecordCount : 0} ${t("common.Groups")}`}
                        </Typography>
                    </Box>
                }
                {renderTableBody()}
                {renderTablePagination()}
                {showConfirmDialog && renderConfirmDialog()}
                {dialog !== null && showDialog()}
                <Loader isOpen={showLoader} showBackdrop={true} /> */}
            </Box>
        </DefaultScreen>
    )
}

export default memo(DynamicGroups);