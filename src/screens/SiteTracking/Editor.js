import React from 'react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import DefaultScreen from '../DefaultScreen'
import { Loader } from '../../components/Loader/Loader'
import { useTranslation } from 'react-i18next';
import Title from '../../components/Wizard/Title'
import {
    FormControl, Typography, Button, TextField, Grid, Box, Divider, Link, Select, MenuItem, Checkbox, ListItemText, Input
} from '@material-ui/core'

const SiteTrackingEditor = ({ classes, ...props }) => {
    const [showLoader, setShowLoader] = useState(true);
    const [pages, setPages] = useState([
        { Id: 0, PageURL: "", operator: { key: 1, value: "siteTracking.conditions.contains" }, selectedGroups: [] }
    ]);
    const pageTemplate = { Id: pages.length, PageURL: "", operator: { key: 1, value: "siteTracking.conditions.contains" }, selectedGroups: [] };
    const { t } = useTranslation();
    const eventConditions = [
        { key: 1, value: "siteTracking.conditions.contains" },
        { key: 2, value: "siteTracking.conditions.exact" },
        { key: 3, value: "siteTracking.conditions.notContain" }
    ]
    const groups = [{ id: 0, name: "Group 1" }, { id: 1, name: "Group 2" }, { id: 2, name: "Group 3" }, { id: 3, name: "Group 4" }]

    useEffect(() => {
        getData();
    });

    const getData = async () => {
        await setTimeout(() => {
            setShowLoader(false);
        }, 1000);
    }

    const onAddPage = () => {
        setPages([...pages, pageTemplate]);
    }
    const onRemovePage = (pageId) => {
        let newArr = pages.filter((p) => { return p.Id !== pageId })
        setPages(newArr);
    }

    const AddPage = () => {
        return <Box className={classes.mt25}>
            + <Link onClick={onAddPage} style={{ cursor: 'pointer' }}>{t("siteTracking.addPageUrl")}</Link>
        </Box>
    }

    const validateUrl = (event) => {
        console.log(event);
    }

    const handleConditionSelect = (event, pageId) => {
        let newArr = [...pages];
        const pageItem = newArr.filter((p) => { return p.Id === pageId })[0]
        pageItem.operator.key = event.target.name;
        pageItem.operator.value = event.target.value;

        setPages(newArr);

    }

    const handleSelectedGroups = (event, pageId, selected) => {
        const key = parseInt(selected.key.split('$')[1]);
        const val = selected.props.value;
        let newArr = [...pages];
        const pageItem = newArr.filter((p) => { return p.Id === pageId })[0]
        if (pageItem.selectedGroups) {
            if (pageItem.selectedGroups.find((sg) => { return sg.id === key }) !== undefined) {
                pageItem.selectedGroups = pageItem.selectedGroups.filter((sg) => { return sg.id !== key })
            }
            else {
                pageItem.selectedGroups.push({ id: parseInt(key), name: val });
            }
        }


        setPages(newArr);
    }

    const PageItem = ({ page, index }) => {
        return <Box className={classes.marginBlock20}>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'start' }}>
                <Box>
                    <Typography>{t("siteTracking.pageUrl")}</Typography>
                    <TextField
                        inputProps={{
                            shrink: false
                        }}
                        className={clsx(classes.textField, classes.fullWidth)}
                        required
                        fullWidth
                        variant="outlined"
                        onChange={validateUrl}
                        value={page && page.PageURL}
                        style={{ minWidth: 300 }}
                    />
                </Box>
                <Box>
                    <FormControl variant="outlined"
                        className={clsx(classes.formControl,
                            classes.ml5,
                            classes.mr5,
                            classes.mt25)}
                        style={{ minWidth: 100 }}>
                        <Select
                            id="demo-simple-select-outlined"
                            name={page && page.operator && page.operator.key}
                            value={page && page.operator && page.operator.value}
                            onChange={event => handleConditionSelect(event, page.Id)}
                        >
                            {eventConditions.map((condition) => {
                                return <MenuItem value={condition.value} name={t(condition.key)}>{t(condition.value)}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                </Box>
                <Box className={clsx(classes.mr10, classes.ml10)}>
                    <Typography>{t("siteTracking.selectGroups")}</Typography>
                    <FormControl className={classes.formControl} variant="outlined">
                        <Select
                            labelId="demo-mutiple-checkbox-label"
                            id="demo-mutiple-checkbox"
                            multiple
                            value={page && page.selectedGroups}
                            onChange={(event, selected) => handleSelectedGroups(event, page.Id, selected)}
                            renderValue={(selected) => selected.map((s) => { return s.name }).join(', ')}
                        >
                            {groups.map((g) => (
                                <MenuItem key={g.id} value={g.name}>
                                    <Checkbox checked={page && page.selectedGroups.filter((sg) => { return sg.id === g.id }).length > 0} />
                                    <ListItemText primary={g.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {index > 0 && <Box style={{ alignItems: 'center', height: 100, display: 'flex', padding: '0 10px' }}>
                    <Link style={{ cursor: 'pointer' }} onClick={() => onRemovePage(page.Id)}>X</Link>
                </Box>}
            </Box>
        </Box>
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
                        <TextField
                            placeholder={t('siteTracking.addDomain')}
                            inputProps={{
                                shrink: false
                            }}
                            className={clsx(classes.textField, classes.fullWidth)}
                            required
                            fullWidth
                            variant="outlined"
                            onChange={validateUrl}
                        />
                        <Button
                            variant='contained'
                            className={clsx(
                                classes.ml5,
                                classes.mr5,
                                classes.actionButton,
                                classes.actionButtonLightGreen)}
                            onClick={() => onSaveDomain()}
                            style={{ height: '100%', minWidth: 100 }}
                        >{t('common.Save')}</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography className={clsx(classes.marginBlock20)}>{t("siteTracking.eventToTrack")}</Typography>
                        {
                            pages && pages.map((p, idx) => {
                                return (<PageItem page={p} index={idx} key={idx} />)
                            })
                        }
                        <AddPage />
                    </Grid>
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
