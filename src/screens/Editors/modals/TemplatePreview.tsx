import clsx from "clsx";
import { Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { RenderHtmlTemplate } from '../../../helpers/Utils/HtmlUtils';

const TemplatePreview = ({
  classes,
  isOpen = false,
  templateDetails = {},
  onClose = () => null,
  isMyTemplate = false
}: any) => {
  const { t } = useTranslation();

  return <BaseDialog
    classes={classes}
    customContainerStyle={classes.beeTemplate}
    contentStyle={classes.beeTemplate}
    open={isOpen}
    showDivider={true}
    onConfirm={() => {
      onClose(templateDetails);
    }}
    onClose={onClose}
    onCancel={onClose}
    reduceTitle
    showDefaultButtons={true}
    title={t('common.Preview')}
    confirmText={t('common.loadTemplate')}
  >
    <Box className={clsx(classes.templateModal)} style={{ direction: 'ltr' }}>
      {isMyTemplate
        ? RenderHtmlTemplate(templateDetails.Html)
        : (
          <img src={decodeURIComponent(templateDetails?.ThumbnailUrl)}
            style={{
              width: '100%',
              height: 'auto',
              overflowY: 'auto'
            }}
            alt={templateDetails.Name}
            title={templateDetails.Name}
          />
        )
      }
    </Box>
  </BaseDialog>
}

export default TemplatePreview;
