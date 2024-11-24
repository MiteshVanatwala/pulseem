export const surveyStyle = (windowSize, isRTL, theme) => ({
  justifySpaceBetween: {
    justifyContent: 'space-between'
  },
  surveySettingContainer: {
    alignItems: 'center', justifySelf: 'flex-end', paddingInlineEnd: 15
  },
  surveyPapaerContainer: {
    height: 450, overflow: 'hidden auto', margin: 15
  },
  surveyResults: {
    direction: 'ltr', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between'
  },
  textAnswerContainer: {
    width: '100%', height: '50%', overflow: 'hidden', overflowY: 'auto'
  },
  textAnswerDirection: {
    padding: 15, direction: isRTL ? 'rtl' : 'ltr'
  },
  pInline15: {
    paddingInline: 15
  },
  subHeaderInherit: {
    color: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit'
  },
  answerListContainer: {
    width: '100%', maxWidth: 'calc(100% - 15px)', direction: isRTL ? 'rtl' : 'ltr'
  }
});