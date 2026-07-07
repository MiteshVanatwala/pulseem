import React, { useState, useEffect, useRef } from 'react';
import { Dialog, IconButton, Box } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { getLandingPagePreview } from '../../../redux/reducers/landingPagesSlice';
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
  const [contentHeight, setContentHeight] = useState<number>(600);
  const [closeButtonData, setCloseButtonData] = useState<{
    color?: string;
    bgcolor?: string;
    size?: string;
    position?: string;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  useEffect(() => {
    if (!loading && html && iframeRef.current) {
      const iframe = iframeRef.current;
      
      const adjustIframeHeight = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc && iframeDoc.body) {
            const height = iframeDoc.body.scrollHeight;
            const maxHeight = window.innerHeight * 0.9;
            setContentHeight(Math.min(height, maxHeight));
          }
        } catch (error) {
          console.error('Error adjusting iframe height:', error);
        }
      };

      iframe.addEventListener('load', adjustIframeHeight);
      
      setTimeout(adjustIframeHeight, 100);

      return () => {
        iframe.removeEventListener('load', adjustIframeHeight);
      };
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

        const sortedWidths = Array.from(new Set(widths)).sort((a, b) => b - a);

        const secondMaxWidth = sortedWidths.length > 1 ? sortedWidths[1] : sortedWidths[0];

        return secondMaxWidth;
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

      const closeButtonHtml = response?.payload?.Data?.CloseButtonHtml;
      if (closeButtonHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(closeButtonHtml, 'text/html');
        const closeBtn = doc.getElementById('PulseemCloseButton');

        if (closeBtn) {
          setCloseButtonData({
            color: closeBtn.getAttribute('data-color') || undefined,
            bgcolor: closeBtn.getAttribute('data-bgcolor') || undefined,
            size: closeBtn.getAttribute('data-Size') || undefined,
            position: closeBtn.getAttribute('data-Position') || undefined,
          });
        }
      }
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
        className: classes.popupPreviewDialogPaper,
        style: { overflow: 'visible' }
      }}
    >
      <Box
        className={classes.popupPreviewContainer}
        style={{
          width: loading ? '400px' : `${contentWidth}px`,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          className={classes.popupPreviewCloseButton}
          size="small"
          style={{
            position: 'absolute',
            top: '-15px',
            zIndex: 1000,
            display: loading ? 'none' : 'flex', // Hide close button while loading
            ...(closeButtonData?.color && { color: closeButtonData.color }),
            ...(closeButtonData?.bgcolor && { backgroundColor: closeButtonData.bgcolor }),
            ...(closeButtonData?.size && {
              fontSize: `${closeButtonData.size}px`,
              width: `${parseInt(closeButtonData.size) * 2}px`,
              height: `${parseInt(closeButtonData.size) * 2}px`,
            }),
            ...(closeButtonData?.position?.toLowerCase() === 'left'
              ? { left: '-15px', right: 'auto' }
              : closeButtonData?.position?.toLowerCase() === 'center'
                ? { left: '50%', top: '-15px', transform: 'translateX(-50%)' }
                : { right: '-15px', left: 'auto' }
            ),
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: '50%',
          }}
        >
          <CloseIcon style={{
            fontSize: closeButtonData?.size ? `${closeButtonData.size}px` : undefined
          }} />
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
            <iframe
              ref={iframeRef}
              style={{
                width: '100%',
                height: `${contentHeight}px`,
                border: 'none',
                display: 'block',
                overflow: 'auto',
                borderRadius: '8px'
              }}
              title="Popup Preview"
              srcDoc={html}
            />
          </div>
        )}
      </Box>
    </Dialog>
  );
};

export default PopupPreviewModal;