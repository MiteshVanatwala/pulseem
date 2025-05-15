import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent
} from '@material-ui/core';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Palette as PaletteIcon
} from '@material-ui/icons';
import { AnthropicUserRequest } from '../../../Models/AI/Anthropic';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { requestTemplate } from '../../../redux/reducers/AISlice';
import { setIsLoader } from '../../../redux/reducers/coreSlice';
import { convertFileToBase64 } from '../../../helpers/Utils/common';
import clsx from 'clsx';
import Gallery from '../../../components/Gallery/Gallery.component';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { PulseemFolderType } from '../../../model/PulseemFields/Fields';
import { IoMdImages } from 'react-icons/io';
import { FileGallery } from '../../../Models/Files/FileGallery';
import { RandomID } from '../../../helpers/Functions/functions';
import PulseemColorPickerUI from '../../../components/Controlls/PulseemColorPickerUI';
import Toast from '../../../components/Toast/Toast.component';

interface AITemplateCreatorProps {
  classes: any,
  campaignId: any;
  onUpdate: (status: string) => void;
}

const AITemplateCreator = ({ classes, campaignId, onUpdate }: AITemplateCreatorProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { ToastMessages } = useSelector((state: any) => state?.Ai);
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
  const [showDocs, setShowDocuments] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [filesProperties, setFilesProperties] = useState<FileGallery[]>([]);
  const [isGalleryConfirmed, setIsFileSelected] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<any>();
  const [model, setModel] = useState<AnthropicUserRequest & {
    selectedColors?: Array<{ name: string, value: string, hex: string }>
  }>({
    campaignId: campaignId,
    maxToken: null,
    messageRequest: '',
    file: null,
    selectedColors: []
  });

  // State for color dialog
  const [colorDialogOpen, setColorDialogOpen] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setModel({
      ...model,
      messageRequest: e.target.value
    });
  };

  const removeFile = () => {
    setModel({
      ...model,
      file: null
    });
  };

  // Color palette handlers
  const handleColorDialogOpen = () => {
    setColorDialogOpen(true);
  };

  const handleColorDialogClose = () => {
    setColorDialogOpen(false);
  };

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let enhancedMessageRequest = model.messageRequest;

    if (model?.file?.name) {
      enhancedMessageRequest += `\n\nFile attached: ${model?.file?.name} (${model?.file?.name})`;
    }

    if (colors && colors.length > 0) {
      enhancedMessageRequest += `\n\nSelected colors: ${colors.map(c => c).join(', ')}`;
    }
    // if (model.selectedColors && model.selectedColors.length > 0) {
    //   enhancedMessageRequest += `\n\nSelected colors: ${model.selectedColors.map(c => `${c.name} (${c.hex})`).join(', ')}`;
    // }

    // Create a new request object with the enhanced message
    const requestModel: AnthropicUserRequest = {
      campaignId: model.campaignId,
      maxToken: model.maxToken,
      messageRequest: enhancedMessageRequest,
      file: model.file
    };

    dispatch(setIsLoader(true));
    const response: any = await dispatch(requestTemplate(requestModel));
    dispatch(setIsLoader(false));
    if (response?.payload?.StatusCode === 201) {
      onUpdate('success');
    }
    else {
      setToastMessage(ToastMessages.RESPONSES[response?.payload?.StatusCode]);
    }

  };

  const handleGalleryConfirm = () => {
    setIsFileSelected(true);
  }

  const handleSelectedFile = async (fileUrl: string, fileType: string) => {
    const existsFiles = [...filesProperties];
    const existFile = filesProperties.find((f) => {
      return f.FileURL === fileUrl
    });

    let fileName = fileUrl.split('/')[fileUrl.split('/').length - 1];

    if (!existFile) {
      const newFile = {
        Name: fileName,
        FileName: fileName,
        FolderType: PulseemFolderType.CLIENT_IMAGES,
        FileURL: fileUrl,
        ID: RandomID()
      }
      existsFiles.push(newFile as any);
    }

    setFilesProperties(existsFiles);

    setModel({
      ...model,
      file: {
        fileType: fileType,
        name: fileName,
        fileUrl: fileUrl,
        text: ''
      }
    });

    setShowDocuments(false);
    setShowGallery(false);
  }

  return (
    <Box className={classes.aiContainer}>
      <form onSubmit={handleSubmit}>
        {/* Text area input */}
        <TextField
          className={classes.textArea}
          multiline
          rows={4}
          variant="outlined"
          value={model.messageRequest}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleTextChange(e);
            if (e.target.value === '') {
              setSubmitDisabled(true);
            }
            else {
              setSubmitDisabled(false);
            }
          }}
          placeholder={`${t('AI.popup.placeholder')} 🥰`}
          InputProps={{
            style: { textAlign: 'right' }
          }}
        />

        {/* New Features Section */}
        <Paper className={classes.optionBox} elevation={0} style={{ marginBottom: '16px' }}>
          <Grid container spacing={2}>
            {/* File Upload */}
            <Grid item xs={3}>
              <Typography className={classes.newFeatureTitle}>
                <span className={classes.icon}>📎</span>
                {t('common.imageGallery')}
              </Typography>
              <Button onClick={(e: any) => {
                e.preventDefault();
                setShowGallery(true);
              }} style={{ paddingTop: 0 }}>
                <Box className={classes.uploadButton} style={{ marginTop: 0 }}>
                  <CloudUploadIcon className={classes.uploadIcon} />
                  <Typography variant="body2">{t('common.selectFile')}</Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Typography className={classes.newFeatureTitle}>
                <span className={classes.icon}>📎</span>
                {t('common.documentGallery')}
              </Typography>
              <Button onClick={(e: any) => {
                e.preventDefault();
                setShowDocuments(true);
              }} style={{ paddingTop: 0 }}>
                <Box className={classes.uploadButton} style={{ marginTop: 0 }}>
                  <CloudUploadIcon className={classes.uploadIcon} />
                  <Typography variant="body2">{t('common.selectFile')}</Typography>
                </Box>
              </Button>
            </Grid>

            {/* Color Selector */}
            <Grid item xs={6}>
              <Typography className={classes.newFeatureTitle}>
                <span className={classes.icon}>🎨</span>
                {t('colorPalette.multipleColorSelection')}
              </Typography>

              <Box className={classes.colorPaletteButton} onClick={handleColorDialogOpen}>
                <PaletteIcon className={classes.uploadIcon} />
                <Typography variant="body2"> {t('colorPalette.selectColors')}</Typography>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'row' }}>
                {colors.map((c: string, index: number) => {
                  return <Box
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}>
                    <Box
                      style={{ display: 'flex', flexDirection: 'column', marginInlineEnd: 5, alignItems: 'center' }}>
                      <Box
                        style={{ borderRadius: 2, backgroundColor: c, width: 25, height: 25 }}>
                      </Box>
                      <Box style={{ height: 20 }}>
                        {hoveredIndex === index && <Box style={{ cursor: 'pointer' }} onClick={() => {
                          const removeColor = colors.filter((col: any) => { return c !== col });
                          setColors(removeColor);
                        }}>x</Box>}
                      </Box>
                    </Box>
                  </Box>
                })}
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container>
              <Grid item xs={12}>
                {model?.file?.name && (
                  <Box className={classes.filePreview}>
                    <Typography variant="body2">{model?.file?.name}</Typography>
                    <CloseIcon className={classes.removeIcon} onClick={removeFile} />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Options section */}
        <Paper className={classes.optionBox} elevation={0}>
          <Typography className={classes.sectionTitle}>
            {t('AI.popup.tips.title')}
          </Typography>
          <Divider style={{ marginBottom: 15 }} />
          <Grid container spacing={2}>
            {/* First column */}
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <span className={classes.icon}>🎨</span>
                <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                  {t('AI.popup.tips.toneTitle')}
                </Typography>
              </Box>
              <Typography className={classes.checkboxDesc}>
                {t('AI.popup.tips.toneDesc')}
              </Typography>
              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <span className={classes.icon}>📝</span>
                  <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                    {t('AI.popup.tips.specificTitle')}
                  </Typography>
                </Box>
                <Typography className={classes.checkboxDesc}>
                  {t('AI.popup.tips.specificDesc')}
                </Typography>
              </Box>
            </Grid>

            {/* Second column */}
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <span className={classes.icon}>👗</span>
                <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                  {t('AI.popup.tips.elementsTitle')}
                </Typography>
              </Box>
              <Typography className={classes.checkboxDesc}>
                {t('AI.popup.tips.elementsDesc')}
              </Typography>

              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <span className={classes.icon}>🎯</span>
                  <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                    {t('AI.popup.tips.structureTitle')}
                  </Typography>
                </Box>
                <Typography className={classes.checkboxDesc}>
                  {t('AI.popup.tips.structureDesc')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Submit button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            className={clsx(classes.submitButton, submitDisabled && classes.disabled)}
            endIcon={<span>✨</span>}
          >
            {t('AI.popup.createDesign')}
          </Button>
        </Box>
      </form>

      {/* Color Selection Dialog */}
      <Dialog
        open={colorDialogOpen}
        onClose={handleColorDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle style={{ direction: 'rtl' }}>{t('colorPalette.selectColors')}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexWrap="wrap" justifyContent="center">
            <PulseemColorPickerUI
              onSelectColor={(color: any) => {
                const finalColors = [...colors];
                finalColors.push(color);
                setColors(finalColors);
                setColorDialogOpen(false);
              }}
              onCancel={() => { setColorDialogOpen(false); }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      {showGallery && (
        <BaseDialog
          showDivider={false}
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          classes={classes}
          open={showGallery}
          onClose={() => { setShowGallery(false); }}
          onCancel={() => { setShowGallery(false); }}
          onConfirm={(x: any) => { handleGalleryConfirm(); }}
          icon={<IoMdImages />}
          title={t("common.imageGallery")}
        >
          <Gallery
            classes={classes}
            //@ts-ignore
            style={{ minWidth: 400 }}
            multiSelect={false}
            forceReload={true}
            folderType={PulseemFolderType.CLIENT_IMAGES}
            isConfirm={isGalleryConfirmed}
            callbackSelectFile={(fileUrl: string) => handleSelectedFile(fileUrl, 'image')}
          />
        </BaseDialog>
      )}

      {showDocs && (
        <BaseDialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showDocs}
          onClose={() => { setShowDocuments(false); }}
          onCancel={() => { setShowDocuments(false); }}
          onConfirm={(x: any) => { handleGalleryConfirm(); }}
          title={t("common.documentGallery")}
        >
          <Gallery
            classes={classes}
            //@ts-ignore
            style={{ minWidth: 400 }}
            multiSelect={false}
            forceReload={true}
            folderType={PulseemFolderType.DOCUMENT}
            isConfirm={isGalleryConfirmed}
            callbackSelectFile={(fileUrl: string) => handleSelectedFile(fileUrl, 'document')}
          />
        </BaseDialog>
      )}
      {renderToast()}
    </Box>
  );
};

export default AITemplateCreator;