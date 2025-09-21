import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    Box,
    useTheme,
    useMediaQuery,
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        <Box mt={isMobile ? 2 : 4}>
            <Paper className={classes.paperPopupTrigger}>
                <Box
                    mb={isMobile ? 2 : 4}
                    pb={isMobile ? 5 : 10}
                    className={clsx(classes.topHeaderPopupTrigger, classes.p10)}
                    px={isMobile ? 2 : undefined}
                >
                    <Typography
                        variant="body1"
                        className={clsx(classes.managementTitle, classes.font20)}
                        gutterBottom
                    >
                        {t('PopupTriggers.displayFrequency.title')}
                    </Typography>
                    <Typography
                        variant={isMobile ? "body2" : "body1"}
                        className={classes.subtitlePopupTrigger}
                    >
                        {t('PopupTriggers.displayFrequency.description')}
                    </Typography>
                </Box>

                <Box
                    mb={isMobile ? 2 : 4}
                    mx={isMobile ? 2 : 4}
                >
                    <Typography
                        variant="body1"
                        className={clsx(classes.managementTitle, classes.pb10)}
                    >
                        {t('PopupTriggers.displayFrequency.targetAudience.title')}
                    </Typography>
                    <ToggleButtonGroup
                        value={targetAudience}
                        exclusive
                        onChange={handleTargetAudienceChange}
                        className={clsx(classes.toggleButtonGroupPopupTrigger, classes.p5)}
                        orientation={isMobile ? "vertical" : "horizontal"}
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                        }}
                    >
                        <ToggleButton
                            value="all"
                            className={classes.toggleButtonPopupTrigger}
                            style={{
                                width: isMobile ? '100%' : 'auto',
                                minHeight: isMobile ? '48px' : 'auto',
                                marginBottom: isMobile ? '8px' : '0',
                                fontSize: isMobile ? '0.875rem' : 'inherit',
                                padding: isMobile ? '12px 16px' : undefined,
                                justifyContent: isMobile ? 'flex-start' : 'center',
                            }}
                        >
                            <PeopleIcon style={{ marginRight: isMobile ? '12px' : '8px' }} />
                            {t('PopupTriggers.displayFrequency.targetAudience.allVisitors')}
                        </ToggleButton>
                        <ToggleButton
                            value="new"
                            className={classes.toggleButtonPopupTrigger}
                            style={{
                                width: isMobile ? '100%' : 'auto',
                                minHeight: isMobile ? '48px' : 'auto',
                                marginBottom: isMobile ? '8px' : '0',
                                fontSize: isMobile ? '0.875rem' : 'inherit',
                                padding: isMobile ? '12px 16px' : undefined,
                                justifyContent: isMobile ? 'flex-start' : 'center',
                            }}
                        >
                            <PersonAddIcon style={{ marginRight: isMobile ? '12px' : '8px' }} />
                            {t('PopupTriggers.displayFrequency.targetAudience.newVisitors')}
                        </ToggleButton>
                        <ToggleButton
                            value="returning"
                            className={classes.toggleButtonPopupTrigger}
                            style={{
                                width: isMobile ? '100%' : 'auto',
                                minHeight: isMobile ? '48px' : 'auto',
                                fontSize: isMobile ? '0.875rem' : 'inherit',
                                padding: isMobile ? '12px 16px' : undefined,
                                justifyContent: isMobile ? 'flex-start' : 'center',
                            }}
                        >
                            <PersonPinIcon style={{ marginRight: isMobile ? '12px' : '8px' }} />
                            {t('PopupTriggers.displayFrequency.targetAudience.returningVisitors')}
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography
                        variant={isMobile ? "body2" : "body1"}
                        className={classes.grayTextCell}
                        display="block"
                        style={{ marginTop: isMobile ? '12px' : '8px' }}
                    >
                        {t('PopupTriggers.displayFrequency.targetAudience.caption')}
                    </Typography>
                </Box>

                <Box
                    pb={isMobile ? 2 : 4}
                    mx={isMobile ? 2 : 4}
                    mb={isMobile ? 2 : 4}
                >
                    <Typography
                        variant="body1"
                        className={clsx(classes.pb10, classes.managementTitle)}
                    >
                        {t('PopupTriggers.displayFrequency.displaySchedule.title')}
                    </Typography>
                    <RadioGroup value={displaySchedule} onChange={handleDisplayScheduleChange}>
                        <Box mb={isMobile ? 1.5 : 2}>
                            <FormControlLabel
                                value="daily"
                                control={<Radio color="secondary" />}
                                label={
                                    <Box
                                        display="flex"
                                        flexGrow={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        flexDirection={isMobile ? "column" : "row"}
                                    >
                                        <div style={{ width: isMobile ? '100%' : 'auto' }}>
                                            <Typography
                                                variant="body1"
                                                className={classes.managementTitle}
                                            >
                                                {t('PopupTriggers.displayFrequency.displaySchedule.oncePerDay.title')}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                            >
                                                {t('PopupTriggers.displayFrequency.displaySchedule.oncePerDay.description')}
                                            </Typography>
                                        </div>
                                        <TodayIcon
                                            className={classes.radioIconPopupTrigger}
                                            style={{
                                                marginTop: isMobile ? '8px' : '0',
                                                alignSelf: isMobile ? 'flex-start' : 'center'
                                            }}
                                        />
                                    </Box>
                                }
                                classes={{ label: classes.radioLabelContainerPopupTrigger }}
                                className={`${classes.radioLabelPopupTrigger} ${displaySchedule === 'daily' ? 'selected' : ''}`}
                                style={{ alignItems: isMobile ? 'flex-start' : 'center' }}
                            />
                        </Box>
                        <Box mb={isMobile ? 1.5 : 2}>
                            <FormControlLabel
                                value="everyXDays"
                                control={<Radio color="secondary" />}
                                label={
                                    <Box
                                        display="flex"
                                        flexGrow={1}
                                        justifyContent="space-between"
                                        flexDirection={isMobile ? "column" : "row"}
                                        alignItems={isMobile ? "flex-start" : "center"}
                                    >
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            width={isMobile ? '100%' : 'auto'}
                                        >
                                            <Typography
                                                variant="body1"
                                                className={clsx(classes.managementTitle, classes.mb1)}
                                            >
                                                {t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.main')}
                                            </Typography>
                                            <div
                                                className={classes.inputContainerPopupTrigger}
                                                style={{
                                                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                                                    alignItems: isMobile ? 'flex-start' : 'center',
                                                }}
                                            >
                                                <Typography
                                                    style={{
                                                        fontSize: isMobile ? '0.875rem' : 'inherit',
                                                        marginBottom: isMobile ? '4px' : '0'
                                                    }}
                                                >
                                                    {t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.prefix')}
                                                </Typography>
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    className={classes.textFieldPopupTrigger}
                                                    value={everyXDays}
                                                    onChange={(e) => setEveryXDays(Number(e.target.value))}
                                                    disabled={displaySchedule !== 'everyXDays'}
                                                    type="number"
                                                    style={{
                                                        margin: isMobile ? '4px 8px 4px 0' : undefined,
                                                        minWidth: '60px',
                                                        maxWidth: '80px',
                                                    }}
                                                />
                                                <Typography
                                                    style={{
                                                        fontSize: isMobile ? '0.875rem' : 'inherit',
                                                    }}
                                                >
                                                    {t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.suffix')}
                                                </Typography>
                                            </div>
                                        </Box>
                                        <EventNoteIcon
                                            className={classes.radioIconPopupTrigger}
                                            style={{
                                                marginTop: isMobile ? '8px' : '0',
                                                alignSelf: isMobile ? 'flex-start' : 'center'
                                            }}
                                        />
                                    </Box>
                                }
                                classes={{ label: classes.radioLabelContainerPopupTrigger }}
                                className={`${classes.radioLabelPopupTrigger} ${displaySchedule === 'everyXDays' ? 'selected' : ''}`}
                                style={{ alignItems: isMobile ? 'flex-start' : 'center' }}
                            />
                        </Box>
                        <Box>
                            <FormControlLabel
                                value="everyVisit"
                                control={<Radio color="secondary" />}
                                label={
                                    <Box
                                        display="flex"
                                        flexGrow={1}
                                        justifyContent="space-between"
                                        flexDirection={isMobile ? "column" : "row"}
                                        alignItems={isMobile ? "flex-start" : "center"}
                                    >
                                        <div style={{ width: isMobile ? '100%' : 'auto' }}>
                                            <Typography
                                                variant="body1"
                                                className={classes.managementTitle}
                                            >
                                                {t('PopupTriggers.displayFrequency.displaySchedule.everyVisit.title')}
                                            </Typography>
                                            <Typography
                                                variant={isMobile ? "body2" : "body1"}
                                            >
                                                {t('PopupTriggers.displayFrequency.displaySchedule.everyVisit.description')}
                                            </Typography>
                                        </div>
                                        <span
                                            className={classes.infinityIcon}
                                            style={{
                                                marginTop: isMobile ? '8px' : '0',
                                                alignSelf: isMobile ? 'flex-start' : 'center'
                                            }}
                                        >
                                            ∞
                                        </span>
                                    </Box>
                                }
                                classes={{ label: classes.radioLabelContainerPopupTrigger }}
                                className={`${classes.radioLabelPopupTrigger} ${displaySchedule === 'everyVisit' ? 'selected' : ''}`}
                                style={{ alignItems: isMobile ? 'flex-start' : 'center' }}
                            />
                        </Box>
                    </RadioGroup>
                    <Typography
                        variant={isMobile ? "body2" : "body1"}
                        className={clsx(classes.grayTextCell, classes.mt2)}
                        display="block"
                        style={{ marginTop: isMobile ? '12px' : undefined }}
                    >
                        {t('PopupTriggers.displayFrequency.displaySchedule.caption')}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default DisplayFrequency;