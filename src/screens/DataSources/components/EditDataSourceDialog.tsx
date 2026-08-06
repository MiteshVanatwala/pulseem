import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateDataSource } from '../../../redux/reducers/dataSourcesSlice';
import { useDsDialogStyles } from './dialogStyles';

interface EditSource {
    ID: number;
    Name: string;
    Description: string;
}

interface EditDataSourceDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    source: EditSource | null;
    onClose: () => void;
    onSaved: () => void;
}

// Shared by the list and the view screens. 409 NAME_EXISTS renders as the name field's helperText;
// other failures show a generic inline error. Success calls onSaved (parent refreshes + toasts).
const EditDataSourceDialog = ({ classes, open, source, onClose, onSaved }: EditDataSourceDialogProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const dispatch = useDispatch();
    const dsDialog = useDsDialogStyles();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [nameError, setNameError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && source) {
            setName(source.Name || '');
            setDescription(source.Description || '');
            setNameError('');
            setGeneralError('');
        }
        // Re-seed only when the dialog opens or the target source changes — NOT on every parent re-render
        // (parents rebuild `source` as a fresh object literal each render, e.g. the 4s poll), which would
        // otherwise overwrite the user's in-progress edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, source?.ID]);

    const handleSave = async () => {
        setNameError('');
        setGeneralError('');
        if (!name || !name.trim()) {
            setNameError(t('DataSources.wizard.errors.nameRequired'));
            return;
        }
        if (name.length > 100) {
            setNameError(t('DataSources.wizard.errors.nameTooLong'));
            return;
        }
        if (!source) return;

        setSaving(true);
        const res: any = await dispatch(updateDataSource({ DataSourceID: source.ID, Name: name.trim(), Description: description }));
        setSaving(false);
        const payload = res?.payload;
        const code = payload?.StatusCode;
        if (code === 200) {
            onSaved();
            return;
        }
        if (code === 409 && payload?.Message === 'NAME_EXISTS') {
            setNameError(t('DataSources.errors.nameExists'));
            return;
        }
        if (code === 403) {
            setGeneralError(t('DataSources.errors.invalidChars'));
            return;
        }
        setGeneralError(t('DataSources.errors.generalError'));
    };

    return (
        // Reactive dir, not hardcoded "rtl" — see UploadWizardDialog.tsx for why the attribute is
        // mandatory on a portalled Dialog and why hardcoding it broke en/pl.
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir={isRtl ? 'rtl' : 'ltr'} PaperProps={{ className: dsDialog.paper }}>
            <DialogTitle>{t('DataSources.edit.title')}</DialogTitle>
            <DialogContent>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                    <TextField
                        variant="outlined"
                        label={t('DataSources.wizard.nameLabel')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!nameError}
                        helperText={nameError}
                        inputProps={{ maxLength: 100 }}
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        variant="outlined"
                        label={t('DataSources.wizard.descriptionLabel')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        inputProps={{ maxLength: 500 }}
                        multiline
                        rows={2}
                        fullWidth
                    />
                    {generalError && (
                        <Typography style={{ color: '#B42318', fontSize: 13 }}>{generalError}</Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDataSourceDialog;
