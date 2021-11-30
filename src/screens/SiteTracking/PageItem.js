import {
    FormControl, Typography, TextField, Box, Link, Select, MenuItem, Checkbox, ListItemText
} from '@material-ui/core'
import React from 'react';
import { useSelector } from 'react-redux'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { eventConditions } from '../../helpers/PulseemArrays'

const PageItem = ({
    classes,
    siteEvent,
    onUpdate = () => null
}) => {

    const { t } = useTranslation();
    const { subAccountGroups } = useSelector((state) => state.sms);
    const { isRTL } = useSelector((state) => state.core);

    const validateUrl = (event) => {
        console.log(event);
    }
    const handleConditionSelect = (event) => {
        siteEvent.metadata.OperatorKey = event.target.value;
        onUpdate(siteEvent);
    }
    const handleSelectedGroups = (event, selected) => {
        console.log(event);
        console.log(selected);
        const key = parseInt(selected.key.split('$')[1]);
        const val = selected.props.value;
        if (siteEvent.metadata.GroupIds) {
            if (siteEvent.metadata.GroupIds.find((sg) => { return sg === key }) !== undefined) {
                siteEvent.metadata.GroupIds = siteEvent.metadata.GroupIds.filter((sg) => { return sg !== key })
            }
            else {
                siteEvent.metadata.GroupIds.push(parseInt(key));
            }
        }

        onUpdate(siteEvent);
    }

    return <Box className={classes.marginBlock20}>
        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'start' }}>
            <Box>
                <Typography>{t("siteTracking.pageUrl")}</Typography>
                <TextField
                    inputProps={{
                        shrink: false
                    }}
                    className={clsx(classes.textField, classes.fullWidth, classes.startElementNoRadius)}
                    required
                    fullWidth
                    variant="outlined"
                    onChange={validateUrl}
                    value={siteEvent.metadata.OperatorValue}
                    style={{ minWidth: 300 }}
                />
            </Box>
            <Box>
                <FormControl variant="outlined"
                    className={clsx(
                        classes.formControl,
                        classes.mt24,
                        classes.endElementNoRadius)
                    }
                    style={{ minWidth: 100 }}>
                    <Select
                        id="demo-simple-select-outlined"
                        name={siteEvent.metadata.OperatorKey}
                        value={siteEvent.metadata.OperatorKey}
                        onChange={event => handleConditionSelect(event)}
                    >
                        {eventConditions.map((condition) => {
                            return <MenuItem
                                key={condition.key}
                                value={condition.value}
                                name={t(condition.key)}
                                selected={siteEvent.metadata.OperatorKey.toLowerCase() === t(condition.value).toLowerCase()}
                            >{t(condition.value)}
                            </MenuItem>
                        })}
                    </Select>
                </FormControl>
            </Box>
            <Box className={clsx(classes.mr10, classes.ml10)}>
                <Typography>{t("siteTracking.selectGroups")}</Typography>
                <FormControl className={classes.formControl} variant="outlined">
                    <Select
                        className={classes.groupSelect}
                        labelId="demo-mutiple-checkbox-label"
                        id="demo-mutiple-checkbox"
                        multiple
                        value={siteEvent.metadata.GroupIds}
                        onChange={(event, selected) => handleSelectedGroups(event, selected)}
                        renderValue={(selected) => selected.map((s) => { return s }).join(', ')}
                    >
                        {subAccountGroups.map((g) => (
                            <MenuItem key={g.GroupID} value={g.GroupName} className={classes.groupList}>
                                <Checkbox checked={siteEvent.metadata.GroupIds.filter((sg) => { return sg === g.GroupID }).length > 0} />
                                <ListItemText primary={g.GroupName} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    </Box>
}

export default PageItem;