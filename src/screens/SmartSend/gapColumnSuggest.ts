import { SmartSendColumn } from '../../Models/DataSources/SmartSend';

// A RANKED candidate for the shortfall ("gap") business column, to be offered as a click-to-apply
// CHIP beside the picker. Pure, total, deterministic: no React, no redux, no i18n, no Date, no
// randomness, no network. It takes a column list and returns one ColumnID or null; it writes
// nothing, and the only way its answer reaches state is a user clicking the chip, which dispatches
// the very same `setBusinessColumn` a manual pick from the Select dispatches.
//
// ── WHY THIS IS A CHIP AND NOT A DEFAULT ────────────────────────────────────────────────────
// businessColumnDefaults.ts:18-38 records that there is deliberately NO auto-default for this
// column, on two verified counts. THAT NOTE STANDS, UNAMENDED, AND THIS MODULE MUST NOT BE WIRED
// INTO applyBusinessColumnDefaults OR ANY REDUCER. Its second count is a COST rather than a naming
// problem and so survives any improvement to the matching: a non-null GapColumnID makes
// CampaignsToDataSources_Set run the OPENJSON SearchValues build and flip IsSearchable = 1 on the
// shared production version, and DataSources_UpdateColumnMeta then returns -8 for turning
// IsSearchable back off while the reference exists. Expensive, and awkward to undo.
//
// What makes that unpayable for a GUESS is that gap has no escape hatch. The supervisor column has
// one — SmartSendScreen.tsx:266-268 posts SupervisorColumnID as NULL for as long as
// `supervisorColumnIsGuess` is set, so an unconfirmed guess is visible on screen without ever
// reaching the DB. There is no `gapColumnIsGuess`, and :269-272 says so in as many words: gap is
// posted with the locked-version scrub and nothing else, "nothing ever fills them in without a
// click". A pre-fill would make that comment false and the first 750ms autosave (the effect at
// SmartSendScreen.tsx:369, timer at :379) would persist the guess as a decision.
//
// A CLICK IS THE MISSING GATE, and it keeps that comment true: the chip is a click, so gap still
// only ever gets a value the operator asked for. This is the same asymmetry TokenMappingTable.tsx
// :37-41 argues for the token chips — a suggestion that is READ and then chosen costs one glance
// when it is wrong; a suggestion that is WRITTEN costs a production row nobody re-checks.
//
// ── WHY RANKED, AND NOT "MATCH ANY OF THE WORDS" ────────────────────────────────────────────
// The first count in that same note is a WRONG ANSWER, and it is preserved as this repo's own
// regression fixture (suggestMapping.selftest.test.ts:118-125): a matcher that walked the columns
// in Ordinal order and accepted ANY word from a flat list picked "יעד רבעוני" (Ordinal 4 — a
// TARGET column) for the control labelled "עמודת החוסר ליעד", beating "פער מהיעד" (Ordinal 7 — the
// actual shortfall). POSITION DECIDED, because a flat list gives the matcher no way to say that
// one word is better evidence than another, so the only tie-break left is where the column happens
// to sit in the file.
//
// Ranking takes that job away from position. The tiers are searched one whole tier at a time, so
// ANY tier-1 hit beats EVERY tier-2 hit no matter where either sits, and Ordinal is demoted to
// what it can honestly decide: a tie between words of EQUAL strength.
//
// ── WHY יעד IS NOT ON THE LIST AT ALL, NOT EVEN LAST ────────────────────────────────────────
// יעד ("target") was the other half of the rejected rule and it is the half that did the damage.
// It names the thing a shortfall is measured AGAINST, so it turns up in the shortfall column's own
// name ("פער מהיעד", and the control's label "עמודת החוסר ליעד") and equally in every target
// column's name ("יעד רבעוני", "יעד שנתי"). It is evidence that the sheet is about targets; it is
// never evidence that THIS column is the gap. Demoting it to a low tier would not be enough
// either: on the fixture above it is the FREQUENT word — two columns carry it, which is precisely
// the shape suggestMapping's IDF exists to discount — so a יעד tier would still fire whenever no
// better word appeared anywhere, and fire on the first target column it met. It is therefore
// ABSENT: a column whose name contains יעד and none of the words below MUST NOT match. That is a
// property to assert in a test, not merely to promise in a comment.
//
// ── WHERE THE WORDS COME FROM ───────────────────────────────────────────────────────────────
// Tier 1 · חוסר — the product owner's own proposal, and the first alternative the DEPLOYED
//          supervisor job detects: dbo.CampaignSupervisorJob_ProcessRequest_V2.StoredProcedure.sql
//          :353-357 sets @IsGap for a column title LIKE %חוסר% OR %נשאר% OR %חסר%. It is also the
//          word the control itself uses (DataSources send.business.gapSort, he "עמודת החוסר ליעד").
// Tier 2 · חסר, נשאר — V2's other two, same authority, ranked below חוסר only because חוסר is the
//          one the owner named and the one the label uses. חסר in particular is a bare three-letter
//          root that also reads as an ordinary adjective ("missing"), so it is likelier than חוסר
//          to appear in the name of a column that is not the gap.
// Tier 3 · פער — NOT in V2. It is here because the columns in this project are named that way
//          ("פער מהיעד"), and it is ranked LAST for exactly that reason: it is the surviving half
//          of the rule review rejected, so it may earn a suggestion, but it does not get to
//          outrank a word the deployed job would itself accept.
// Matching is a SUBSTRING test — the same thing V2's LIKE N'%…%' performs — with no normalization,
// stemming or similarity scoring. All four words are Hebrew, which is caseless, so there is no
// case handling to get wrong. Deliberately nothing cleverer: suggestMapping.ts is the record of
// how far similarity scoring gets on column names, and this control has ONE slot to fill, not 50.
//
// ── WHAT THIS RETURNS ON THE RECORDED FAILURE ───────────────────────────────────────────────
// On REGRESSION_COLUMNS (suggestMapping.selftest.test.ts:118-125 — שם הסוכן · אימייל · יעד רבעוני ·
// יעד שנתי · פער מהיעד · סכום מכירות) tiers 1 and 2 find nothing at all, and tier 3 finds exactly
// one column: 107 "פער מהיעד" — the RIGHT one, and the one the old guesser lost to Ordinal. Neither
// יעד column is a candidate in any tier. That is the whole fix in one fixture: the recorded wrong
// answer is now unreachable, and the right answer is still reachable.
//
// If ProcessRequest_V3 ever ships with its own detection, align GAP_WORDS_RANKED with what V3
// actually detects — the same invitation businessColumnDefaults.ts:36-38 leaves — because the mail
// is ordered by whatever the JOB finds, and a chip that disagrees with the job is a chip that
// teaches the operator to distrust it.

