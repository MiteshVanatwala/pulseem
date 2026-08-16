import React, { useMemo } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Chip, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Warning } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SmartSendColumn } from '../../../Models/DataSources/SmartSend';
import { resolveColumnLabel } from '../columnLabel';
import { pickDefaultSupervisorColumn } from '../businessColumnDefaults';
import { pickGapColumnCandidate } from '../gapColumnSuggest';

// §11.4 · the supervisor-email block. ALL version columns are offered for each role
// (NOT filtered by SemanticRole — supervisor/gap are free choices, §4). These columns affect
// the supervisor email table ONLY (V3); when no supervisor is picked the shortfall picker is
// disabled with an explanation so the user never selects something with no effect (§11.4).
//
// MERGED CONTROL: gap and sort used to be two separate pickers. They are now ONE, because the
// business rule is fixed — the supervisor's table is always ordered by the smallest shortfall to
// target — so a separate "sort by something else" control only invited a wrong answer. The server
// contract is untouched: setBusinessColumn('gapSort') writes the same ColumnID into GapColumnID
// and SortColumnID, and readers compute ISNULL(Sort, Gap) exactly as before.
// A mapping saved BEFORE the merge can still hold two different columns; `storedGapColumnId` /
// `storedSortColumnId` (the raw server values) drive a warning rather than a silent collapse.
//
// ── EVERY COLUMN NAME GOES THROUGH `resolveColumnLabel` (../columnLabel) ────────────────────
// THE REPORTED DEFECT (campaign 1514933): the supervisor picker rendered BLANK for a campaign
// whose CampaignsToDataSources row holds a NOT NULL SupervisorColumnID. Blank is the worst
// possible output here, because it is indistinguishable from "nothing was detected" — the operator
// has no way to tell a saved value from an empty one, so the natural reaction is to leave a screen
// that is in fact misreporting the DB. TWO independent faults produce that same blank box and both
// are closed below, because closing one would have left the symptom unchanged:
//   1. NAMING. The MenuItems were built from a raw `DisplayName`, which the API models as a plain
//      `string`, not as required-non-empty (Models/DataSources/SmartSend.ts:53). A column whose
//      DisplayName is "" or whitespace therefore rendered a NAMELESS <MenuItem>, and a closed
//      Select paints whatever its selected item contains — nothing. `resolveColumnLabel` returns a
//      non-empty string BY CONSTRUCTION (DisplayName → SourceHeader → String(ColumnID)), so no
//      caller downstream can render nothing. Its own header (columnLabel.ts:33-37) is the argument
//      for why EVERY naming surface has to use it and not just the one that was reported: two
//      controls naming one column differently is worse than the original hole.
//   2. MEMBERSHIP. A stored id that is not in the LOCKED version matches no <MenuItem> at all, so
//      MUI renders an empty box and logs an out-of-range warning nobody reads. See the vanished
//      guard below.
// `colName` (the pre-merge divergence warning) resolves names the same way, for the same reason.
//
// ── VANISHED COLUMNS ────────────────────────────────────────────────────────────────────────
// The locked version can lose a column after the mapping was saved (a re-upload that dropped it, a
// column deleted in the source). The stored id then points outside `columns`. This component
// SHOWS that instead of painting it: the Select falls back to the "None" item (a real, labelled
// choice — "ללא") and a warning sits directly underneath. It does NOT auto-clear the stored value.
// Reporting state is this component's job; editing it is the user's, and a silent clear would be
// an edit — one that arms the 750ms autosave and persists a decision nobody made. The save path
// scrubs such an id independently (SmartSendScreen.tsx:235-236) so the SP's -9 cannot deadlock a
// save the operator did ask for; that scrub is a save-time repair, not a reason to hide it here.
//
// ── THE TWO SUGGESTION CHIPS ────────────────────────────────────────────────────────────────
// Each picker can offer ONE click-to-apply candidate beside it: `pickDefaultSupervisorColumn`
// (businessColumnDefaults.ts:110-121 — "the 2nd email column is the supervisor") and
// `pickGapColumnCandidate` (gapColumnSuggest.ts:144-157 — the ranked חוסר/חסר/נשאר/פער word
// tiers). The chip is rendered ONLY when nothing usable is selected, and clicking it calls the
// SAME `onChange` a manual pick from the Select calls — SmartSendScreen.tsx:701 dispatches
// setBusinessColumn and marks the form edited, so one click is one decision and the ordinary
// autosave persists it. Nothing else happens on click, and nothing at all happens without one.
//
// WHY A CLICK AND NOT A PRE-FILL — the property this file must not break:
//  · THE SHORTFALL COLUMN IS EXPENSIVE TO GUESS. It is the ordering key of the V3 supervisor mail,
//    and a non-null GapColumnID makes CampaignsToDataSources_Set run the OPENJSON SearchValues
//    build and flip IsSearchable = 1 on the SHARED production version — which
//    DataSources_UpdateColumnMeta then refuses to turn back off (-8) while the reference exists.
//  · AND IT HAS NO ESCAPE HATCH. The supervisor column has one: `supervisorColumnIsGuess` keeps an
//    unconfirmed guess visible on screen while buildSaveRequest posts NULL for it
//    (SmartSendScreen.tsx:266-268). There is no `gapColumnIsGuess`; gap is posted verbatim
//    (:272-273). A pre-filled gap would therefore be indistinguishable from a choice the moment the
//    first autosave fired. The full argument, with the wrong answer it produced on this repo's own
//    fixture, is in gapColumnSuggest.ts:9-54 — read it before making either of these a default.
// So: NEVER pre-fill, NEVER auto-apply, and never a disabled chip either — a chip that cannot be
// clicked is a suggestion nobody can act on and clutter for everyone else. Conditional render only.
//
// THE PRE-FILL THAT DOES EXIST is the SUPERVISOR one, and only on a blank slate: applied inside
// the slice (businessColumnDefaults.ts, applied by two smartSendSlice reducers), gated on
// `!data.IsMapped` (smartSendSlice.ts:577) so a saved NULL stays respected, and marked as a guess.
// A reducer is structurally incapable of setting the screen's `dirty` flag, which is why that path
// can pre-fill at all — read that file's header before changing this one. The chips are the OTHER
// half of the same rule: once a mapping is saved the default never fires again, so for an existing
// campaign a click is the ONLY route from "nothing selected" to a value. That is exactly the state
// 1514933 lands in. The chips do not weaken the `!IsMapped` gate — they write nothing on their own.

