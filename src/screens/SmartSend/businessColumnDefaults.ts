import { SmartSendColumn } from '../../Models/DataSources/SmartSend';

// Pure helpers that pick the DEFAULT business columns for the smart-send mapping screen.
// No React, no redux, no side effects — they are called from inside two smartSendSlice
// reducers (getMapping.fulfilled and loadSourceColumns.fulfilled), which is the only place
// where the column list and the three business ids land in the SAME commit.
//
// WHY THE SLICE AND NOT A useEffect IN THE SCREEN:
//  · a screen effect needs a "did I already apply this?" ref keyed on campaign+source, and that
//    key is wrong on a RETURN visit (A → B → A): selectSource has just nulled the three ids again
//    (smartSendSlice selectSource) but the key is already burnt, so the picker comes back empty.
//  · a reducer is structurally incapable of setting `dirty` — `dirty` is component state in
//    SmartSendScreen, written only by the two user onChange handlers. That is exactly the
//    property we need: a guessed default must NEVER trip the 750ms autosave and write a
//    synthetic group + a searchable-column index to the shared production DB on its own.
//    The default rides along on the first save the user genuinely triggers.

// NOTE ON THE SHORTFALL ("gap") COLUMN — there is deliberately NO auto-default for it.
//
// An earlier revision guessed it from the column name, porting the word list of the deployed
// supervisor job dbo.CampaignSupervisorJob_ProcessRequest_V2 (חוסר / נשאר / חסר) and adding
// פער / יעד because the columns in this project are named that way. Independent review killed it
// on two counts, both verified:
//
//  1. WRONG ANSWER. Scanning columns in Ordinal order and matching ANY word gives no priority
//     between words, so on this repo's own fixtures "יעד רבעוני" (Ordinal 4 — a TARGET column)
//     won over "פער מהיעד" (Ordinal 7 — the actual shortfall). The control labelled
//     "עמודת החוסר ליעד" would have pre-selected the target, and the next save would persist it.
//  2. REAL COST FOR A GUESS. A non-null GapColumnID makes CampaignsToDataSources_Set run the
//     OPENJSON SearchValues build and flip IsSearchable = 1 on the shared production version —
//     and DataSources_UpdateColumnMeta then returns -8 for turning IsSearchable back off while
//     the reference exists. A guessed value would be expensive AND awkward to undo.
//
// The product owner asked to DEFAULT the supervisor column and to MERGE the gap+sort controls;
// he did not ask to guess the shortfall column. So the merged picker starts empty, exactly as
// the two separate pickers did before. If a default is wanted later, align the word list with
// whatever ProcessRequest_V3 ends up detecting (V3 is not deployed today, so the mail is still
// ordered by what V2 finds in the mail BODY, not by this column).

// The three localized labels the upload wizard writes into DisplayName when it AUTO-detects a
// second email column as the supervisor (DataSources*.json → wizard.roleSupervisorEmail):
// he "אימייל מפקח" / en "Supervisor email" / pl "E-mail przełożonego".
export const SUPERVISOR_NAME_RE = /מפקח|supervisor|przełożon/i;

// "This column holds email addresses", by NAME. Needed because DataType is not reliable —
// see isEmailish below.
const EMAIL_NAME_RE = /e-?mail|מייל|אימייל|דוא"?ל/i;

// DataSourceColumns.DataType: 1=Text, 2=Number, 3=Date, 4=Email, 5=Phone
const DATA_TYPE_EMAIL = 4;
// DataSourceColumns.SemanticRole: 0=None, 1=RecipientEmail, 2=RecipientCellphone
const SEMANTIC_ROLE_NONE = 0;
const SEMANTIC_ROLE_RECIPIENT_EMAIL = 1;

// A supervisor-email column has NO server-side marker: the wizard's IsSupervisorEmail flag is
// UI-only and is stripped before upload (UploadWizardDialog states this explicitly, and the
// string appears in zero .cs files). Only two things survive to the DB:
//   · the pair (DataType = EMAIL, SemanticRole = NONE) — an email column that is not the identity;
//   · on the wizard's AUTO path only, a DisplayName rewritten to the localized supervisor label.
//
// DataType alone is NOT a dependable signal, which is why the name is also consulted:
//   · a source created programmatically (the worker / API upload path) never runs the wizard's
//     value-sampling, so its columns can all land as TEXT;
//   · EditColumnDialog offers only TEXT/NUMBER/DATE for a SemanticRole=NONE column, so one stray
//     pick demotes a supervisor column away from EMAIL with NO route back;
//   · a column whose values were not recognised as emails at upload time stays TEXT.
// Requiring DataType = EMAIL therefore makes the default silently not fire on perfectly ordinary
// sources. The identity column is excluded by SemanticRole, which IS dependable: RecipientEmail is
// unique per version, enforced by the filtered index IX_DataSourceColumns__VersionID_EmailRole.
const columnText = (c: SmartSendColumn) => `${c.DisplayName || ''} ${c.SourceHeader || ''}`;