/**
 * The word tiers, STRONGEST FIRST. Exported so a test can assert the ORDER and the absence of יעד:
 * the ranking IS the fix here, and a test that only checked "some word matched" would pass on the
 * very rule that was rejected. Exported also so there is exactly ONE place to edit when V3 lands.
 *
 * Substring tests, like V2's LIKE N'%…%'. The tiers do not silently overlap: none of the tier-2 or
 * tier-3 words is a substring of חוסר (חסר is ח-ס-ר, חוסר is ח-ו-ס-ר — the ו breaks it), so a
 * tier-1 column cannot also be reached by a lower tier and the ranking cannot be short-circuited.
 */
export const GAP_WORDS_RANKED: ReadonlyArray<ReadonlyArray<string>> = [
    ['חוסר'],
    ['חסר', 'נשאר'],
    ['פער'],
];

// The text a column is matched against: DisplayName AND the raw SourceHeader, joined by a space so
// that nothing can match ACROSS the join (a name ending "…ח" followed by a header opening "וסר…"
// must not read as חוסר). Same surface as businessColumnDefaults.ts:70.
//
// RESTATED, NOT IMPORTED, on purpose: that copy is file-private, and exporting it would mean
// editing a module this change has no other business in — while the two matchers ask different
// questions of the same text (does this column carry ADDRESSES / is this column the GAP). One
// duplicated line is the cheaper coupling. If a THIRD consumer ever wants it, hoist one of the two
// into a shared module — do not add a third copy.
//
// Including SourceHeader is nearly free rather than important: in this deployment DisplayName is
// Hebrew and SourceHeader tends to be Latin (suggestMapping.ts records that split), so a Hebrew
// gap word usually lands in DisplayName. It costs one concatenation and it covers the source
// uploaded with Hebrew headers and never renamed, plus the column whose DisplayName is blank —
// which the API's own model permits (Models/DataSources/SmartSend.ts:52-53: both plain `string`).
const columnText = (c: SmartSendColumn): string => `${c.DisplayName || ''} ${c.SourceHeader || ''}`;

/**
 * The chip's candidate for the shortfall column: the best-RANKED column whose name carries one of
 * the words above, or null when none does.
 *
 * NULL IS THE COMMON AND CORRECT ANSWER, and it stays cheap on purpose. No chip at all is always
 * better than a chip pointing at the wrong column, because the wrong one is one click away from a
 * value that is expensive to unpick (the IsSearchable / -8 story above). So there is no fallback
 * tier here — nothing offers "the first numeric column" or "the column next to the target" when the
 * words miss. A source whose gap column is called something else simply gets no chip, and the
 * Select beside it still does what it always did.
 *
 * Tier by tier, ALL columns per tier before the next tier is considered: a tier-1 hit at the last
 * Ordinal beats a tier-2 hit at the first. Within one tier the first match in ARRAY order wins, and
 * array order IS Ordinal order — both server paths that produce this list end in ORDER BY c.Ordinal
 * ASC (CampaignsToDataSources_Get RS2, DataSources_Get RS2), the same fact pickDefaultSupervisorColumn
 * leans on (businessColumnDefaults.ts:106-108). Note the loop nesting that encodes this: columns are
 * the OUTER loop inside a tier, so "first match" is decided by the column's position and never by
 * where a word happens to sit in the tier — the words of one tier are equal evidence by definition.
 *
 * NO ELIGIBILITY FILTER, unlike pickDefaultSupervisorColumn's isNotIdentity: the shortfall column
 * has no persisted signature to lean on — it is an ordinary number column, DataType and
 * SemanticRole say nothing about it, and V2 itself decides purely on the title. The name is the
 * whole of the evidence, which is also why the answer is only ever a suggestion.
 *
 * Total: a null, undefined or empty column list returns null.
 */
export const pickGapColumnCandidate = (columns: SmartSendColumn[] | null | undefined): number | null => {
    if (!columns || !columns.length) return null;

    for (let tier = 0; tier < GAP_WORDS_RANKED.length; tier += 1) {
        const words = GAP_WORDS_RANKED[tier];
        const hit = columns.find((c) => {
            const text = columnText(c);
            return words.some((w) => text.indexOf(w) > -1);
        });
        if (hit) return hit.ColumnID;
    }

    return null;
};
