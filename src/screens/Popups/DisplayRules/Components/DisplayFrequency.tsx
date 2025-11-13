import React from 'react';
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
    InputAdornment,
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
import PulseemSwitch from '../../../../components/Controlls/PulseemSwitch';

interface DisplayFrequencyData {
    targetAudience: string;
    displaySchedule: string;
    everyXDays: number;
    everyXVisits: number;
    days: number | "";
}

interface Props {
    classes: any;
    lookupData: any;
    show: boolean;
    onToggle: () => void;
    data: DisplayFrequencyData;
    onChange: (fieldName: keyof DisplayFrequencyData, value: any) => void;
}

const audienceMap: { [key: string]: { key: string; icon: React.ReactElement } } = {
    "All Visitors": { key: 'allVisitors', icon: <PeopleIcon /> },
    "New Visitors": { key: 'newVisitors', icon: <PersonAddIcon /> },
    "Returning Visitors": { key: 'returningVisitors', icon: <PersonPinIcon /> },
};

const DisplayFrequency: React.FC<Props> = ({ classes, lookupData, show, onToggle, data, onChange }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { targetAudience, displaySchedule, everyXDays, everyXVisits, days } = data;

    const handleTargetAudienceChange = (event: React.MouseEvent<HTMLElement>, newAudience: string | null) => {
        if (newAudience !== null) {
            onChange('targetAudience', newAudience);
        }
    };

    const handleDisplayScheduleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSchedule = event.target.value;
        onChange('displaySchedule', newSchedule);

        if (newSchedule !== 'Once every few days') {
            onChange('everyXDays', 0);
        }
        if (newSchedule !== 'Once every few visits') {
            onChange('everyXVisits', 0);
        }
    };

    const scheduleMap: { [key: string]: { titleKey: string; descriptionKey: string; icon: React.ReactElement | string } } = {
        "Once a day": { titleKey: 'oncePerDay.title', descriptionKey: 'oncePerDay.description', icon: <TodayIcon /> },
        "Once every few days": { titleKey: 'everyXDays.main', descriptionKey: 'everyXDays.description', icon: <EventNoteIcon /> },
        "Once every few visits": { titleKey: 'everyXVisit.main', descriptionKey: 'everyXVisit.description', icon: <EventNoteIcon /> },
        "Every visit": { titleKey: 'everyVisit.title', descriptionKey: 'everyVisit.description', icon: "∞" },
    };

    const audienceDescription = lookupData?.AudienceTargets?.find((audience: any) => audience.Name === targetAudience)?.Description;

    return (
        <Box mt={isMobile ? 2 : 4}>
            <Paper className={classes.paperPopupTrigger}>
                <Box
                    mb={isMobile ? 2 : 4}
                    pb={isMobile ? 5 : 10}
                    className={clsx(classes.topHeaderPopupTrigger, classes.p10, classes.spaceBetween)}
                    alignItems="center"
                    px={isMobile ? 2 : undefined}
                >
                    <div>
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
                    </div>
                    <PulseemSwitch
                        switchType="ios"
                        id="popupTriggers-toggle"
                        checked={show}
                        onChange={onToggle}
                        classes={classes}
                    />
                </Box>
                {show && (<>
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
                            {lookupData?.AudienceTargets?.map((audience: any) => {
                                const mapping = audienceMap[audience.Name];
                                if (!mapping) return null;

                                return (
                                    <ToggleButton
                                        key={audience.Id}
                                        value={audience.Name}
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
                                        {React.cloneElement(mapping.icon, { style: { marginRight: isMobile ? '12px' : '8px' } })}
                                        {t(`PopupTriggers.displayFrequency.targetAudience.${mapping.key}`)}
                                    </ToggleButton>
                                );
                            })}
                        </ToggleButtonGroup>
                        <Typography
                            variant={isMobile ? "body2" : "body1"}
                            className={classes.grayTextCell}
                            display="block"
                            style={{ marginTop: isMobile ? '12px' : '8px' }}
                        >
                            {targetAudience === 'All Visitors' ?
                                t(`PopupTriggers.displayFrequency.subHeading.all`)
                                : targetAudience === 'New Visitors' ?
                                    t(`PopupTriggers.displayFrequency.subHeading.new`)
                                    : t(`PopupTriggers.displayFrequency.subHeading.return`)
                            }
                        </Typography>
                    </Box>
                    {(targetAudience === 'New Visitors' || targetAudience === 'Returning Visitors') && (
                        <Box
                            pb={isMobile ? 2 : 4}
                            mx={isMobile ? 2 : 4}
                            mb={isMobile ? 2 : 4}
                            className={clsx(classes.formContainerPopupTrigger, classes.p20)}
                        >
                            <Typography
                                variant="body1"
                                className={clsx(classes.managementTitle, classes.font20)}
                                gutterBottom
                            >
                                {targetAudience === 'New Visitors'
                                    ? t('PopupTriggers.displayFrequency.defineNewVisitor')
                                    : t('PopupTriggers.displayFrequency.defineReturningVisitor')}
                            </Typography>

                            <Typography
                                variant={isMobile ? "body2" : "body1"}
                                className={classes.subtitlePopupTrigger}
                            >
                                {targetAudience === 'New Visitors'
                                    ? t('PopupTriggers.displayFrequency.newVisitorDescription')
                                    : t('PopupTriggers.displayFrequency.returningVisitorDescription')}
                            </Typography>

                            <TextField
                                variant="outlined"
                                size="small"
                                className={clsx(classes.pageTargetingTextField, classes.w110)}
                                value={days}
                                onChange={(e) => onChange('days', Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">Days</InputAdornment>,
                                }}
                            />
                        </Box>
                    )}
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
                            {lookupData?.DisplayFrequencies?.map((freq: any) => {
                                const mapping = scheduleMap[freq.Name];
                                if (!mapping) return null;

                                return (
                                    <Box mb={isMobile ? 1.5 : 2} key={freq.Id}>
                                        <FormControlLabel
                                            value={freq.Name}
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
                                                            {t(`PopupTriggers.displayFrequency.displaySchedule.${mapping.titleKey}`)}
                                                        </Typography>
                                                        {freq.Name === 'Once every few days' && (
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
                                                                    onChange={(e) => {
                                                                        onChange('everyXDays', Number(e.target.value));
                                                                        onChange('everyXVisits', 0);
                                                                    }}
                                                                    disabled={displaySchedule !== 'Once every few days'}
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
                                                        )}
                                                        {freq.Name === 'Once every few visits' && (
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
                                                                    value={everyXVisits}
                                                                    onChange={(e) => {
                                                                        onChange('everyXVisits', Number(e.target.value));
                                                                        onChange('everyXDays', 0);
                                                                    }}
                                                                    disabled={displaySchedule !== 'Once every few visits'}
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
                                                                    {t('PopupTriggers.summary.visits')}
                                                                </Typography>
                                                            </div>
                                                        )}
                                                        <Typography
                                                            variant="body1"
                                                        >
                                                            {t(`PopupTriggers.displayFrequency.displaySchedule.${mapping.descriptionKey}`)}
                                                        </Typography>
                                                    </div>
                                                    {mapping.icon && (typeof mapping.icon === 'string' ? (
                                                        <span
                                                            className={classes.infinityIcon}
                                                            style={{
                                                                marginTop: isMobile ? '8px' : '0',
                                                                alignSelf: isMobile ? 'flex-start' : 'center'
                                                            }}
                                                        >
                                                            {mapping.icon}
                                                        </span>
                                                    ) : (
                                                        React.cloneElement(mapping.icon, {
                                                            className: classes.radioIconPopupTrigger,
                                                            style: {
                                                                marginTop: isMobile ? '8px' : '0',
                                                                alignSelf: isMobile ? 'flex-start' : 'center'
                                                            }
                                                        })
                                                    ))}
                                                </Box>
                                            }
                                            classes={{ label: classes.radioLabelContainerPopupTrigger }}
                                            className={`${classes.radioLabelPopupTrigger} ${displaySchedule === freq.Name ? 'selected' : ''}`}
                                            style={{ alignItems: isMobile ? 'flex-start' : 'center' }}
                                        />
                                    </Box>
                                );
                            })}
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
                </>)}
            </Paper>
        </Box>
    );
};

export default DisplayFrequency;