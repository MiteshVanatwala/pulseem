import clsx from 'clsx';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button, Grid, Typography } from "@material-ui/core";
import { getApiErrorResponseMessage } from '../../screens/Whatsapp/Common';
import { coreProps } from '../../model/Core/corePros.types';

export class Props {
  classes: any;
  failedTemplateResponse: string = '';
	setDialogType: any
}

export const TemplateErrorDialog = ({
  classes,
  failedTemplateResponse,
	setDialogType
}: Props) => {
  const { t: translator } = useTranslation();
	const { isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [failedTemplateReason, setFailedTemplateReason] = useState<string>('');

	useEffect(() => {
		if (failedTemplateResponse?.includes('BODY is missing expected field')) {
			setFailedTemplateReason('invalidTemplateName');
		} else if (
			failedTemplateResponse?.includes('FOOTER is missing expected field')
		) {
			setFailedTemplateReason('noFooter');
		} else if (failedTemplateResponse?.includes('is not a valid phone number')) {
			setFailedTemplateReason('invalidPhone');
		} else if (
			failedTemplateResponse?.includes(
				'Character Limit Exceeded. The Body (or Content) field '
			)
		) {
			setFailedTemplateReason('characterExceeded');
		} else {
			setFailedTemplateReason('common');
		}
	}, [ failedTemplateResponse ])

  return ({
    title: translator('common.ErrorTitle'),
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
