export const surveyStyle = (windowSize, isRTL, theme) => ({
  justifySpaceBetween: {
    justifyContent: 'space-between'
  },
  surveySettingContainer: {
    alignItems: 'center', justifySelf: 'flex-end', paddingInlineEnd: 15
  },
  surveyPapaerContainer: {
    height: 400, overflow: 'hidden auto', margin: 15
  },
  surveyResults: {
    direction: 'ltr', display: 'flex', alignItems: 'flex-end', flexDirection: 'column'
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
  }
});