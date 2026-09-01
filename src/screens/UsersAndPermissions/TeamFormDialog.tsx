import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Box, Button, Checkbox, FormControlLabel, Grid, TextField, Typography } from '@material-ui/core';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { Team, SaveTeamPayload, TEAM_NAME_MAX_LENGTH } from '../../Models/Team/Team';

// PR-2456: source-agnostic shape — callers map their agent source (permission-flagged
// sub-users today, potentially a different roster later) onto {id, name}.
export interface AvailableAgent {
    id: number;
    name: string;
}

interface TeamFormDialogProps {
    classes: any;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (payload: SaveTeamPayload) => void;
    editRecord?: Team | null;
    availableAgents: AvailableAgent[];
    isSaving?: boolean;
    rosterTruncated?: boolean;
}

const TeamFormDialog = ({ classes, isOpen, onClose, onSaved, editRecord = null, availableAgents, isSaving = false, rosterTruncated = false }: TeamFormDialogProps) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector((state: any) => state.core);
    const [name, setName] = useState<string>('');
    const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]);
    const [nameError, setNameError] = useState<string>('');

    useEffect(() => {
        if (isOpen && editRecord) {
            setName(editRecord.TeamName);
            setSelectedAgentIds(editRecord.AgentIds || []);
            setNameError('');
        }

        if (!isOpen) {
            setName('');
            setSelectedAgentIds([]);
            setNameError('');
        }
    }, [isOpen, editRecord]);

    const toggleAgent = (agentId: number) => {
        setSelectedAgentIds((current) =>
            current.includes(agentId)
                ? current.filter((id) => id !== agentId)
                : [...current, agentId]
        );
    };

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(t('SubUsers.teams.nameRequired'));
            return;
        }
        if (trimmedName.length > TEAM_NAME_MAX_LENGTH) {
            setNameError(t('SubUsers.teams.nameTooLong'));
            return;
        }
        setNameError('');
        onSaved({
            ...(editRecord ? { TeamID: editRecord.TeamID } : {}),
            TeamName: trimmedName,
            AgentIds: selectedAgentIds,
        });
    };

    return (
        <BaseDialog
            classes={classes}
            open={isOpen}
            title={t(editRecord ? 'SubUsers.teams.editTitle' : 'SubUsers.teams.createTitle')}
            onClose={onClose}
            onCancel={onClose}
            renderButtons={() => (
                <Grid container spacing={2} style={{ width: '100%', margin: 0 }} className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}>
                    <Grid item>
                        <Button
                            disabled={isSaving}
                            onClick={handleSave}
                            className={clsx(classes.btn, classes.btnRounded)}
                        >
                            {t('SubUsers.teams.save')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={onClose}
                            className={clsx(classes.btn, classes.btnRounded)}
                        >
                            {t('SubUsers.teams.cancel')}
                        </Button>
                    </Grid>
                </Grid>
            )}
        >
            <Grid container spacing={2} style={{ width: '100%', margin: 0 }}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label={t('SubUsers.teams.nameLabel')}
                        value={name}
                        inputProps={{ maxLength: TEAM_NAME_MAX_LENGTH }}
                        onChange={(e) => setName(e.target.value)}
                        error={!!nameError}
                        helperText={nameError}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography>{t('SubUsers.teams.agentsLabel')}</Typography>
                        </Grid>
                        {selectedAgentIds.length > 0 && (
                            <Grid item>
                                <Typography variant="caption" color="textSecondary">
                                    {`${selectedAgentIds.length} ${t('SubUsers.teams.selected')}`}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                    {rosterTruncated && (
                        <Typography variant="caption" color="textSecondary">
                            {t('SubUsers.teams.rosterTruncated')}
                        </Typography>
                    )}
                    <Box
                        style={{
                            maxHeight: 240,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            border: '2px solid #F0F5FF',
                            borderRadius: 12,
                            marginTop: 8,
                            padding: availableAgents.length === 0 ? 16 : 8,
                        }}
                    >
                        {availableAgents.length === 0 ? (
                            <Typography>{t('SubUsers.teams.noAgents')}</Typography>
                        ) : (
                            <Grid container spacing={1} style={{ width: '100%', margin: 0 }}>
                                {availableAgents.map((agent) => (
                                    <Grid item xs={12} sm={6} key={agent.id}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedAgentIds.includes(agent.id)}
                                                    onChange={() => toggleAgent(agent.id)}
                                                />
                                            }
                                            label={agent.name}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </BaseDialog>
    );
};

export default TeamFormDialog;
