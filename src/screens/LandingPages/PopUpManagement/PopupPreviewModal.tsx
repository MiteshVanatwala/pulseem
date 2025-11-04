import React, { useState, useEffect, useRef } from 'react';
import { Dialog, IconButton, Box } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { getLandingPagePreview } from '../../../redux/reducers/landingPagesSlice';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { Loader } from '../../../components/Loader/Loader';
import { actionURL } from '../../../config';

interface PopupPreviewModalProps {
  open: boolean;
  onClose: () => void;
  popupId: number;
  classes: Record<string, string>;
}

const PopupPreviewModal: React.FC<PopupPreviewModalProps> = ({
  open,
  onClose,
  popupId,
  classes
}) => {
  const dispatch = useDispatch<any>();
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [contentWidth, setContentWidth] = useState<number>(400);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && popupId) {
      loadPreview();
    }
  }, [open, popupId]);

  useEffect(() => {
    if (!loading && html && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          const content = contentRef.current.firstElementChild as HTMLElement;
          let width = 400;

          if (content) {
            const renderedWidth = content.offsetWidth || content.scrollWidth;
            const styleWidth = extractMaxWidthFromHtml(html);
            width = styleWidth || renderedWidth || 400;
          }

          const minWidth = 400;
          const maxWidth = window.innerWidth * 0.9;
          setContentWidth(Math.min(Math.max(width, minWidth), maxWidth));
        }
      }, 100);
    }
  }, [loading, html]);

  const extractMaxWidthFromHtml = (htmlContent: string): number | null => {
    try {
      const maxWidthRegex = /max-width:\s*(\d+)px/gi;
      const matches = htmlContent.match(maxWidthRegex);
      
      if (matches && matches.length > 0) {
        const widths = matches.map(match => {
          const widthMatch = match.match(/(\d+)/);
          return widthMatch ? parseInt(widthMatch[1], 10) : 0;
        });
        
        return Math.max(...widths);
      }
    } catch (error) {
      console.error('Error extracting max-width:', error);
    }
    
    return null;
  };

  const loadPreview = async () => {
    try {
      setLoading(true);
      
      const beeFixCss = document.createElement("link");
      beeFixCss.rel = 'stylesheet';
      beeFixCss.href = `${actionURL}Content/bee-fix.css`;
      document.getElementsByTagName('head')[0].appendChild(beeFixCss);
      // @ts-ignore
      const response = await dispatch(getLandingPagePreview(popupId)) as any;
      const htmlData = response?.payload?.Data?.HtmlData || '';
      setHtml(htmlData);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        className: classes.popupPreviewDialogPaper
      }}
    >
      <Box
        className={classes.popupPreviewContainer}
        style={{
          width: loading ? '400px' : `${contentWidth}px`,
        }}
      >
        <IconButton
          onClick={onClose}
          className={classes.popupPreviewCloseButton}
          size="small"
        >
          <CloseIcon />
        </IconButton>

        {loading ? (
          <Box className={classes.popupPreviewLoaderContainer}>
            <Loader isOpen={true} showBackdrop={false} />
          </Box>
        ) : (
          <div
            ref={contentRef}
            className={classes.popupPreviewContent}
          >
            {RenderHtml(html)}
          </div>
        )}
      </Box>
    </Dialog>
  );
};

export default PopupPreviewModal;