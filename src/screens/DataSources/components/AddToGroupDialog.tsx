import { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, TextField, Link,
    Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, LinearProgress
} from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useRedirect from '../../../helpers/Routes/Redirect';
import { sitePrefix } from '../../../config';
import { ERROR_TYPE } from '../../../helpers/Types/common';
import { addToGroup } from '../../../redux/reducers/dataSourcesSlice';
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import { useDsDialogStyles } from './dialogStyles';

// dbo.Groups.GroupName is nvarchar(100); DataSourcesController.AddToGroup rejects anything longer
// with 400 DATA_INCORRECT rather than letting SQL Server truncate it silently.
const GROUP_NAME_MAX = 100;

/** Fits a composed default group name inside GROUP_NAME_MAX by shortening the SOURCE NAME part,
 *  never the " — V<n>" suffix that makes the name unique per version. */
const clampGroupName = (composed: string, sourceName: string, version: number | null): string => {
    if (composed.length <= GROUP_NAME_MAX) return composed;
    const suffix = composed.slice(sourceName.length);          // e.g. " — V3"
    const room = GROUP_NAME_MAX - suffix.length;
    if (room <= 0) return composed.slice(0, GROUP_NAME_MAX);   // pathological: no room for a name at all
    return sourceName.slice(0, room).trimEnd() + suffix;
};

interface GroupOption { GroupID: number; GroupName: string; }

interface AddToGroupDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    /** The source being added FROM. Name is display-only; DataSourceID is what the API keys on. */
    dataSource: { ID: number; Name: string } | null;
    /** REQUIRED and always explicit — see AddToGroupRequest. Never inferred as "the current version". */
    versionId: number | null;
    versionNumber: number | null;
    totalRows: number | null;
    resolvedEmail: number;
    resolvedCell: number;
    onClose: () => void;
    /** Raised on a successful add so the caller can disable its entry point for the session. */
    onAdded?: () => void;
    setToastMessage: (msg: ERROR_TYPE) => void;
}

