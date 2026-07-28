import { makeStyles } from '@material-ui/core/styles';

// One typography scale for every Data Sources popup (design feedback: the dialog text read a step too
// small next to the page behind it). Applied as the Dialog's PaperProps className so it cascades to the
// title / body / tables / actions of that dialog only — nothing outside the feature is affected.
// Inline `style={{ fontSize }}` on a specific element still wins, so deliberate captions (12–13px hints,
// helper text) keep their size.
export const useDsDialogStyles = makeStyles({
    paper: {
        // title: MUI's h6 (20px) → one step up, and heavier so the popup has a clear anchor
        '& .MuiDialogTitle-root .MuiTypography-root': { fontSize: 22, fontWeight: 700 },
        // body copy
        '& .MuiDialogContent-root': { fontSize: 17 },
        '& .MuiDialogContent-root .MuiTypography-root': { fontSize: 17 },
        // in-dialog tables stay denser than body copy, but up from MUI's 14px
        '& .MuiDialogContent-root .MuiTableCell-root': { fontSize: 15 },
        // form controls + actions
        '& .MuiFormControlLabel-label': { fontSize: 16 },
        '& .MuiInputBase-input': { fontSize: 16 },
        '& .MuiDialogActions-root .MuiButton-root': { fontSize: 15 }
    }
});
