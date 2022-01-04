import {
    FormControl, Typography, TextField, Box, Select, MenuItem
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
    const { isRTL, windowSize } = useSelector((state) => state.core);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [pageUrlIsValid, setPageUrlIsValid] = useState(null);

    // const setMetaData = () => {
    //     if (!siteEvent.metadata) {
    //         siteEvent['metadata'] = {};
    //         siteEvent['metadata']['groupIds'] = [];
    //     }
    // }
    const updateOperationData = (key, value) => {
        setPageUrlIsValid(value !== '');
        //setMetaData();
        siteEvent.metadata[key] = value;
        onUpdate(['metadata', key], value);
    }

    useEffect(() => {
        //setMetaData();
        if (subAccountGroups && subAccountGroups.length > 0) {
            setSelectedGroups(subAccountGroups.filter((g) => { return siteEvent.metadata.groupIds && siteEvent.metadata.groupIds.includes(g.GroupID.toString()) }));
        }
    }, [siteEvent]);

    const handleSelectedGroups = (group, exists) => {
        if (exists === true) {
            siteEvent.metadata.groupIds = siteEvent.metadata.groupIds.filter((sg) => { return sg.toString() !== group.GroupID.toString() })
        }
        else {
            siteEvent.metadata.groupIds.push(group.GroupID.toString());
        }
        onUpdate(['metadata', 'GroupIds'], siteEvent.metadata.groupIds);
        setSelectedGroups(subAccountGroups.filter((g) => { return siteEvent.metadata.groupIds.includes(g.GroupID.toString()) }));
    }

    return siteEvent && <Box className={classes.marginBlock20} style={{ display: 'flex', flexDirection: windowSize === 'xs' ? 'column' : 'row' }}>
        <Box style={{ display: 'flex', flexDirection: 'row' }}>
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
                        name={siteEvent.metadata && siteEvent.metadata.operatorKey}
                        value={siteEvent.metadata && siteEvent.metadata.operatorKey}
                        onChange={e => updateOperationData("operatorKey", e.target.value)}
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
                    className={clsx(classes.mt24, classes.textField, classes.fullWidth, classes.endElementNoRadius, pageUrlIsValid === false ? classes.error : pageUrlIsValid !== null ? classes.valid : null)}
                    required
                    fullWidth
                    variant="outlined"
                    onChange={e => updateOperationData("operatorValue", e.target.value)}
                    value={siteEvent.metadata && siteEvent.metadata.operatorValue}
                    style={{ minWidth: 220 }}
                />
            </Box>
        </Box>
        <Box style={{ display: 'flex', flexDirection: 'row' }}>
            <Box>
                <Box className={clsx(classes.flex, classes.justifyCenterOfCenter, classes.mt25)} style={{ height: 50, minWidth: 80 }}>
                    {isRTL ? <FaArrowCircleLeft className={classes.contentHead} /> : <FaArrowCircleRight className={classes.contentHead} />}
                </Box>
            </Box>
            <Box>
                <Typography>{t("siteTracking.addToGroups")}</Typography>
                <CheckboxGroups
                    style={{ maxWidth: windowSize === 'xs' ? 262 : null }}
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