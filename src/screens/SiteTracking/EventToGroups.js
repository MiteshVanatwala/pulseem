import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import GroupTags from '../../components/Groups/GroupTags'
import { EventConditions } from '../../helpers/Constants'
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'
import { FormControl, Typography, TextField, Box, Select, MenuItem, Button, InputAdornment } from '@material-ui/core'
import { updateMetaData, deleteMetaData } from '../../redux/reducers/siteTrackingSlice';
import { GroupDialog } from '../../components/Groups/GroupDialog';
import { DeleteIcon } from '../../assets/images/managment/index';
import CustomTooltip from '../../components/Tooltip/CustomTooltip';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { IoIosArrowDown } from 'react-icons/io';
import Delete from '../../assets/images/managment/Delete';
import { BsTrash } from 'react-icons/bs';

const EventToGroups = ({
    classes,
    index = 0,
    currentEvent = null,
    eventsCount
}) => {
    const { t } = useTranslation();
    const { isRTL, windowSize } = useSelector((state) => state.core);
    const { subAccountAllGroups } = useSelector((state) => state.group);
    const { event } = useSelector((state) => state.siteTracking);
    const [pageUrlIsValid, setPageUrlIsValid] = useState(null);
    const [groupSelected, setGroupSelected] = useState([]);
    const [showGroupsDialog, setShowGroupsDialog] = useState(false);

    const dispatch = useDispatch();

    const updateOperationData = (e, key, value) => {
        e.preventDefault();
        if (value !== '' && e.target.classList) {
            e.target.classList.remove('error');
        }
        setPageUrlIsValid(value !== '');
        dispatch(updateMetaData({ index, key, value, id: currentEvent.id }));
    }

    const handleRemoveGroup = (newList) => {
        let newSelection = newList ? newList : [];
        setGroupSelected(newSelection);
        dispatch(updateMetaData({ index, key: 'groupIds', value: newSelection, id: currentEvent.id }));
    }

    useEffect(() => {
        if (currentEvent) {
            setGroupSelected(currentEvent.groupIds);
            let newSelection = currentEvent.groupIds;
            dispatch(updateMetaData({ index, key: 'groupIds', value: newSelection, id: currentEvent.id }));
        }
    }, [currentEvent, dispatch, index]);

    const renderGroupsDialog = () => {
        const currentMetaData = event.metadata.find((item) => { return item.id === currentEvent.id });
        return GroupDialog({
            classes: classes,
            title: t('siteTracking.selectGroups'),
            groups: subAccountAllGroups,
            allowSelectAll: true,
            groupsSelected: currentMetaData.groupIds,
            onConfirm: (e) => { handleGroupSelection(e) },
            onClose: () => { setShowGroupsDialog(false) }
        });
    }

    const handleGroupSelection = (e) => {
        const newSelection = e.map((g) => { return g }).filter(function (element) {
            return element !== undefined;
        });
        dispatch(updateMetaData({ index, key: 'groupIds', value: newSelection, id: currentEvent.id }));
        setGroupSelected(newSelection);
        setShowGroupsDialog(false);
    }

    const showGroups = () => {
        const dialog = renderGroupsDialog();

        return (
            <BaseDialog
                classes={classes}
                open={showGroupsDialog}
                onClose={() => { setShowGroupsDialog(false) }}
                onCancel={() => { setShowGroupsDialog(false) }}
                {...dialog}>
                {dialog.content}
            </BaseDialog>
        )
    }
    const handleShowGroup = () => {
        setShowGroupsDialog(true);
    }

    const onDelete = () => {
        dispatch(deleteMetaData(currentEvent.id));
    }

    return <Box id={currentEvent.id} className={classes.marginBlock20}
        style={{
            display: 'flex',
            flexDirection: windowSize === 'xs' ? 'column' : 'row',
            maxWidth: 1150
        }}>
        {showGroups()}
        <Box>

            <Box>
                <Typography className={clsx(classes.buttonHead)}>
                    {t("siteTracking.pageUrl")}
                </Typography>
            </Box>
            <Box
                className={classes.eventPageContainer}
            >
                <Box className={clsx(classes.flex, 'selectWrapper')}>
                    <FormControl
                        // variant="outlined"
                        className={clsx(classes.selectInputFormControl)}
                        style={{ minWidth: 100, marginTop: 12 }}>
                        <Select
                            id="demo-simple-select-outlined"
                            name={currentEvent && currentEvent.operatorKey}
                            value={currentEvent && currentEvent.operatorKey}
                            onChange={e => updateOperationData(e, "operatorKey", e.target.value)}
                            style={{ direction: 'ltr', textAlign: isRTL ? 'right' : 'left', maxHeight: 57 }}
                            className={'bottomAlignedSelect'}
                            endAdornment={
                                <InputAdornment
                                    className={classes.selectAdornment}
                                    position="end"
                                >
                                    <IoIosArrowDown size={20} />
                                </InputAdornment>
                            }
                        >
                            {EventConditions.map((condition) => {
                                return <MenuItem
                                    key={condition.key}
                                    value={condition.key}
                                    name={condition.key}
                                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                >{
                                        condition.tooltip ? <CustomTooltip
                                            isSimpleTooltip={false}
                                            classes={classes}
                                            interactive={false}
                                            arrow={true}
                                            style={{ fontSize: 16, fontWeight: 400 }}
                                            placement={'top'}
                                            nameEllipsis={false}
                                            title={<Typography style={{ maxHeight: 50 }} noWrap={false}>{t(condition.tooltip)}</Typography>}
                                            text={t(condition.value)}
                                        /> :
                                            t(condition.value)
                                    }
                                </MenuItem>
                            })}
                        </Select>
                    </FormControl>
                </Box>
                <Box style={{ width: '100%' }} className='textBoxWrapper'>
                    <TextField
                        placeholder={t("siteTracking.placeHolderAddPageUrl")}
                        className={clsx(classes.mt24, classes.textField, classes.fullWidth, classes.endElementNoRadius, pageUrlIsValid === false ? classes.error : pageUrlIsValid !== null ? classes.valid : null)}
                        required
                        fullWidth
                        variant="outlined"
                        id={`input${currentEvent.id}`}
                        onChange={e => updateOperationData(e, "operatorValue", e.target.value)}
                        value={currentEvent && currentEvent.operatorValue}
                        style={{ minWidth: 220, width: '100%' }}
                    />
                </Box>
            </Box>
        </Box>
        <Box className={classes.arrowContainer}>
            {isRTL ? <FaArrowCircleLeft className={classes.contentHead} /> : <FaArrowCircleRight className={classes.contentHead} />}
        </Box>
        <Box className={(classes.eventGroupsContainer)}>
            <Box style={{ width: eventsCount > 1 ? 'calc(100% - 64px)' : '100%' }}>
                <Typography className={clsx(classes.buttonHead)}>
                    {t("siteTracking.addToGroups")}
                </Typography>
                <GroupTags
                    groupSelected={groupSelected}
                    onRemoveGroup={handleRemoveGroup}
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    onShowModal={handleShowGroup}
                    style={{ width: '100%' }}
                    containerStyle={{ paddingBlock: 2 }}
                />
            </Box>
            {eventsCount > 1 && <Box className={classes.deleteButtonContainer}>
                <Button onClick={() => { onDelete() }} className={clsx(classes.btn, classes.btnRounded)}>
                    <BsTrash style={{ width: 30, height: 30, marginInlineStart: 0 }} />
                </Button>
            </Box>
            }
        </Box>
    </Box>
}

export default EventToGroups;