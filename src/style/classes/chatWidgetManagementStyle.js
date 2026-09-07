// Chat Widget management screen. Deliberately narrow: the card chrome, stat band,
// action row, status chips and stat cards are all reused from
// getPopUpManagementStyle — popupCard, statsContainer, statItem, actionsContainer,
// actionButtonPopupManagement, activeChip/inactiveChip/draftChip, statCard — so the
// two management screens read as one system. Only what is specific to widgets is here.
//
// This also replaces the hardcoded hex values that were inline in WidgetListPage
// (#FF1744, #fff0f3 and three badge palettes), which belonged to no theme.
export const getChatWidgetManagementStyle = (windowSize, isRTL, theme) => ({
  // Search / filter / sort bar. Same chrome as the cards below it, matching how the
  // popup screen reuses popupCard for its toolbar.
  widgetToolbar: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    padding: theme.spacing(1.25),
  },
  // Domain group header above each domain's widgets, carrying the Embed action.
  widgetDomainHeader: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
      gap: theme.spacing(1),
    },
  },
  widgetDomainIcon: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    marginRight: isRTL ? 0 : theme.spacing(2),
    marginLeft: isRTL ? theme.spacing(2) : 0,
  },
  widgetDomainName: {
    fontWeight: 600,
    marginRight: isRTL ? 0 : theme.spacing(2),
    marginLeft: isRTL ? theme.spacing(2) : 0,
    wordBreak: 'break-all',
  },
  // The fact band holds strings — a domain, a URL, a date — not the short numerals
  // the popup card's statItem was built for. statItem centres its content, which
  // leaves three text values floating mid-column with nothing to line up against,
  // so these align to the reading edge and share it with their label.
  widgetFactItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: isRTL ? 'right' : 'left',
    minWidth: 0,
    padding: theme.spacing(0.5, 0),
  },
  widgetFactLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.grey[600],
    lineHeight: 1.4,
    '& svg': { fontSize: 16, flexShrink: 0 },
  },
  widgetFactValue: {
    fontWeight: 600,
    fontSize: '0.95rem',
    marginTop: theme.spacing(0.25),
    color: theme.palette.text.primary,
    // A long URL must not push the neighbouring column out of the row.
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // "No website URL set" is the absence of a value, so it must not be dressed as
  // one — bold black text reads as real data at a glance.
  widgetFactValueEmpty: {
    fontWeight: 400,
    fontStyle: 'italic',
    color: theme.palette.grey[500],
  },
  widgetEmptyState: {
    padding: theme.spacing(6),
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: `1px dashed ${theme.palette.grey[400]}`,
  },
  widgetEmptyIcon: {
    color: theme.palette.grey[400],
  },
});
