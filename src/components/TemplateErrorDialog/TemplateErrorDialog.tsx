import clsx from 'clsx';
import { Button, Grid, Typography } from "@material-ui/core";
import { getApiErrorResponseMessage } from '../../screens/Whatsapp/Common';
import { templateErrors } from '../../screens/Whatsapp/Constant';
import { WhatsappTemplateError } from '../../screens/Whatsapp/Editor/Types/WhatsappCreator.types';

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
  let failedTemplateReason: string = 'invalidFormat';
	let failedTemplateTitle: string = 'common.ErrorTitle';

	if (failedTemplateResponse === undefined) return {};
	else if (failedTemplateResponse === 'INVALID_FORMAT') {
		failedTemplateTitle = 'invalidFormat';
		failedTemplateReason = 'invalidFormat';
	} else {
		// @ts-ignore
		const error = templateErrors.find((sr: WhatsappTemplateError) => failedTemplateResponse.contains(sr.key));
		failedTemplateTitle = error?.title || 'invalidFormat';
		failedTemplateReason = error?.reason || 'common.ErrorTitle';
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
