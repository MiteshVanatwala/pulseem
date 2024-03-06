import clsx from 'clsx';
import { Button, Grid, Typography } from "@material-ui/core";
import { getApiErrorResponseMessage } from '../../screens/Whatsapp/Common';

export class Props {
  classes: any;
  failedTemplateResponse: string = '';
	setDialogType: any;
	translator: any;
	isRTL: any;
}

export const TemplateErrorDialog = ({
  classes,
  failedTemplateResponse,
	setDialogType,
	translator,
	isRTL
}: Props) => {
  let failedTemplateReason = '';
	let failedTemplateTitle = translator('common.ErrorTitle');

	if (failedTemplateResponse?.includes('component of type FOOTER is missing expected field(s) (text)')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'footerIsMissingExpectedField';
	} else if (failedTemplateResponse?.includes('#common-rejection-reasons for more information')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'invalidFormat';
	} else if (failedTemplateResponse?.includes('INCORRECT_CATEGORY')) {
		failedTemplateTitle = 'incorrectCategory';
		failedTemplateReason = 'categoryNotMatched';
	} else if (failedTemplateResponse?.includes('SCAM')) {
		failedTemplateTitle = 'suspectedScam';
		failedTemplateReason = 'suspectedScam';
	} else if (failedTemplateResponse?.includes('component of type BODY is missing expected field')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'bodyIsMissingExpectedField';
	} else if (failedTemplateResponse === 'INVALID_FORMAT') {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'invalidFormat';
	} else if (failedTemplateResponse?.includes('is not a valid phone number.')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'invalidPhoneNumber';
	} else if (failedTemplateResponse?.includes('Character Limit Exceeded')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'moreCharacters';
	} else if (failedTemplateResponse?.includes('ABUSIVE_CONTENT')) {
		failedTemplateTitle = 'abusiveContent';
		failedTemplateReason = 'abusiveContentsInTemplate';
	} else if (failedTemplateResponse?.includes('BUTTONS is missing expected field')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'buttonIsMissingExpectedField';
	} else if (failedTemplateResponse?.includes('more than 1,024 characters.')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'moreThan1024Characters';
	} else if (failedTemplateResponse?.includes('variables, newlines, emojis, or formatting characters.')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'invalidButtonFormat';
	} else if (failedTemplateResponse?.includes('No elements passed in the last 10000000000 nanoseconds.')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'noElementPassed';
	} else if (failedTemplateResponse?.includes('more than two consecutive newline characters.')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'twoNewLineCharactersNotAllowed';
	} else if (failedTemplateResponse?.includes('404 Not Found')) {
		failedTemplateTitle = '404NotFound';
		failedTemplateReason = 'unableToReadFromURL';
	} else if (failedTemplateResponse?.includes('AUTHENTICATION category')) {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'noImageAuthentication';
	} else {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'invalidFormat';
	}

  return ({
    title: translator(getApiErrorResponseMessage('templateError', failedTemplateTitle)),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {translator(getApiErrorResponseMessage('templateError', failedTemplateReason))}
      </Typography>
    ),
    renderButtons: () => (
			<Grid
				container
				spacing={4}
				className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
			>
				<Grid item>
					<Button
						variant='contained'
						size='small'
						onClick={() => { setDialogType(null) }}
						className={clsx(
							classes.btn,
							classes.btnRounded
						)}>
						{translator('common.Ok')}
					</Button>
				</Grid>
			</Grid>
		)
  });
};
