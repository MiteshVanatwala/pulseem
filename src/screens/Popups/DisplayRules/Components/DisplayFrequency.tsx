import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    Box,
} from '@material-ui/core';
import {
    ToggleButton,
    ToggleButtonGroup
} from '@material-ui/lab';
import {
    People as PeopleIcon,
    PersonAdd as PersonAddIcon,
    PersonPin as PersonPinIcon,
    Today as TodayIcon,
    EventNote as EventNoteIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface Props {
    classes: any;
}

const DisplayFrequency: React.FC<Props> = ({ classes }) => {
    const { t } = useTranslation();
    const [targetAudience, setTargetAudience] = useState('all');
    const [displaySchedule, setDisplaySchedule] = useState('daily');
    const [everyXDays, setEveryXDays] = useState(3);

    const handleTargetAudienceChange = (event: React.MouseEvent<HTMLElement>, newAudience: string | null) => {
        if (newAudience !== null) {
            setTargetAudience(newAudience);
        }
    };

    const handleDisplayScheduleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDisplaySchedule(event.target.value);
    };

    return (
        <Box mt={4}>
            <Paper className={classes.paperPopupTrigger}>
                <Box mb={4} pb={10} className={clsx(classes.topHeaderPopupTrigger, classes.p10)} >
                    <Typography variant="h5" className={classes.bold} gutterBottom>
                        {t('PopupTriggers.displayFrequency.title')}
                    </Typography>
                    <Typography variant="body1" className={classes.subtitlePopupTrigger}>
                        {t('PopupTriggers.displayFrequency.description')}
                    </Typography>
                </Box>

                <Box mb={4} mx={4}>
                    <Typography variant="h6" className={classes.sectionTitlePopupTrigger}>
                        {t('PopupTriggers.displayFrequency.targetAudience.title')}
                    </Typography>
                    <ToggleButtonGroup
                        value={targetAudience}
                        exclusive
                        onChange={handleTargetAudienceChange}
                        className={clsx(classes.toggleButtonGroupPopupTrigger, classes.p5)}
                    >
                        <ToggleButton value="all" className={classes.toggleButtonPopupTrigger}>
                            <PeopleIcon />
                            {t('PopupTriggers.displayFrequency.targetAudience.allVisitors')}
                        </ToggleButton>
                        <ToggleButton value="new" className={classes.toggleButtonPopupTrigger}>
                            <PersonAddIcon />
                            {t('PopupTriggers.displayFrequency.targetAudience.newVisitors')}
                        </ToggleButton>
                        <ToggleButton value="returning" className={classes.toggleButtonPopupTrigger}>
                            <PersonPinIcon />
                            {t('PopupTriggers.displayFrequency.targetAudience.returningVisitors')}
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="body1" color="textSecondary" display="block">
                        {t('PopupTriggers.displayFrequency.targetAudience.caption')}
                    </Typography>
                </Box>

                <Box pb={4} mx={4} mb={4}>
                    <Typography variant="h6" className={classes.sectionTitlePopupTrigger}>
                        {t('PopupTriggers.displayFrequency.displaySchedule.title')}
                    </Typography>
                    <RadioGroup value={displaySchedule} onChange={handleDisplayScheduleChange}>
                        <Box mb={2}>
                            <FormControlLabel
                                value="daily"
                                control={<Radio color="secondary" />}
                                label={
                                    <Box display="flex" flexGrow={1} alignItems="center" justifyContent="space-between">
                                        <div>
                                            <Typography variant='h6' className={classes.bold}>{t('PopupTriggers.displayFrequency.displaySchedule.oncePerDay.title')}</Typography>
                                            <Typography variant="body1">{t('PopupTriggers.displayFrequency.displaySchedule.oncePerDay.description')}</Typography>
                                        </div>
                                        <TodayIcon className={classes.radioIconPopupTrigger} />
                                    </Box>
                                }
                                classes={{ label: classes.radioLabelContainerPopupTrigger }}
                                className={`${classes.radioLabelPopupTrigger} ${displaySchedule === 'daily' ? 'selected' : ''}`}
                            />
                        </Box>
                        <Box mb={2}>
                            <FormControlLabel
                                value="everyXDays"
                                control={<Radio color="secondary" />}
                                label={
                                    <Box display="flex" flexGrow={1} alignItems="center" justifyContent="space-between">
                                        <Box display="flex" flexDirection="column">
                                            <Typography variant='h6' className={clsx(classes.bold, classes.pb5)}>{t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.main')}</Typography>
                                            <div className={classes.inputContainerPopupTrigger}>
                                                <Typography>{t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.prefix')}</Typography>
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    className={classes.textFieldPopupTrigger}
                                                    value={everyXDays}
                                                    onChange={(e) => setEveryXDays(Number(e.target.value))}
                                                    disabled={displaySchedule !== 'everyXDays'}
                                                    type="number"
                                                />
                                                <Typography>{t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.suffix')}</Typography>
                                            </div>
                                        </Box>
                                        <EventNoteIcon className={classes.radioIconPopupTrigger} />
                                    </Box>
                                }
                                classes={{ label: classes.radioLabelContainerPopupTrigger }}
                                className={`${classes.radioLabelPopupTrigger} ${displaySchedule === 'everyXDays' ? 'selected' : ''}`}
                            />
                        </Box>
                        <Box>
                            <FormControlLabel
                                value="everyVisit"
                                control={<Radio color="secondary" />}
                                label={
                                    <Box display="flex" flexGrow={1} alignItems="center" justifyContent="space-between">
                                        <div>
                                            <Typography variant='h6' className={classes.bold}>{t('PopupTriggers.displayFrequency.displaySchedule.everyVisit.title')}</Typography>
                                            <Typography variant="body1">{t('PopupTriggers.displayFrequency.displaySchedule.everyVisit.description')}</Typography>
                                        </div>
                                        <span className={classes.infinityIcon}>∞</span>
                                    </Box>
                                }
                                classes={{ label: classes.radioLabelContainerPopupTrigger }}
                                className={`${classes.radioLabelPopupTrigger} ${displaySchedule === 'everyVisit' ? 'selected' : ''}`}
                            />
                        </Box>
                    </RadioGroup>
                    <Typography variant="body1"  color="textSecondary" display="block" className={classes.mt2}>
                        {t('PopupTriggers.displayFrequency.displaySchedule.caption')}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default DisplayFrequency;