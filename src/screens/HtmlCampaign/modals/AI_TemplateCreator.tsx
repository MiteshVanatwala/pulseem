import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Grid,
  makeStyles,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@material-ui/core';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Palette as PaletteIcon
} from '@material-ui/icons';
import { pink, red, blue, green, purple, orange, teal, amber, indigo, cyan } from '@material-ui/core/colors';
import { AnthropicUserRequest } from '../../../Models/AI/Anthropic';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { requestTemplate } from '../../../redux/reducers/AISlice';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { setIsLoader } from '../../../redux/reducers/coreSlice';
import { convertFileToBase64 } from '../../../helpers/Utils/common';

// Custom styles using makeStyles
const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    margin: '0 auto',
    //direction: 'rtl', // RTL direction for Hebrew
    // fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  textArea: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#333',
    // textAlign: 'right',
  },
  submitButton: {
    backgroundColor: pink[500],
    color: 'white',
    '&:hover': {
      backgroundColor: pink[700],
    },
    borderRadius: 25,
    padding: '8px 20px',
    marginTop: theme.spacing(2),
    height: 40
  },
  checkboxLabel: {
    fontSize: '1rem',
  },
  checkboxDesc: {
    fontSize: 14,
    whiteSpace: 'nowrap'
  },
  optionBox: {
    backgroundColor: '#f9f9f9',
    padding: theme.spacing(2),
    borderRadius: 4,
  },
  icon: {
    marginInlineEnd: 5,
    color: '#ff7777',
  },
  // New styles for file upload
  uploadButton: {
    margin: theme.spacing(1, 0),
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    padding: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px dashed #ccc',
    '&:hover': {
      backgroundColor: '#e5e5e5',
    },
  },
  uploadIcon: {
    marginInlineEnd: theme.spacing(1),
    color: '#555',
  },
  filePreview: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: '#eee',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeIcon: {
    cursor: 'pointer',
    color: '#777',
    '&:hover': {
      color: red[500],
    },
  },
  // New styles for color picker
  colorBox: {
    width: 30,
    height: 30,
    margin: theme.spacing(0.5),
    cursor: 'pointer',
    borderRadius: 4,
    display: 'inline-block',
    position: 'relative',
    border: '1px solid #ddd',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  colorSelected: {
    border: '2px solid #333',
    '&::after': {
      content: '"✓"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#fff',
      textShadow: '0px 0px 2px #000',
    },
  },
  colorPaletteButton: {
    margin: theme.spacing(1, 0),
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    padding: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px dashed #ccc',
    '&:hover': {
      backgroundColor: '#e5e5e5',
    },
  },
  colorChip: {
    margin: theme.spacing(0.5),
    direction: 'ltr',
  },
  newFeatureSection: {
    marginBottom: theme.spacing(2),
  },
  newFeatureTitle: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
}));

// Array of color options
const colorOptions = [
  { name: 'אדום', value: red[500], hex: '#f44336' },
  { name: 'ורוד', value: pink[500], hex: '#e91e63' },
  { name: 'סגול', value: purple[500], hex: '#9c27b0' },
  { name: 'אינדיגו', value: indigo[500], hex: '#3f51b5' },
  { name: 'כחול', value: blue[500], hex: '#2196f3' },
  { name: 'ציאן', value: cyan[500], hex: '#00bcd4' },
  { name: 'טורקיז', value: teal[500], hex: '#009688' },
  { name: 'ירוק', value: green[500], hex: '#4caf50' },
  { name: 'צהוב', value: amber[500], hex: '#ffc107' },
  { name: 'כתום', value: orange[500], hex: '#ff9800' },
];

interface AITemplateCreatorProps {
  campaignId: any;
  onUpdate: (status: string) => void;
}

