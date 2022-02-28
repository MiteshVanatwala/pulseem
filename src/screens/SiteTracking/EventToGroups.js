import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import GroupTags from '../../components/Groups/GroupTags'
import { EventConditions } from '../../helpers/PulseemArrays'
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'
import { FormControl, Typography, TextField, Box, Select, MenuItem, Button } from '@material-ui/core'
import { updateMetaData, deleteMetaData, getCurrentEventGroups } from '../../redux/reducers/siteTrackingSlice';
import { Dialog } from '../../components/managment/index';
import { GroupDialog } from '../../components/Groups/GroupDialog';
import { DeleteIcon } from '../../assets/images/managment/index'

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
    }, [currentEvent]);

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
            <Dialog
                classes={classes}
                open={showGroupsDialog}
                onClose={() => { setShowGroupsDialog(false) }}
                {...dialog}>
                {dialog.content}
            </Dialog>
        )
    }
    const handleShowGroup = () => {
        setShowGroupsDialog(true);
    }

    const onDelete = () => {
        dispatch(deleteMetaData(currentEvent.id));
    }

    return <Box id={currentEvent.id} className={classes.marginBlock20} style={{ display: 'flex', flexDirection: windowSize === 'xs' ? 'column' : 'row', justifyContent: 'space-between', width: '100%' }}>
        {showGroups()}
        <Box style={{ display: 'flex', flexDirection: 'row', width: '50%' }}>
            <Box>
                <Typography className={clsx(classes.buttonHead)}>
                    {t("siteTracking.pageUrl")}
                </Typography>
                <FormControl variant="outlined"
                    className={clsx(
                        classes.formControl,
                        classes.startElementNoRadius)
                    }
                    style={{ minWidth: 100 }}>
                    <Select
                        id="demo-simple-select-outlined"
                        name={currentEvent && currentEvent.operatorKey}
                        value={currentEvent && currentEvent.operatorKey}
                        onChange={e => updateOperationData(e, "operatorKey", e.target.value)}
                        style={{ direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}
                    >
                        {EventConditions.map((condition) => {
                            return <MenuItem
                                key={condition.key}
                                value={condition.key}
                                name={condition.key}
                            >{t(condition.value)}
                            </MenuItem>
                        })}
                    </Select>
                </FormControl>
            </Box>
            <Box style={{ width: '100%' }}>
                <TextField
                    inputProps={{
                        shrink: false
                    }}
                    placeholder={t("siteTracking.placeHolderAddPageUrl")}
                    className={clsx(classes.mt24, classes.textField, classes.fullWidth, classes.endElementNoRadius, pageUrlIsValid === false ? classes.error : pageUrlIsValid !== null ? classes.valid : null)}
                    required
                    fullWidth
                    variant="outlined"
                    onChange={e => updateOperationData(e, "operatorValue", e.target.value)}
                    value={currentEvent && currentEvent.operatorValue}
                    style={{ minWidth: 220, width: '100%', marginTop: 40 }}
                />
            </Box>
        </Box>
        <Box>
            <Box className={clsx(classes.flex, classes.justifyCenterOfCenter, classes.arrowContainer)}>
                {isRTL ? <FaArrowCircleLeft className={classes.contentHead} /> : <FaArrowCircleRight className={classes.contentHead} />}
            </Box>
        </Box>
        <Box style={{ display: 'flex', width: '100%' }}>
            <Box>
                <Typography className={clsx(classes.buttonHead)}>
                    {t("siteTracking.addToGroups")}
                </Typography>
                <GroupTags
                    groupSelected={groupSelected}
                    onRemoveGroup={handleRemoveGroup}
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    onShowModal={handleShowGroup}
                    style={{ width: windowSize === 'xs' ? 320 : 460 }}
                />
            </Box>
            {eventsCount > 1 && <Box className={classes.deleteButtonContainer}>
                <Button onClick={() => { onDelete() }}>
                    <img src={DeleteIcon} alt="" style={{ width: 30, height: 30, cursor: 'pointer' }} />
                </Button>
            </Box>
            }
        </Box>
    </Box>
}

export default EventToGroups;