import {
    FormControl, Typography, TextField, Box, Input, Select, MenuItem, Checkbox, ListItemText
} from '@material-ui/core'
import React, { useState } from 'react';
import { useSelector } from 'react-redux'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { eventConditions } from '../../helpers/PulseemArrays'
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'

const PageItem = ({
    classes,
    siteEvent,
    onUpdate = () => null
}) => {
    const { t } = useTranslation();
    const { subAccountGroups } = useSelector((state) => state.sms);
    const { isRTL } = useSelector((state) => state.core);
    const [groupNameSearch, setGroupNameSearch] = useState('');
    const [groupList, setGroupList] = useState([...subAccountGroups]);

    const updateOperationData = (key, value) => {
        siteEvent.metadata[key] = value;
        onUpdate(['metadata', key], value);
    }

    const handleSelectedGroups = (event, selected) => {
        const groupId = parseInt(selected.key.split('$')[1]);
        const val = selected.props.value;
        if (siteEvent.metadata.GroupIds) {
            if (siteEvent.metadata.GroupIds.find((sg) => { return sg.toString() === groupId.toString() }) !== undefined) {
                siteEvent.metadata.GroupIds = siteEvent.metadata.GroupIds.filter((sg) => { return sg.toString() !== groupId.toString() })
            }
            else {
                siteEvent.metadata.GroupIds.push(groupId.toString());
            }
        }
        onUpdate(['metadata', 'GroupIds'], siteEvent.metadata.GroupIds);
    }

    const handleSearch = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const list = [...subAccountGroups].filter((g) => { return g.GroupName.toLowerCase().includes(event.target.value.toLowerCase()) })
        setGroupList(list);
    }

    return <Box className={classes.marginBlock20}>
        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'start' }}>
            <Box>
                <Typography>{t("siteTracking.pageUrl")}</Typography>
                <FormControl variant="outlined"
                    className={clsx(
                        classes.formControl,
                        classes.startElementNoRadius)
                    }
                    style={{ minWidth: 100 }}>
                    <Select
                        id="demo-simple-select-outlined"
                        name={siteEvent.metadata.OperatorKey}
                        value={siteEvent.metadata.OperatorKey}
                        onChange={e => updateOperationData("OperatorKey", e.target.value)}
                        style={{ direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}
                    >
                        {eventConditions.map((condition) => {
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
            <Box>
                <TextField
                    inputProps={{
                        shrink: false
                    }}
                    className={clsx(classes.mt24, classes.textField, classes.fullWidth, classes.endElementNoRadius)}
                    required
                    fullWidth
                    variant="outlined"
                    onChange={e => updateOperationData("OperatorValue", e.target.value)}
                    value={siteEvent.metadata.OperatorValue}
                    style={{ minWidth: 300 }}
                />
            </Box>
            <Box>
                <Box className={clsx(classes.flex, classes.justifyCenterOfCenter, classes.mt25)} style={{ height: 50, minWidth: 80 }}>
                    {isRTL ? <FaArrowCircleLeft className={classes.contentHead} /> : <FaArrowCircleRight className={classes.contentHead} />}
                </Box>
            </Box>
            <Box>
                <Typography>{t("siteTracking.addToGroups")}</Typography>
                <FormControl className={classes.formControl} variant="outlined" style={{ minWidth: 120, maxWidth: 300 }}>
                    <Select
                        className={classes.groupSelect}
                        labelId="demo-mutiple-checkbox-label"
                        id="demo-mutiple-checkbox"
                        multiple
                        value={siteEvent.metadata.GroupIds}
                        onChange={(event, selected) => handleSelectedGroups(event, selected)}
                        renderValue={(selected) => selected.map((s) => {
                            const g = subAccountGroups.find((gr) => { return gr.GroupID.toString() === s.toString() });
                            return g && g.GroupName;
                        }).join(', ')
                        }
                    >
                        <Input
                            autoComplete='off'
                            onChange={handleSearch}
                            placeholder={t('notifications.buttons.search')}
                            id="searchGroup"
                        />

                        {
                            groupList.map((g) => (
                                <MenuItem key={g.GroupID.toString()} value={g.GroupName} className={classes.groupList}>
                                    <Checkbox
                                        checked={siteEvent.metadata.GroupIds.filter((sg) => { return sg.toString() === g.GroupID.toString() }).length > 0}
                                        color="primary"
                                    />
                                    <ListItemText
                                        primary={g.GroupName}
                                    />
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Box>
        </Box>
    </Box >
}

export default PageItem;