const AITemplateCreator = ({ campaignId, onUpdate }: AITemplateCreatorProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [model, setModel] = useState<AnthropicUserRequest & {
    originalFile?: File | null,
    selectedColors?: Array<{ name: string, value: string, hex: string }>
  }>({
    campaignId: campaignId,
    maxToken: 16384,
    messageRequest: '',
    file: '',
    originalFile: null,
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

  // File upload handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const ofile = e.target.files[0];
        const base64 = await convertFileToBase64(ofile);

        setModel({
          ...model,
          file: base64
        });
      } catch (error) {
        console.error("Error converting file to Base64:", error);
      }
    }
  };

  const removeFile = () => {
    setModel({
      ...model,
      originalFile: null
    });
  };

  // Color palette handlers
  const handleColorDialogOpen = () => {
    setColorDialogOpen(true);
  };

  const handleColorDialogClose = () => {
    setColorDialogOpen(false);
  };

  const toggleColor = (color: { name: string, value: string, hex: string }) => {
    const currentColors = [...(model.selectedColors || [])];
    const colorIndex = currentColors.findIndex(c => c.hex === color.hex);

    if (colorIndex > -1) {
      // Remove color if already selected
      currentColors.splice(colorIndex, 1);
    } else {
      // Add color if not already selected
      currentColors.push(color);
    }

    setModel({
      ...model,
      messageRequest: model.messageRequest += currentColors.map((c: any) => { return c.hex })
    });
  };

  const removeColor = (colorToRemove: { name: string, value: string, hex: string }) => {
    setModel({
      ...model,
      selectedColors: (model.selectedColors || []).filter(color => color.hex !== colorToRemove.hex)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare message request with additional info about files and colors
    let enhancedMessageRequest = model.messageRequest;

    // Add file info if present
    if (model.originalFile) {
      enhancedMessageRequest += `\n\nFile attached: ${model.originalFile.name} (${model.originalFile.type})`;
    }

    // Add color info if present
    if (model.selectedColors && model.selectedColors.length > 0) {
      enhancedMessageRequest += `\n\nSelected colors: ${model.selectedColors.map(c => `${c.name} (${c.hex})`).join(', ')}`;
    }

    // Create a new request object with the enhanced message
    const requestModel: AnthropicUserRequest = {
      campaignId: model.campaignId,
      maxToken: model.maxToken,
      messageRequest: enhancedMessageRequest,
      file: model.file,
      originalFile: model.originalFile
    };

    dispatch(setIsLoader(true));
    const response: any = await dispatch(requestTemplate(requestModel));

    switch (response?.payload?.StatusCode) {
      case 201: {
        onUpdate('success');
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 500: {
        alert('error occured');
      }
    }

    dispatch(setIsLoader(false));
  };

  return (
    <Box className={classes.root}>
      <form onSubmit={handleSubmit}>
        {/* Text area input */}
        <TextField
          className={classes.textArea}
          multiline
          rows={4}
          variant="outlined"
          value={model.messageRequest}
          onChange={handleTextChange}
          placeholder={`${t('AI.popup.placeholder')} 🥰`}
          InputProps={{
            style: { textAlign: 'right' }
          }}
        />

        {/* New Features Section */}
        <Paper className={classes.optionBox} elevation={0} style={{ marginBottom: '16px' }}>
          <Grid container spacing={2}>
            {/* File Upload */}
            <Grid item xs={6}>
              <Typography className={classes.newFeatureTitle}>
                <span className={classes.icon}>📎</span>
                העלאת קובץ
              </Typography>

              <input
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />

              <label htmlFor="file-upload">
                <Box className={classes.uploadButton}>
                  <CloudUploadIcon className={classes.uploadIcon} />
                  <Typography variant="body2">בחר קובץ</Typography>
                </Box>
              </label>

              {model.originalFile && (
                <Box className={classes.filePreview}>
                  <Typography variant="body2">{model.originalFile.name}</Typography>
                  <CloseIcon className={classes.removeIcon} onClick={removeFile} />
                </Box>
              )}
            </Grid>

            {/* Color Selector */}
            <Grid item xs={6}>
              <Typography className={classes.newFeatureTitle}>
                <span className={classes.icon}>🎨</span>
                בחירה מרובה של צבעים
              </Typography>

              <Box className={classes.colorPaletteButton} onClick={handleColorDialogOpen}>
                <PaletteIcon className={classes.uploadIcon} />
                <Typography variant="body2">בחר צבעים</Typography>
              </Box>

              {model.selectedColors && model.selectedColors.length > 0 && (
                <Box mt={1} display="flex" flexWrap="wrap">
                  {model.selectedColors.map((color) => (
                    <Chip
                      key={color.hex}
                      label={`${color.name} ${color.hex}`}
                      onDelete={() => removeColor(color)}
                      className={classes.colorChip}
                      style={{ backgroundColor: color.value, color: '#fff' }}
                    />
                  ))}
                </Box>
              )}
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
            className={classes.submitButton}
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
        <DialogTitle style={{ direction: 'rtl' }}>בחר צבעים</DialogTitle>
        <DialogContent>
          <Box display="flex" flexWrap="wrap" justifyContent="center">
            {colorOptions.map((color) => (
              <Box
                key={color.hex}
                className={`${classes.colorBox} ${model.selectedColors && model.selectedColors.some(c => c.hex === color.hex) ? classes.colorSelected : ''
                  }`}
                style={{ backgroundColor: color.value }}
                onClick={() => toggleColor(color)}
                title={`${color.name} ${color.hex}`}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleColorDialogClose} color="primary">
            סיום
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AITemplateCreator;