// Not the recipient identity — the one hard requirement in every tier below.
const isNotIdentity = (c: SmartSendColumn) => c.SemanticRole !== SEMANTIC_ROLE_RECIPIENT_EMAIL;

// Looks like it carries email addresses, by tag OR by name.
const isEmailish = (c: SmartSendColumn) =>
    c.DataType === DATA_TYPE_EMAIL || EMAIL_NAME_RE.test(columnText(c));

/**
 * Default for the supervisor-email picker.
 *
 * This reconstructs the upload wizard's own rule from what actually survives to the DB.
 * UploadWizardDialog auto-detect: the FIRST email column becomes the recipient identity
 * (SemanticRole = RECIPIENT_EMAIL) and every LATER email column is tagged supervisor —
 * "2nd+ email → supervisor (saved as info field)". That tag is UI-only and is stripped from the
 * upload payload, so the persisted signature of a supervisor column is exactly
 * (DataType = EMAIL, SemanticRole = NONE), plus — on the auto path only — a DisplayName rewritten
 * to the localized "supervisor email" label.
 *
 * Three tiers, first hit wins. Every tier excludes the recipient-identity column.
 *   1. Its name says "supervisor" — the wizard's auto path rewrites DisplayName to exactly that,
 *      so this is the strongest signal. Deliberately does NOT require an email DataType: a
 *      column literally called "אימייל מפקח" is the supervisor column whatever its tag says.
 *   2. It is tagged DataType = EMAIL — the classic case, "the second email column in the file".
 *   3. Its NAME looks like an email column — the fallback for sources whose columns were never
 *      typed as EMAIL (programmatic upload, or a DataType destroyed via EditColumnDialog).
 * Within a tier the FIRST match in Ordinal order wins, which is literally the product rule:
 * the first email column is the recipient identity, the next one is the supervisor.
 *
 * Both server paths return columns ordered by Ordinal (CampaignsToDataSources_Get RS2 and
 * DataSources_Get RS2 both end in ORDER BY c.Ordinal ASC), so array order IS document order and
 * no re-sort is needed here.
 */
export const pickDefaultSupervisorColumn = (columns: SmartSendColumn[] | null | undefined): number | null => {
    if (!columns || !columns.length) return null;
    const eligible = columns.filter(isNotIdentity);
    if (!eligible.length) return null;

    const hit =
        eligible.find((c) => SUPERVISOR_NAME_RE.test(columnText(c)))
        || eligible.find((c) => c.DataType === DATA_TYPE_EMAIL)
        || eligible.find(isEmailish);

    return hit ? hit.ColumnID : null;
};

/**
 * Fills the supervisor column when — and ONLY when — there is nothing stored to respect.
 *
 * `applyDefaults` is the caller's answer to "is this a blank slate?". It MUST be false for a
 * mapping that already exists on the server, because "no supervisor" is a legitimate saved
 * decision: BusinessColumnsPicker maps the "ללא"/None item to null and the SP stores that NULL
 * verbatim, so a cleared value is indistinguishable from a never-chosen one by inspection.
 * Without that gate the guess is reinstated on every screen load and re-persisted by the next
 * save, and the user has no way to keep "no supervisor" on a source that has a second email
 * column. Callers pass `!IsMapped` for the load path and `true` for a fresh source pick.
 *
 * Gap and Sort are returned untouched — there is no auto-default for them; see the note above.
 */
export const applyBusinessColumnDefaults = (
    columns: SmartSendColumn[] | null | undefined,
    current: { supervisorColumnId: number | null; gapColumnId: number | null; sortColumnId: number | null },
    applyDefaults: boolean,
): { supervisorColumnId: number | null; gapColumnId: number | null; sortColumnId: number | null } => {
    const supervisorColumnId = (applyDefaults && current.supervisorColumnId == null)
        ? pickDefaultSupervisorColumn(columns)
        : current.supervisorColumnId;

    return { supervisorColumnId, gapColumnId: current.gapColumnId, sortColumnId: current.sortColumnId };
};
