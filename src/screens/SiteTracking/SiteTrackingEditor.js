import React from 'react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import DefaultScreen from '../DefaultScreen'
import { Loader } from '../../components/Loader/Loader'
import { useTranslation } from 'react-i18next';
import Title from '../../components/Wizard/Title'
import {
    Typography, Button, TextField, Grid, Box, FormControlLabel,
    FormLabel, FormControl, Select, MenuItem, Radio, RadioGroup
} from '@material-ui/core'
import PageItem from './PageItem'
import { eventsOptions, domainProtocol } from '../../helpers/PulseemArrays'
import { getGroupsBySubAccountId } from "../../redux/reducers/smsSlice";
import { useDispatch, useSelector } from 'react-redux'
import { get, create, updateEvent } from '../../redux/reducers/siteTrackingSlice';
import { EventRequestModel, SiteTrackingModel } from '../../model/SiteTracking/SiteTrackingModel';

const SiteTrackingEditor = ({ classes, ...props }) => {
    const [model, setModel] = useState(new SiteTrackingModel());
    const [showLoader, setShowLoader] = useState(true);
    const [protocol, setDomainProtocol] = useState('https://');
    const { t } = useTranslation();
    const dispatch = useDispatch();
    //const { event } = useSelector(state => state.siteTracking);

    useEffect(() => {
        getData();
    }, [dispatch]);

    const getData = async () => {
        await dispatch(getGroupsBySubAccountId());
        const response = await dispatch(get(EventRequestModel.PageView));
        setModel(response.payload);
        setShowLoader(false);
    }


    const handleDomainProtocol = (event) => {
        setDomainProtocol(event.target.value);
    }

    const handleModelChange = (name, value) => {
        setModel(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // const updateSiteEventValue = (name, value) => {
    //     const e = { ...event };
    //     e[name] = value;
    //     dispatch(updateEvent(e));
    //     return
    // }
    const deepUpdate = (keys, value) => {
        let e = { ...model };
        if (e[keys[0]] && e[keys[0]][keys[1]]) {
            e[keys[0]][keys[1]] = value;
        }
        else {
            e[keys] = value;
        }
        setModel(e);
        //dispatch(updateEvent(e));
    }

    const validateUrl = (event) => {
        console.log(event.target.value);
    }

    const TrackingForm = () => {

        const onSaveDomain = () => {
            console.log('save domain');
        }
        return <Box>
            <form className={classes.root} noValidate autoComplete="off">
                <Grid container alignItems="center">
                    <Grid item xs={12}>
                        <Typography className={clsx(classes.marginBlock20)}>{t("siteTracking.siteToTrack")}</Typography>
                        <Typography className={clsx(classes.mt10)}>{t("siteTracking.yourDomain")}</Typography>
                    </Grid>
                    <Grid item xs={6} className={clsx(classes.flex)} style={{ height: 55 }}>
                        <FormControl variant="outlined"
                            className={clsx(
                                classes.formControl,
                                classes.startElementNoRadius)
                            }
                            style={{ minWidth: 120 }}>
                            <Select
                                id="drpSelectDomainProtocol"
                                name="drpSelectDomainProtocol"
                                value={protocol}
                                onChange={(e) => handleDomainProtocol(e)}
                            >
                                {domainProtocol.map((protocol) => {
                                    return <MenuItem key={protocol.key} value={protocol.name}>
                                        {protocol.name}
                                    </MenuItem>
                                })}
                            </Select>
                        </FormControl>
                        <TextField
                            placeholder={t('siteTracking.addDomain')}
                            inputProps={{
                                shrink: false
                            }}
                            className={clsx(classes.textField, classes.fullWidth, classes.endElementNoRadius)}
                            required
                            fullWidth
                            variant="outlined"
                            onChange={(e) => handleModelChange("pageURL", e.target.value)}
                            value={model.pageURL}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography className={clsx(classes.marginBlock20)}>{t("siteTracking.eventToTrack")}</Typography>
                        <Box>
                            <FormControl component="fieldset">
                                <RadioGroup aria-label="eventName" name="eventName" value={model.eventName}>
                                    {
                                        eventsOptions.map((eo, idx) => {
                                            return <FormControlLabel key={idx} value={t(eo.value).trim().replace(' ', '')} labelPlacement="end"
                                                control={<Radio
                                                    color="primary"
                                                    onSelect={() => deepUpdate(['metadata', 'OperatorKey'], t(eo.value).trim().replace(' ', ''))}
                                                    onChange={() => deepUpdate(['metadata', 'OperatorKey'], t(eo.value).trim().replace(' ', ''))}
                                                />}
                                                label={t(eo.value)} />
                                        })
                                    }
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        {
                            model && <PageItem siteEvent={model} onUpdate={handleModelChange} classes={classes} />
                        }
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant='contained'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen)}
                        onClick={() => onSaveDomain()}
                        style={{ height: '100%', minWidth: 100 }}
                    >{t('common.Save')}</Button>
                </Grid>
            </form>
        </Box>
    }

    return <DefaultScreen
        currentPage='SiteTracking'
        classes={classes}
        containerClass={classes.management}>
        <Title title={t("siteTracking.title")}
            classes={classes}
            subTitle={t("siteTracking.setUp")}
            topZero={false}
        />
        <TrackingForm />
        <Loader isOpen={showLoader} />
    </DefaultScreen>
}

export default SiteTrackingEditor;
