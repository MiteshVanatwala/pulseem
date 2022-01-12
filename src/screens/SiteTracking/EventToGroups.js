import clsx from 'clsx';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import GroupTags from '../../components/Groups/GroupTags'
import { EventConditions } from '../../helpers/PulseemArrays'
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'
import { FormControl, Typography, TextField, Box, Select, MenuItem } from '@material-ui/core'

const EventToGroups = ({
    classes,
    siteEvent,
    onUpdate = () => null,
    onShowGroups = () => null
}) => {
    const { t } = useTranslation();
    const { subAccountGroups } = useSelector((state) => state.sms);
    const { isRTL, windowSize } = useSelector((state) => state.core);
    const [pageUrlIsValid, setPageUrlIsValid] = useState(null);

    const updateOperationData = (e, key, value) => {
        e.preventDefault();
        setPageUrlIsValid(value !== '');
        siteEvent.metadata[key] = value;
        onUpdate(['metadata', key], value);
    }

    return <Box className={classes.marginBlock20} style={{ display: 'flex', flexDirection: windowSize === 'xs' ? 'column' : 'row', justifyContent: 'space-between', width: '100%' }}>
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
                        name={siteEvent.metadata && siteEvent.metadata.operatorKey}
                        value={siteEvent.metadata && siteEvent.metadata.operatorKey}
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
                    value={siteEvent.metadata && siteEvent.metadata.operatorValue}
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
                {subAccountGroups && subAccountGroups.length > 0 && <GroupTags
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    onShowModal={onShowGroups}
                    style={{ width: windowSize === 'xs' ? 320 : 460 }}
                />}
            </Box>
        </Box>
    </Box >
}

export default EventToGroups;