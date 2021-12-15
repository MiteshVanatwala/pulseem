import {
    FormControl, Typography, TextField, Box, Input, Select, MenuItem, Checkbox, ListItemText
} from '@material-ui/core'
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { eventConditions } from '../../helpers/PulseemArrays'
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'
import CheckboxGroups from '../../components/Groups/CheckboxGroups';

const PageItem = ({
    classes,
    siteEvent,
    onUpdate = () => null
}) => {
    const { t } = useTranslation();
    const { subAccountGroups } = useSelector((state) => state.sms);
    const { isRTL } = useSelector((state) => state.core);
    const [selectedGroups, setSelectedGroups] = useState([]);

    const updateOperationData = (key, value) => {
        siteEvent.metadata[key] = value;
        onUpdate(['metadata', key], value);
    }

    useEffect(() => {
        setSelectedGroups(subAccountGroups.filter((g) => { return siteEvent.metadata.GroupIds.includes(g.GroupID.toString()) }));
    }, [siteEvent]);

    const handleSelectedGroups = (group, exists) => {
        if (exists) {
            siteEvent.metadata.GroupIds = siteEvent.metadata.GroupIds.filter((sg) => { return sg.toString() !== group.GroupID.toString() })
        }
        else {
            siteEvent.metadata.GroupIds.push(group.GroupID.toString());
        }
        onUpdate(['metadata', 'GroupIds'], siteEvent.metadata.GroupIds);
        setSelectedGroups(subAccountGroups.filter((g) => { return siteEvent.metadata.GroupIds.includes(g.GroupID.toString()) }));
    }

    return siteEvent && <Box className={classes.marginBlock20}>
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
                <CheckboxGroups
                    classes={classes}
                    groups={subAccountGroups}
                    selectedGroups={selectedGroups}
                    onSelect={handleSelectedGroups}
                    labelText={t('siteTracking.typeGroupName')}
                />
            </Box>
        </Box>
    </Box >
}

export default PageItem;