type Role = 'supervisor' | 'gapSort';

interface Props {
    columns: SmartSendColumn[];
    supervisorColumnId: number | null;
    // The effective shortfall column. `sortColumnId` is no longer a separate control — the screen
    // keeps writing it (always equal to the gap column) because it is still a real server field.
    gapColumnId: number | null;
    // Raw server values, for the pre-merge divergence warning only. Absent → no warning.
    storedGapColumnId?: number | null;
    storedSortColumnId?: number | null;
    onChange: (role: Role, columnId: number | null) => void;
    supervisorEnabled?: boolean;
    // Is the supervisor value currently on screen a MACHINE GUESS rather than the operator's
    // decision? Load-bearing for `gapDisabled` — see the argument where it is computed.
    supervisorColumnIsGuess?: boolean;
}

const useStyles = makeStyles((theme) => ({
    row: { display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2), marginTop: theme.spacing(1) },
    // One vertical stack PER PICKER: the Select, then anything that talks about that Select. Both
    // of those things are ambiguous on their own — the vanished string names no picker, and the
    // chip names only a column — so proximity is what says which control they belong to, and that
    // only holds if they live inside the picker's own box rather than in the captions at the
    // bottom. `align-items: flex-start` keeps the chip at its natural width instead of stretching
    // it across the 220px control.
    field: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: theme.spacing(1) },
    control: { minWidth: 220 },
    hint: { marginTop: theme.spacing(1), display: 'block' },
    // The same cap the token table puts on its suggestion chip (TokenMappingTable.tsx:76): the two
    // controls sit on one screen, and a suggestion chip should look like a suggestion chip
    // wherever it appears.
    suggestChip: { maxWidth: 240 },
    // The warning red the token table uses for this exact condition (its `warnIcon`, :71). The icon
    // inherits it through currentColor, so the colour is stated once. Capped at the chip width so a
    // long sentence wraps under its own picker instead of stretching the flex row.
    vanished: {
        display: 'flex', alignItems: 'center', gap: theme.spacing(0.5),
        color: '#c0392b', fontWeight: 600, maxWidth: 240,
    },
}));

