import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import GroupTags from '../../components/Groups/GroupTags'
import { EventConditions } from '../../helpers/Constants'
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'
import { Typography, TextField, Box, Button, MenuItem } from '@material-ui/core';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { updateMetaData, deleteMetaData } from '../../redux/reducers/siteTrackingSlice';
import { GroupDialog } from '../../components/Groups/GroupDialog';
import CustomTooltip from '../../components/Tooltip/CustomTooltip';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { IoIosArrowDown } from 'react-icons/io';
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

    return <Box id={currentEvent.id} className={clsx(classes.dFlex, classes.flexWrap, classes.marginBlock20)}
        style={{
            flexDirection: windowSize === 'xs' ? 'column' : 'row',
            maxWidth: 1150
        }}>
        {showGroups()}
        <Box className={classes.flex1}>

            <Box>
                <Typography className={clsx(classes.buttonHead)}>
                    {t("siteTracking.pageUrl")}
                </Typography>
            </Box>
            <Box
                className={clsx(classes.eventPageContainer, classes.flexWrap)}
                style={{ width: '100%' }}
            >
                <Box className={clsx('selectWrapper', { [classes.w100]: windowSize === 'xs' })}>
                    <FormControl
                        variant="standard"
                        className={clsx(classes.selectInputFormControl)}
                        style={{ minWidth: 100, marginTop: 12, width: windowSize === 'xs' ? '100%' : 'auto' }}
                    >
                        <Select
                            name={currentEvent && currentEvent.operatorKey}
                            value={currentEvent && currentEvent.operatorKey}
                            onChange={e => updateOperationData(e, "operatorKey", e.target.value)}
                            style={{ direction: isRTL ? 'rtl' : 'ltr', maxHeight: 57 }}
                            className={clsx('bottomAlignedSelect', classes.p10)}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            PaperProps={{
                                style: {
                                    transform: 'translateX(10px) translateY(50px)',
                                }
                            }}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left"
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left"
                                },
                                getContentAnchorEl: null
                            }}
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
                <Box style={{ width: '100%' }} className={clsx('textBoxWrapper', classes.dFlex, classes.flex1, classes.paddingSides15)}>
                    <TextField
                        placeholder={t("siteTracking.placeHolderAddPageUrl")}
                        className={clsx(classes.mt24, classes.textField, classes.fullWidth, classes.endElementNoRadius, pageUrlIsValid === false ? classes.error : pageUrlIsValid !== null ? classes.valid : null)}
                        required
                        fullWidth
                        variant="outlined"
                        id={`input${currentEvent.id}`}
                        onChange={e => updateOperationData(e, "operatorValue", e.target.value)}
                        value={currentEvent && currentEvent.operatorValue}
                        style={{ minWidth: windowSize === 'xs' ? 220 : '100%', width: '100%' }}
                    />
                </Box>
            </Box>
        </Box>
        <Box className={(classes.arrowContainer)}>
            {isRTL ? <FaArrowCircleLeft className={classes.contentHead} /> : <FaArrowCircleRight className={classes.contentHead} />}
        </Box>

        <Box className={clsx(classes.eventGroupsContainer, classes.flex1, { [classes.mt2]: windowSize === 'sm' || windowSize === 'xs' })}>
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
                    style={{ width: '100%', paddingTop: '24px' }}
                    containerStyle={{ paddingBlock: 2 }}
                />
            </Box>
            {eventsCount > 1 && <Box className={classes.deleteButtonContainer}>
                <Button onClick={() => { onDelete() }} className={clsx(classes.btn, classes.btnRounded)}>
                    <BsTrash style={{ width: 20, height: 20, marginInlineStart: 0 }} />
                </Button>
            </Box>
            }
        </Box>
    </Box>
}

export default EventToGroups;