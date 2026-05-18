import React, { useState, useEffect, useRef } from 'react';
import { Dialog, IconButton, Box, Button } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getLandingPagePreview } from '../../../redux/reducers/landingPagesSlice';
import { getPopupStages, PopupStage } from '../../../redux/reducers/popUpManagementSlice';
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [contentWidth, setContentWidth] = useState<number>(400);
  const [stageHeights, setStageHeights] = useState<Record<number, number>>({});
  const [closeButtonData, setCloseButtonData] = useState<{
    color?: string;
    bgcolor?: string;
    size?: string;
    position?: string;
  } | null>(null);
  const [stages, setStages] = useState<PopupStage[]>([]);
  const [currentPreviewStage, setCurrentPreviewStage] = useState<number>(1);
  const [stageHtmlMap, setStageHtmlMap] = useState<Record<number, string>>({});
  const iframeRefs = useRef<Record<number, HTMLIFrameElement | null>>({});

  useEffect(() => {
    if (open && popupId) {
      setCurrentPreviewStage(1);
      setStages([]);
      setStageHtmlMap({});
      setStageHeights({});
      loadPreview();
    }
  }, [open, popupId]);

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
        return sortedWidths.length > 1 ? sortedWidths[1] : sortedWidths[0];
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
      const previewResponse = await dispatch(getLandingPagePreview(popupId)) as any;
      const stage1Html = previewResponse?.payload?.Data?.HtmlData || '';

      const closeButtonHtml = previewResponse?.payload?.Data?.CloseButtonHtml;
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

      // @ts-ignore
      const stagesResult = await dispatch(getPopupStages(popupId)) as any;
      const stagesData: PopupStage[] = stagesResult?.payload?.Data || [];

      const htmlMap: Record<number, string> = { 1: stage1Html };
      stagesData.forEach((stage: PopupStage) => {
        if (stage.StageNumber > 1 && stage.HtmlContent) {
          htmlMap[stage.StageNumber] = stage.HtmlContent;
        }
      });

      const styleWidth = extractMaxWidthFromHtml(stage1Html);
      if (styleWidth) {
        const minWidth = 400;
        const maxWidth = window.innerWidth * 0.9;
        setContentWidth(Math.min(Math.max(styleWidth, minWidth), maxWidth));
      }

      const multiStages = stagesData.length > 1 ? stagesData : [];
      setStages(multiStages);
      setStageHtmlMap(htmlMap);
      setCurrentPreviewStage(1);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const measureIframeHeight = (stageNum: number, iframe: HTMLIFrameElement) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc && iframeDoc.body) {
        const height = iframeDoc.body.scrollHeight;
        const maxHeight = window.innerHeight * 0.9;
        setStageHeights(prev => ({ ...prev, [stageNum]: Math.min(height, maxHeight) }));
      }
    } catch (error) {
      console.error('Error measuring iframe height:', error);
    }
  };

  const handleIframeLoad = (stageNum: number, iframe: HTMLIFrameElement) => {
    // Measure immediately, then re-measure after a tick in case fonts/images
    // affect layout slightly after the load event fires.
    measureIframeHeight(stageNum, iframe);
    setTimeout(() => measureIframeHeight(stageNum, iframe), 100);
  };

  const handleStageTabClick = (stageNum: number) => {
    if (stageNum === currentPreviewStage) return;
    setCurrentPreviewStage(stageNum);
    // Re-measure when the stage becomes visible — hidden iframes may have
    // had inaccurate layout at onLoad time (display:none skips layout compute).
    setTimeout(() => {
      const iframe = iframeRefs.current[stageNum];
      if (iframe) measureIframeHeight(stageNum, iframe);
    }, 50);
  };

  const renderStageTabs = () => {
    if (stages.length < 2) return null;
    return (
      <Box style={{ display: 'flex', gap: 8, padding: '10px 16px 0', justifyContent: 'center' }}>
        {stages.map((stage) => {
          const isActive = currentPreviewStage === stage.StageNumber;
          return (
            <Button
              key={stage.StageNumber}
              size="small"
              onClick={() => handleStageTabClick(stage.StageNumber)}
              style={{
                minWidth: 90,
                borderRadius: 20,
                border: '2px solid #F65026',
                background: isActive
                  ? 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)'
                  : '#fff',
                color: isActive ? '#fff' : '#000',
                fontWeight: 'bold',
                fontSize: 13,
                padding: '4px 16px',
                transition: 'none',
              }}
            >
              {t('Popup.popup_stage_n', { n: stage.StageNumber })}
            </Button>
          );
        })}
      </Box>
    );
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
            display: loading ? 'none' : 'flex',
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
          <>
            {renderStageTabs()}
            <div className={classes.popupPreviewContent}>
              {Object.entries(stageHtmlMap).map(([stageNumStr, stageHtml]) => {
                const stageNum = Number(stageNumStr);
                const isVisible = stageNum === currentPreviewStage;
                return (
                  <iframe
                    key={stageNum}
                    ref={el => { iframeRefs.current[stageNum] = el; }}
                    style={{
                      width: '100%',
                      height: `${stageHeights[stageNum] || 600}px`,
                      border: 'none',
                      display: isVisible ? 'block' : 'none',
                      overflow: 'auto',
                      borderRadius: '8px',
                    }}
                    title={`Popup Preview Stage ${stageNum}`}
                    srcDoc={stageHtml}
                    onLoad={e => handleIframeLoad(stageNum, e.currentTarget)}
                  />
                );
              })}
            </div>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default PopupPreviewModal;