const AddToGroupDialog = ({
    classes, open, dataSource, versionId, versionNumber, totalRows, resolvedEmail, resolvedCell,
    onClose, onAdded, setToastMessage
}: AddToGroupDialogProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const dispatch = useDispatch();
    const Redirect = useRedirect();
    const dsDialog = useDsDialogStyles();
    const { subAccountAllGroups } = useSelector((s: any) => s.group);

    const [mode, setMode] = useState<'existing' | 'new'>('existing');
    const [picked, setPicked] = useState<GroupOption | null>(null);
    const [newName, setNewName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [nameError, setNameError] = useState('');
    const [done, setDone] = useState<{ Added: number; AlreadyMembers: number; Skipped: number; GroupName: string } | null>(null);

    /* NOT a count — a provable CEILING, and the distinction is the whole point.

       Only rows that resolved to a platform client can enter dbo.ClientsToGroups (it is
       (ClientID, GroupID) and nothing else). The server inserts the DISTINCT union of the version's
       non-null EmailClientID and CellClientID, and |A ∪ B| <= |A| + |B|, so ResolvedRowsEmail +
       ResolvedRowsCell is a true upper bound. It is loose — two rows can resolve to the same client —
       and that is fine: a ceiling may be generous, only never exceeded.

       🔴 DO NOT RE-ADD THE `Math.min(sum, totalRows)` CLAMP THAT WAS HERE (removed 2026-09-09,
       deep-review R3/trust-0). It looks like a tightening and was actually the bug: the two channels
       resolve INDEPENDENTLY, so ONE row can contribute TWO different recipients — its email matching
       client X and its mobile matching a different existing client Y, which is the normal state of an
       account that imported its email and SMS lists separately. With 1,000 such rows the true insert
       is 2,000 recipients while the clamp printed "up to 1,000" — a bound the very next screen then
       visibly exceeded, on a group about to be sent to and billed per recipient.

       Getting the EXACT figure client-side would need a COUNT(DISTINCT …) landing on a response this
       screen re-fetches on mount, after every save and every 4s while processing — a real regression
       on a hot path to pre-render one number in a rarely-opened dialog. So we print a bound we can
       defend, and the exact number arrives from the server in the result state below. */
    const maxAddable = useMemo(
        () => (resolvedEmail || 0) + (resolvedCell || 0),
        [resolvedEmail, resolvedCell]
    );

    // Certain, unlike the ceiling: if NOTHING resolved on either channel there is provably nothing to
    // add, so the dialog offers no destination rather than a live button that would create an empty
    // group and report zero.
    const nothingToAdd = (resolvedEmail || 0) === 0 && (resolvedCell || 0) === 0;

    useEffect(() => {
        if (!open) return;
        setMode('existing'); setPicked(null); setBusy(false);
        setError(''); setNameError(''); setDone(null);
        // Pre-fill the new-group name with the name the user was going to type anyway. Stamping the
        // version into it also makes the NEXT version's add far less likely to collide on 422.
        /* Clamped to the server's cap. A data source Name can itself be a full 100 characters (the
           wizard auto-names from the file basename with .substring(0, 100)), and this default appends
           " — V<n>" to it — so the product was generating a 105-character name that its own controller
           then rejected with 400 DATA_INCORRECT. `inputProps.maxLength` does NOT constrain a
           programmatically set value, so nothing caught it on the way out.
           The NAME is truncated rather than the suffix, because the version marker is the whole point
           of the default: it is what stops the next version's add colliding on 422. */
        setNewName(clampGroupName(dataSource && versionNumber != null
            ? t('DataSources.addToGroup.newNameDefault', { name: dataSource.Name, v: versionNumber })
            : (dataSource?.Name ?? ''), dataSource?.Name ?? '', versionNumber));
        /* 🔴 ALWAYS re-fetch; do NOT reuse a non-empty cache (fixed 2026-09-09, deep-review R4/fresh-0).
           `state.group.subAccountAllGroups` is a SHARED key written by TWO thunks with DIFFERENT
           server-side filters: getGroupsBySubAccountId -> GetGroupsBySubAccount(sid, true) ->
           @prm_ShowTestGroups = 0, and getAllGroupsBySubAccountId -> GetGroupsBySubAccount(sid, true,
           TRUE) -> @prm_ShowTestGroups = 1. Client Search dispatches the second one. So "only fetch
           when empty" meant that visiting Client Search first left this picker listing the
           sub-account's TEST groups — the one group class whose entire purpose is limiting blast
           radius — with nothing marking them, since Groups_SelectBySubAccount projects only
           GroupID/GroupName/dates/Recipients and no IsTestGroup for the client to filter on.
           Re-fetching also fixes the staleness half: a group deleted earlier in the session no longer
           lingers in the list. One GET per dialog open is the right price. */
        dispatch(getGroupsBySubAccountId());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const options: GroupOption[] = (subAccountAllGroups ?? []).filter((g: any) => g && g.GroupID != null);

    /* A typed-but-unselected string must never satisfy this gate. `picked` is only ever set from a
       resolved option object, so a half-typed group name cannot reach the server as a destination. */
    const canConfirm = !busy && !nothingToAdd && versionId != null &&
        (mode === 'existing' ? !!picked : (!!newName.trim() && newName.trim().length <= GROUP_NAME_MAX));

    const handleConfirm = async () => {
        if (!dataSource || versionId == null) return;
        setError(''); setNameError(''); setBusy(true);
        const res: any = await dispatch(addToGroup({
            DataSourceID: dataSource.ID,
            VersionID: versionId,
            ...(mode === 'existing' ? { GroupID: picked!.GroupID } : { NewGroupName: newName.trim() })
        }));
        setBusy(false);
        const payload = res?.payload;
        const code = payload?.StatusCode;

        if (code === 201 || code === 200) {
            const d = payload?.Data ?? {};
            setDone({
                Added: d.Added ?? 0, AlreadyMembers: d.AlreadyMembers ?? 0, Skipped: d.Skipped ?? 0,
                GroupName: d.GroupName ?? (mode === 'existing' ? (picked?.GroupName ?? '') : newName.trim())
            });
            // A new group now exists; refresh the cached list so a second add can select it.
            if (mode === 'new') dispatch(getGroupsBySubAccountId());
            onAdded?.();
            return;
        }
        if (code === 422) {
            // Stays open, inline on the field that caused it. Deliberately NOT offering a one-click
            // "add to that group instead": that silently converts "create a fresh list" into "merge
            // into a production list" for a user who is already in error-recovery mode, one click from
            // no undo. We refresh the list so they can pick it deliberately as a second act.
            setNameError(t('DataSources.addToGroup.nameExists', { name: newName.trim() }));
            dispatch(getGroupsBySubAccountId());
            return;
        }
        if (code === 409) { setError(t('DataSources.addToGroup.processing')); return; }
        /* The picker cannot filter these out itself: Groups_SelectBySubAccount returns dynamic groups
           and does not even project IsDynamic (verified 2026-09-09 against the snapshot), so the
           client has no field to test on. The server refuses them; this reports why. */
        // Two distinct server refusals share 423 Locked — the group exists and is owned, but is the
        // wrong KIND. The Message discriminates so the operator is told which.
        if (code === 423) {
            setError(t(payload?.Message === 'GROUP_IS_TEST'
                ? 'DataSources.addToGroup.testGroup'
                : 'DataSources.addToGroup.dynamicGroup'));
            return;
        }
        /* 413 is the SP's @MaxCandidates guard. It is the one refusal in this dialog the
           operator can act on themselves, so the copy names the remedy (split the source /
           add in parts) rather than just reporting a failure. No number is interpolated: the
           ceiling lives in the SP and a hardcoded figure here would drift the moment it is
           retuned, and a wrong number is worse than none. */
        if (code === 413) { setError(t('DataSources.addToGroup.tooManyRecipients')); return; }
        if (code === 405) { setError(t('DataSources.addToGroup.noPermission')); return; }
        /* 927 on THIS endpoint is CheckAccess refusing the DataSources feature itself
           (DataSourcesController.CheckAccess), not a group-tier refusal — the SP creates the group
           directly and no tier check runs on that path. Reporting it on the name field as "creating a
           group isn't in your plan" would name the wrong feature and send the user to the wrong
           conversation, so it surfaces as the feature message the rest of this screen already uses.
           (`tierBlocked` is kept in the locale files for the day a tier check IS added here.) */
        if (code === 927) { setError(t('DataSources.errors.featureNotAvailable')); return; }
        if (code === 404) {
            setToastMessage({ severity: 'error', color: 'error', message: 'DataSources.errors.sourceDeleted' } as ERROR_TYPE);
            onClose();
            return;
        }
        // 403 is the server's XSS rejection of NewGroupName, and it is the only 4xx that is entirely
        // about the text in the box — so it belongs on the field, not in the dialog-level error slot
        // where the user cannot tell which input to change.
        if (code === 403) { setNameError(t('DataSources.addToGroup.invalidName')); return; }
        // 400 here is only ever reachable through the name field (every other DATA_INCORRECT case is a
        // malformed request this client cannot produce), so it belongs on that field rather than in the
        // dialog-level slot where it would read as "the whole operation failed for some reason".
        if (code === 400) { setNameError(t('DataSources.addToGroup.nameTooLong', { max: GROUP_NAME_MAX })); return; }
        /* An undefined code means the thunk REJECTED — the request never produced a response we can
           read. `failed` states as fact that no recipients were added, which is exactly what we do not
           know here: the server may have committed the whole insert and lost the connection on the way
           back. Claiming "nothing was added" would send the user to retry an add that already happened.
           Distinguishing this costs one branch and is the difference between an honest unknown and a
           confident wrong answer about an irreversible write. */
        if (code === undefined || code === null) { setError(t('DataSources.addToGroup.unknownOutcome')); return; }
        setError(t('DataSources.addToGroup.failed'));
    };

    const renderChooser = () => (
        <>
            <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" style={{ fontSize: 13 }}>{t('DataSources.addToGroup.destinationQuestion')}</FormLabel>
                <RadioGroup value={mode} onChange={(e) => { setMode(e.target.value as 'existing' | 'new'); setError(''); setNameError(''); }}>
                    <FormControlLabel value="existing" control={<Radio color="primary" size="small" />} label={t('DataSources.addToGroup.optionExisting')} />
                    {mode === 'existing' && (
                        <Box style={{ marginInlineStart: 32, marginBottom: 8 }}>
                            <Autocomplete
                                options={options}
                                value={picked}
                                onChange={(_e: any, v: any) => setPicked(v ?? null)}
                                getOptionLabel={(o: any) => o?.GroupName ?? ''}
                                getOptionSelected={(o: any, v: any) => o?.GroupID === v?.GroupID}
                                disabled={busy}
                                /* The listbox portals to document.body, OUTSIDE this Dialog, so the
                                   Dialog's own `dir` never reaches it — the same portal problem the
                                   wizard documents for Tooltips. Both of these are needed: ListboxProps
                                   sets the container, and the per-option style covers the rows, because
                                   inheritance alone does not survive the portal boundary. */
                                ListboxProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}
                                renderOption={(o: any) => <span style={{ direction: isRtl ? 'rtl' : 'ltr', width: '100%' }}>{o?.GroupName}</span>}
                                renderInput={(params: any) => (
                                    <TextField {...params} variant="outlined" size="small" placeholder={t('DataSources.addToGroup.pickPlaceholder')} />
                                )}
                            />
                            {/* Not optional. "Add to group" is ambiguous between merge and replace, and
                                the user has to know which BEFORE the click, not after. */}
                            {picked && (
                                <Typography style={{ fontSize: 12, color: '#5b6b7b', marginTop: 6 }}>
                                    {t('DataSources.addToGroup.mergeNotice')}
                                </Typography>
                            )}
                        </Box>
                    )}
                    <FormControlLabel value="new" control={<Radio color="primary" size="small" />} label={t('DataSources.addToGroup.optionNew')} />
                    {mode === 'new' && (
                        <Box style={{ marginInlineStart: 32 }}>
                            <TextField
                                variant="outlined" size="small" fullWidth
                                value={newName}
                                onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
                                onFocus={(e) => e.target.select()}
                                placeholder={t('DataSources.addToGroup.newNamePlaceholder')}
                                inputProps={{ maxLength: 100 }}
                                error={!!nameError} helperText={nameError}
                                disabled={busy}
                            />
                        </Box>
                    )}
                </RadioGroup>
            </FormControl>

            {/* Evidence, below the decision: at maxWidth="sm" a four-line panel above the controls
                pushes the only interactive element below the fold on a 768px laptop. */}
            <Box style={{ background: '#f6f9fc', borderRadius: 8, padding: 12 }}>
                <Typography style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-word' }}>
                    <bdi>{dataSource?.Name}</bdi>{versionNumber != null ? ` · V${versionNumber}` : ''}
                </Typography>
                <Typography style={{ fontSize: 13, marginTop: 4 }}>
                    {t('DataSources.addToGroup.countUpperBound', { max: maxAddable.toLocaleString() })}
                </Typography>
                <Typography style={{ fontSize: 12, color: '#5b6b7b', marginTop: 2 }}>
                    {t('DataSources.addToGroup.countBreakdown', {
                        total: (totalRows ?? 0).toLocaleString(),
                        email: (resolvedEmail || 0).toLocaleString(),
                        cell: (resolvedCell || 0).toLocaleString()
                    })}
                </Typography>
            </Box>

            {/* severity carries an icon as well as a colour — the skipped-rows gap must not be
                communicated by colour alone. */}
            {totalRows != null && totalRows > Math.max(resolvedEmail || 0, resolvedCell || 0) && (
                <Alert severity="warning" style={{ fontSize: 12 }}>{t('DataSources.addToGroup.unresolvedNotice')}</Alert>
            )}
        </>
    );

    const renderDone = () => (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography style={{ color: '#067647' }}>
                {t('DataSources.addToGroup.doneAdded', { group: done!.GroupName, n: done!.Added.toLocaleString() })}
            </Typography>
            {done!.AlreadyMembers > 0 && (
                <Typography style={{ fontSize: 13, color: '#5b6b7b' }}>
                    {t('DataSources.addToGroup.doneAlready', { n: done!.AlreadyMembers.toLocaleString() })}
                </Typography>
            )}
            {done!.Skipped > 0 && (
                <Typography style={{ fontSize: 13, color: '#5b6b7b' }}>
                    {t('DataSources.addToGroup.doneSkipped', { n: done!.Skipped.toLocaleString() })}
                </Typography>
            )}
            <Link component="button" onClick={() => Redirect({ url: `${sitePrefix}Groups`, openNewTab: false })}>
                {t('DataSources.addToGroup.goToGroups')}
            </Link>
        </Box>
    );

    return (
        // Reactive dir, not hardcoded "rtl" — see UploadWizardDialog.tsx for why the attribute is
        // mandatory on a portalled Dialog and why hardcoding it broke en/pl.
        <Dialog
            open={open}
            onClose={() => { if (!busy) onClose(); }}
            fullWidth maxWidth="sm"
            dir={isRtl ? 'rtl' : 'ltr'}
            PaperProps={{ className: dsDialog.paper }}
        >
            <DialogTitle>{t('DataSources.addToGroup.title')}</DialogTitle>
            <DialogContent>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {done
                        ? renderDone()
                        : nothingToAdd
                            ? <Alert severity="error" style={{ fontSize: 13 }}>{t('DataSources.addToGroup.nothingToAdd', { v: versionNumber ?? '' })}</Alert>
                            : renderChooser()}
                    {error && <Typography style={{ color: '#B42318', fontSize: 13 }}>{error}</Typography>}
                    {busy && <LinearProgress />}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>{t(done || nothingToAdd ? 'common.close' : 'common.cancel')}</Button>
                {!done && !nothingToAdd && (
                    /* The button names the DESTINATION, not the count. Two adjacent group names in an
                       Autocomplete are one arrow key apart; the number is the half nobody regrets. */
                    <Button color="primary" variant="contained" onClick={handleConfirm} disabled={!canConfirm}>
                        {mode === 'existing'
                            ? t('DataSources.addToGroup.confirmExisting', { group: picked?.GroupName ?? '' })
                            : t('DataSources.addToGroup.confirmNew')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default AddToGroupDialog;
