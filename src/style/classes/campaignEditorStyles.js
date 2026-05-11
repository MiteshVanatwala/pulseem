export const getCampaignEditorStyle = (windowSize, isRTL) => ({
  emailField: {
    /*direction: 'ltr',
    textAlign: 'right'*/
  },
  lightBlueTicket: {
    backgroundColor: '#3498DB',
    height: 40,
    alignItems: 'center',
    textAlign: 'center',
    display: 'flex',
    position: 'relative',
    '& label': {
      textAlign: 'center',
      color: '#fff',
      fontSize: 16
    }
  },
  accordionHelpText: {
    margin: 0,
    fontSize: 16
  },
  previewIframe: {
    borderRadius: 0,
    boxSizing: 'border-box',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    width: '100%',
    minHeight: 300,
    maxHeight: 400,
    overflowY: 'hidden',
    alignSelf: 'flex-end'
  },
  testSendSummaryContainer: {
    marginTop: 12,
    width: '100%',
  },
  testSendSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  testSendSummaryEmail: {
    direction: 'ltr',
    flex: 1,
  },
  testSendSummaryStatus: {
    fontWeight: 600,
    marginInlineStart: 8,
    whiteSpace: 'nowrap',
  },
  testSendSummaryNotSent: {
    marginInlineEnd: 4,
    fontWeight: 700,
    color: '#f44336',
  },
});
