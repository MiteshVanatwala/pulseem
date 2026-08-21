import { SmartSendColumn } from '../../Models/DataSources/SmartSend';

// THE one answer to "what is this column called", for every control on the smart-send screen.
// Pure, total, no React, no redux, no i18n — a column in, a non-empty string out.
//
// WHY IT IS ITS OWN MODULE NOW: it was written as a file-private const inside
// TokenMappingTable.tsx, back when that table was the only place a column name reached the
// screen. It is not any more — BusinessColumnsPicker renders the same columns in two Selects of
// its own (and named them with a raw `DisplayName`, which is the defect this move exists to let
// us fix in one place). The argument the block below makes was never an argument about a FILE;
// it is an argument about NAMING SURFACES, and there are now several. Copying four lines into the
// second component would have created exactly the split the block's own "WHY BOTH SURFACES"
// paragraph rejects — two controls naming one column differently — so the const moved out and is
// exported instead.
//
// MOVED, NOT REWRITTEN: the doc comment below is the original from TokenMappingTable.tsx:54-79,
// kept VERBATIM, because it is the review record for a decision that has not changed. Read "this
// file" in it as "the file it was written in"; the rule it states now binds every importer.

// THE single resolution of "what is this column called", shared by every surface in this file that
// names a column: the suggestion chip's label and the Select's own MenuItem.
//
// WHY IT EXISTS (review finding): the chip's label was built from `DisplayName` alone, and the API
// models that as a plain `string`, not as required-non-empty (Models/DataSources/SmartSend.ts:53).
// A column whose DisplayName is "" therefore rendered a NAMELESS chip — "הצעה: " / "Suggested: "
// with nothing after it. The user was being asked to accept a suggestion they could not identify.
//
// THIS IS NOW THE WHOLE SAFETY ARGUMENT FOR SUGGESTIONS, not a cosmetic fix: with the bulk button
// gone, what stops a high-scoring but WRONG candidate (`MobilePhone` → "טלפון נייד חסום") is that
// the user reads the column's real name before clicking. A blank or unrecognisable label would put
// the guess back beyond review, which is exactly the failure the button was removed for.
//
// WHY BOTH SURFACES AND NOT JUST THE CHIP: fixing the chip alone would leave the dropdown rendering
// a blank <MenuItem> for the same column, so the two controls would name one column differently —
// the chip would say something and the Select nothing. That is worse than the original hole, because
// a user who accepted the chip could no longer find the row's value in the list. Anything that puts
// a column's name on screen goes through here.
//
// THE CHAIN, WEAKEST LAST: DisplayName is what the user renamed the column to and is what the rest
// of the screen means by "column"; SourceHeader is the raw header the file was uploaded with (same
// model, :52) and is the nearest thing the user would still recognise; the ColumnID is the last
// resort — meaningless to a human, but never blank, and that is exactly the point: the return value
// is non-empty BY CONSTRUCTION, so no caller downstream can render nothing. Whitespace-only names
// are trimmed into the empty case for the same reason (" " is as unidentifiable as "").
// NO NEW i18n KEY: none of the three is copy — all three are data already carried on the column.
export const resolveColumnLabel = (c: SmartSendColumn): string => (
    (c.DisplayName && c.DisplayName.trim())
    || (c.SourceHeader && c.SourceHeader.trim())
    || String(c.ColumnID)
);