const BusinessColumnsPicker: React.FC<Props> = ({
    columns, supervisorColumnId, gapColumnId,
    storedGapColumnId, storedSortColumnId, onChange, supervisorEnabled = true,
    supervisorColumnIsGuess = false,
}) => {
    const classes = useStyles();
    const { t } = useTranslation();
    // §2.5 · the Select menu portals to document.body — outside App's inner <div dir> — and
    // <html dir> is stuck "ltr", so the dropdown opens LTR. Force its direction like the dialogs.
    const isRTL = useSelector((s: any) => s.core && s.core.isRTL);
    // `gapDisabled` is computed further down: it depends on `columnSet` and `hasVanished`, which
    // are declared below. See the argument there — it is deliberately stricter than the
    // `supervisorColumnId == null` test this line used to hold.

    // "Is this ColumnID still in the LOCKED version?" — THE single membership test on this screen,
    // used by the vanished guard and by the chip gate, so the warning and the suggestion can never
    // disagree about whether a column exists. Same structure and same purpose as
    // TokenMappingTable.tsx:88.
    const columnSet = useMemo(() => new Set(columns.map((c) => c.ColumnID)), [columns]);
    // ColumnID → the column itself, so a chip can name its candidate without a .find() per render.
    // Built from the SAME array under the SAME dependency as `columnSet`, so an id that passed the
    // columnSet gate is guaranteed to have an entry here — which is what lets `suggestionFor`
    // return a concrete column; its `|| null` is a type formality, not a reachable case.
    const columnByID = useMemo(() => {
        const m = new Map<number, SmartSendColumn>();
        columns.forEach((c) => m.set(c.ColumnID, c));
        return m;
    }, [columns]);

    // A stored id that is not in the locked version. `> 0` mirrors the token table's `isMapped`
    // (:204): 0 is the "None" item's value, never a real column, and the onChange below maps it
    // back to null — so a 0 arriving in props is a nothing, not a vanished something.
    const hasVanished = (value: number | null) => value != null && value > 0 && !columnSet.has(value);

    // THE SHORTFALL PICKER IS LIVE ONLY WHEN A SUPERVISOR COLUMN WILL ACTUALLY BE SAVED.
    //
    // This used to read `supervisorColumnId == null`, which asks the wrong question in two states
    // that both reach this screen. The caption underneath says the shortfall column has no effect
    // until a supervisor column is chosen; that sentence is only TRUE under the test below.
    //
    //  1. VANISHED (the campaign-1514933 state). A stored id that is not in the locked version is
    //     painted as "ללא" plus the vanished warning, and buildSaveRequest scrubs it to null
    //     (SmartSendScreen.tsx:266-273). Under the old test it was non-null, so the shortfall picker
    //     AND its chip stayed live next to a supervisor picker that visibly says "pick again" — and
    //     one click there would save a GapColumnID alongside SupervisorColumnID = null.
    //  2. UNCONFIRMED GUESS. `supervisorColumnIsGuess` means the value was filled by
    //     businessColumnDefaults, not chosen. buildSaveRequest posts NULL for a guess
    //     (SmartSendScreen.tsx:266-268), so the shortfall column provably has no effect while the
    //     guess stands. Worse, leaving the picker live let a click on the SHORTFALL chip reach
    //     setBusinessColumn('gapSort'), which clears `supervisorColumnIsGuess` — promoting a
    //     supervisor column the operator never looked at into a saved decision. That is precisely
    //     the R1-02 rule ("a machine guess is not a decision") being defeated through the back door,
    //     and it would have falsified this file's own claim that one click is one decision.
    //
    // Both states now disable the picker and suppress its chip, which leaves exactly one route
    // forward: confirm the supervisor column first — by its chip or by its dropdown. Once that is a
    // decision, touching the shortfall control is a genuine acknowledgement of it, which is the
    // premise smartSendSlice's 'gapSort' branch relies on when it clears the guess flag.
    const supervisorUsable =
        supervisorColumnId != null && !hasVanished(supervisorColumnId) && !supervisorColumnIsGuess;
    const gapDisabled = supervisorEnabled && !supervisorUsable;

    // The chip candidates. Pure functions of `columns` alone, so they are memoised on it and are
    // NOT recomputed while the user moves either picker. Both are the same helpers used elsewhere:
    // the supervisor one IS the slice's default (reused, deliberately not re-derived, so the chip
    // can never offer a different column from the one a blank-slate load would have filled in).
    const supervisorCandidate = useMemo(() => pickDefaultSupervisorColumn(columns), [columns]);
    const gapCandidate = useMemo(() => pickGapColumnCandidate(columns), [columns]);

    /**
     * The column a picker should OFFER, or null for "no chip". Derived state — a pure function of
     * (candidate, current value, columns), all three already in hand; storing it would put a guess
     * into state before anyone acted on it, which is the whole thing this design avoids
     * (TokenMappingTable.tsx:43-45 makes the same call for the token chips).
     */
    const suggestionFor = (candidate: number | null, current: number | null): SmartSendColumn | null => {
        // (1) There IS a candidate, and it belongs to THIS locked version. This is the last point
        //     before a ColumnID could reach a save request — the same guard, for the same reason,
        //     as TokenMappingTable.tsx:216. A candidate is computed from `columns`, so today it
        //     cannot fail; it is checked anyway because the cost of being wrong is a -9 on a save
        //     the operator did not cause.
        if (candidate == null || !columnSet.has(candidate)) return null;
        // (2) It is not already what is selected. Implied by (3) as the rules stand — a usable
        //     selection suppresses the chip outright — but stated separately because "offering the
        //     value that is already chosen" is nonsense under ANY later relaxation of (3), and a
        //     rule that is only true by coincidence is one refactor away from not being true.
        if (candidate === current) return null;
        // (3) Nothing USABLE is selected: either empty, or pointing at a column that vanished. A
        //     value the user can see and act on is never second-guessed — including a deliberate
        //     "ללא", which is a real decision (the picker maps None to null and the SP stores that
        //     verbatim). Null is the state a chip is FOR, and a vanished id is a null in every way
        //     that matters: it names nothing the user can keep, and the save scrubs it anyway. The
        //     chip then sits ALONGSIDE the vanished warning, never instead of it — exactly the
        //     arrangement TokenMappingTable.tsx:268-272 argues for on an unmapped row.
        if (current != null && columnSet.has(current)) return null;
        return columnByID.get(candidate) || null;
    };

    // AN UNCONFIRMED GUESS COUNTS AS "NOTHING SELECTED" FOR THE PURPOSE OF THE CHIP.
    //
    // Passing null instead of the id makes gates (2) and (3) above treat the guess as the non-value
    // it is, so the chip appears and NAMES the column the default filled in. That is not cosmetic —
    // it is the only route out of the state, and without it this component deadlocks:
    //   · `gapDisabled` (above) holds the shortfall picker inert while the supervisor is a guess;
    //   · a guess is posted as NULL by buildSaveRequest, so nothing about it is saved;
    //   · and re-selecting the SAME item in a MUI Select is not guaranteed to fire onChange, so the
    //     dropdown cannot be relied on to promote a guess into a decision.
    // The chip can, and it does it the same way as every other chip here: one click, through the
    // same `onChange`, which clears `supervisorColumnIsGuess` in the slice (smartSendSlice.ts:490)
    // and unlocks the shortfall picker. The label reads as a confirmation of what is already on
    // screen, which is exactly what the click means.
    const supervisorSuggest = supervisorEnabled
        ? suggestionFor(supervisorCandidate, supervisorColumnIsGuess ? null : supervisorColumnId)
        : null;
    // The shortfall chip is additionally silent while the picker is inert: with no supervisor
    // chosen the column has no effect at all (that is what `gapDisabled` says, and the caption
    // under the row says it in words), so offering one there would ask for a decision that does
    // nothing — and would ask for it in the one state where the operator has not yet made the
    // decision it depends on.
    const gapSuggest = gapDisabled ? null : suggestionFor(gapCandidate, gapColumnId);

    const menu = () => [
        <MenuItem key="none" value={0}>{t('DataSources.send.business.none')}</MenuItem>,
        // `resolveColumnLabel`, never a raw DisplayName: a blank name here is an unpickable blank
        // row in the list AND an empty box on the closed control. See the header.
        ...columns.map((c) => <MenuItem key={c.ColumnID} value={c.ColumnID}>{resolveColumnLabel(c)}</MenuItem>),
    ];

    const picker = (role: Role, labelKey: string, value: number | null, disabled: boolean, vanished: boolean) => (
        <FormControl variant="outlined" size="small" className={classes.control} disabled={disabled}>
            <InputLabel id={`bc-${role}-label`}>{t(labelKey)}</InputLabel>
            <Select
                labelId={`bc-${role}-label`}
                label={t(labelKey)}
                // EMPTY-BUT-VALID for a vanished id rather than the raw value: there is no MenuItem
                // matching a column that is not in `columns`, so MUI paints an empty box and logs an
                // out-of-range warning — the reported symptom, with no explanation attached. 0 is
                // the "None" item, so the control reads as empty on purpose and the caption
                // underneath says why. The STORED value is untouched; see the header.
                // (Same shape as TokenMappingTable.tsx:241, `value={vanished ? 0 : (mapped ?? 0)}`.)
                value={vanished ? 0 : (value ?? 0)}
                onChange={(e) => { const v = Number(e.target.value); onChange(role, v > 0 ? v : null); }}
                // Ties the warning below to the control for assistive tech: the string names no
                // picker, so on its own it cannot say which of the two lost its column.
                inputProps={vanished ? { 'aria-describedby': `bc-${role}-vanished` } : undefined}
                MenuProps={{ PaperProps: { dir: isRTL ? 'rtl' : 'ltr' } }}
            >
                {menu()}
            </Select>
        </FormControl>
    );

    // Modelled on the token table's suggestion chip (TokenMappingTable.tsx:273-285) down to the
    // props, because it is the same offer: outlined so it reads as an invitation rather than a
    // state, small so it sits under the control without competing with it, and clickable — one
    // click, one column, named on its face.
    const suggestChip = (role: Role, labelKey: string, candidate: SmartSendColumn) => {
        // The candidate's ACTUAL name is the whole safety argument, not decoration: what stops a
        // wrong guess being accepted is the operator reading the name and not clicking. That is why
        // this goes through `resolveColumnLabel` — a nameless chip ("הצעה: ") would put the guess
        // back beyond review, which is precisely what the label fix above exists to prevent.
        const label = t('DataSources.send.business.suggestApply', { name: resolveColumnLabel(candidate) });
        return (
            <Tooltip title={t('DataSources.send.business.suggestTip')} PopperProps={{ dir: isRTL ? 'rtl' : 'ltr' }}>
                <Chip
                    size="small"
                    clickable
                    variant="outlined"
                    className={classes.suggestChip}
                    label={label}
                    // The visible label names only the COLUMN. Out of context a screen-reader user
                    // cannot tell which picker it fills, so the picker's own label is spelled out —
                    // the same disambiguation TokenMappingTable.tsx:281 makes with the token name.
                    aria-label={`${label} — ${t(labelKey)}`}
                    // ONLY this. It is the identical call a manual pick makes, so the chip adds no
                    // new path into redux: SmartSendScreen.tsx:701 dispatches setBusinessColumn and
                    // marks the form edited, the slice treats it as a confirmation (it clears
                    // supervisorColumnIsGuess — smartSendSlice.ts:487-490 / :505-537), and the
                    // ordinary 750ms autosave persists it. Nothing is written before the click.
                    onClick={() => onChange(role, candidate.ColumnID)}
                />
            </Tooltip>
        );
    };

    // One picker plus the two things that can accompany it. Order is deliberate and matches the
    // token table's status cell: the WARNING first (what is wrong), the CHIP after (what you can do
    // about it) — a vanished column and an offer to replace it are the common pairing, not
    // alternatives.
    const field = (role: Role, labelKey: string, value: number | null, disabled: boolean, sugg: SmartSendColumn | null) => {
        const vanished = hasVanished(value);
        return (
            <Box className={classes.field}>
                {picker(role, labelKey, value, disabled, vanished)}
                {vanished && (
                    <Typography
                        variant="caption"
                        component="span"
                        id={`bc-${role}-vanished`}
                        className={classes.vanished}
                    >
                        {/* TEXT, where the token table uses an icon-only Tooltip (:258-262): that
                            table is a dense grid with a narrow status cell and 50 rows, this is a
                            control that just went visibly empty. A hover-only explanation is
                            unreachable on touch and invisible to the one user who most needs it —
                            the one wondering why the box is blank. The icon carries the severity. */}
                        <Warning fontSize="small" color="inherit" />
                        {t('DataSources.send.business.vanishedColumn')}
                    </Typography>
                )}
                {sugg && suggestChip(role, labelKey, sugg)}
            </Box>
        );
    };

    const colName = (id: number | null | undefined) => {
        if (id == null) return '';
        const c = columns.find((x) => x.ColumnID === id);
        // Resolved exactly like the dropdown's items — the warning below quotes two columns by
        // name, and quoting them differently from the list the user is about to pick from is the
        // split columnLabel.ts:33-37 rejects. The `String(id)` arm stays for the id that is not in
        // `columns` at all (a legacy sort column can easily have vanished); it is also what
        // `resolveColumnLabel` falls back to, so the two branches agree on the answer.
        return c ? resolveColumnLabel(c) : String(id);
    };

    // Only for mappings saved before gap and sort were merged: the server still holds two
    // DIFFERENT columns, and saving from this screen will collapse them onto the gap column.
    // Say so rather than discarding the user's old sort choice silently.
    const legacyDiffers =
        storedGapColumnId != null && storedSortColumnId != null && storedGapColumnId !== storedSortColumnId;

    return (
        <Box style={{ marginTop: 24 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t('DataSources.send.business.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary">{t('DataSources.send.business.hint')}</Typography>
            <Box className={classes.row}>
                {supervisorEnabled && field('supervisor', 'DataSources.send.business.supervisor', supervisorColumnId, false, supervisorSuggest)}
                {/* Displays the GAP id: it is the effective column either way (the server resolves
                    ISNULL(Sort, Gap)), and setBusinessColumn('gapSort') keeps the two in step. */}
                {field('gapSort', 'DataSources.send.business.gapSort', gapColumnId, gapDisabled, gapSuggest)}
            </Box>
            {gapDisabled && (
                <Typography variant="caption" color="textSecondary" className={classes.hint}>
                    {t('DataSources.send.business.needSupervisor')}
                </Typography>
            )}
            {legacyDiffers && (
                <Typography variant="caption" color="textSecondary" className={classes.hint}>
                    {t('DataSources.send.business.legacySortDiffers', {
                        sort: colName(storedSortColumnId),
                        gap: colName(storedGapColumnId),
                    })}
                </Typography>
            )}
        </Box>
    );
};

export default BusinessColumnsPicker;
