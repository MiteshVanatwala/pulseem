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
    borderRadius: 5,
    padding: 5,
    border: '1px solid grey',
    width: 'calc(100% - 60px)',
    height: 350,
    overflowY: 'scroll'
  }
});
