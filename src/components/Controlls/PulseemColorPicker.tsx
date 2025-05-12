import { Box, makeStyles, Typography, Grid, Paper, Button, Chip } from '@material-ui/core';
import {
  red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan,
  teal, green, lightGreen, lime, amber, orange, deepOrange
} from '@material-ui/core/colors';
import { useState } from 'react';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface ColorPalette {
  [key: number | string]: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  A100?: string | any;
  A200?: string | any;
  A400?: string | any;
  A700?: string | any;
}

export interface SavedColor {
  colorName: string;
  shade: number | string;
  hexCode: string;
  colorFamily: number;
}

const useStyles = makeStyles((theme) => ({
  colorPreview: {
    height: 80,
    width: '100%',
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    width: '100%',
    padding: theme.spacing(2)
  },
  colorSwatch: {
    height: 60,
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5),
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    '&:hover': {
      transform: 'scale(1.05)',
      transition: 'transform 0.2s'
    }
  },
  selectedSwatch: {
    border: `2px solid ${theme.palette.common.black}`,
    boxShadow: theme.shadows[3]
  },
  swatchLabel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.7)',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  shadeSwatch: {
    padding: '14px 8px',
    textAlign: 'center',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  addButton: {
    height: 40,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    alignSelf: 'top'
  },
  finishButton: {
    width: 100,
    marginTop: theme.spacing(2),
    justifySelf: 'center'
  },
  savedColorsSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  colorChip: {
    margin: theme.spacing(0.5),
    position: 'relative',
    height: 32,
    '&:hover': {
      transform: 'scale(1.05)',
      transition: 'transform 0.2s'
    }
  },
  colorIndicator: {
    borderRadius: '50%',
    width: 32,
    height: 30,
    borderTopRightRadius: '50%',
    borderTopLeftRadius: '0 !important',
    borderBottomLeftRadius: '50% !important',
    borderBottomRightRadius: '50% !important'
  },
  rtlColorIndicator: {
    borderRadius: '50%',
    width: '32px !important',
    height: '30px !important',
    borderTopRightRadius: '0 !important',
    borderTopLeftRadius: '50% !important',
    borderBottomLeftRadius: '50% !important',
    borderBottomRightRadius: '50% !important',
    marginRight: '1px !important',
    marginLeft: '0px !important'
  },
  mt10: {
    marginTop: 10
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  numberItem: {
    backgroundColor: '#ff3343',
    borderRadius: '100%',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    height: 30,
    width: 30,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginInlineEnd: 10
  }
}));

const colorNames: { [key: number]: string } = {
  0: 'Red',
  1: 'Pink',
  2: 'Purple',
  3: 'Deep Purple',
  4: 'Indigo',
  5: 'Blue',
  6: 'Light Blue',
  7: 'Cyan',
  8: 'Teal',
  9: 'Green',
  10: 'Light Green',
  11: 'Lime',
  12: 'Amber',
  13: 'Orange',
  14: 'Deep Orange'
};

const standardShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const accentShades = ['A100', 'A200', 'A400', 'A700'];

// Interface for props
interface PulseemColorPickerProps {
  onSelecteColors: (colors: SavedColor[]) => void;
}

const PulseemColorPicker: React.FC<PulseemColorPickerProps> = ({ onSelecteColors }) => {
  const classes = useStyles();
  const { isRTL } = useSelector((state: any) => state.core);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(5);
  const [selectedShade, setSelectedShade] = useState<number | string>(500);
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const { t } = useTranslation();

  // Add state to track click timestamps for double-click detection
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickTarget, setLastClickTarget] = useState<string>('');

  const colors: ColorPalette[] = [
    red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan,
    teal, green, lightGreen, lime, amber, orange, deepOrange
  ];

  const currentColorPalette = colors[selectedColorIndex];
  const availableStandardShades = standardShades.filter(shade => shade in currentColorPalette);
  const availableAccentShades = accentShades.filter(shade => shade in currentColorPalette);
  const currentColor = currentColorPalette[selectedShade];

  // Handle double-click detection for color family
  const handleColorFamilyClick = (colorIndex: number) => {
    const currentTime = new Date().getTime();
    const targetId = `family-${colorIndex}`;

    // Handle standard single-click behavior
    setSelectedColorIndex(colorIndex);
    if (500 in colors[colorIndex]) {
      setSelectedShade(500);
    } else {
      const firstAvailableShade = standardShades.find(shade => shade in colors[colorIndex]) ||
        accentShades.find(shade => shade in colors[colorIndex]) || 500;
      setSelectedShade(firstAvailableShade);
    }

    // Check for double-click
    if (lastClickTarget === targetId && currentTime - lastClickTime < 300) {
      // Double-click detected, add the color to saved colors
      addColorWithFamily(colorIndex, 500); // Use shade 500 by default for family double-click
    }

    setLastClickTime(currentTime);
    setLastClickTarget(targetId);
  };

  // Handle double-click detection for shade selection
  const handleShadeClick = (shade: number | string) => {
    const currentTime = new Date().getTime();
    const targetId = `shade-${shade}`;

    // Handle standard single-click behavior
    setSelectedShade(shade);

    // Check for double-click
    if (lastClickTarget === targetId && currentTime - lastClickTime < 300) {
      // Double-click detected, add the color to saved colors
      addColorWithFamily(selectedColorIndex, shade);
    }

    setLastClickTime(currentTime);
    setLastClickTarget(targetId);
  };

  // Helper function to add a color with a specific family and shade
  const addColorWithFamily = (colorIndex: number, shade: number | string) => {
    const shadeToUse = shade in colors[colorIndex] ? shade : 500;
    const hexCode = colors[colorIndex][shadeToUse];

    const isAlreadySaved = savedColors.some(
      color => color.colorFamily === colorIndex && color.shade === shadeToUse
    );

    if (!isAlreadySaved && hexCode) {
      const newColor: SavedColor = {
        colorName: colorNames[colorIndex],
        shade: shadeToUse,
        hexCode: hexCode,
        colorFamily: colorIndex
      };
      setSavedColors([...savedColors, newColor]);
    }
  };

  const addCurrentColor = () => {
    const isAlreadySaved = savedColors.some(
      color => color.colorFamily === selectedColorIndex && color.shade === selectedShade
    );

    if (!isAlreadySaved) {
      const newColor: SavedColor = {
        colorName: colorNames[selectedColorIndex],
        shade: selectedShade,
        hexCode: currentColor,
        colorFamily: selectedColorIndex
      };
      setSavedColors([...savedColors, newColor]);
    }
  };

  const removeColor = (index: number) => {
    const newSavedColors = [...savedColors];
    newSavedColors.splice(index, 1);
    setSavedColors(newSavedColors);
  };

  const handleFinish = () => {
    onSelecteColors(savedColors);
  };

  return (
    <Box className={classes.container} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <Grid container spacing={2}>
        <Grid item md={6}>
          <Grid container>
            <Grid item md={12}>
              <Box className={classes.flex}>
                <Box className={classes.numberItem}>
                  <Typography>1</Typography>
                </Box>
                <Typography variant="subtitle1" gutterBottom style={{ fontSize: '1.25rem' }}>
                  {t('colorPalette.colorFamily')}
                </Typography>
              </Box>
            </Grid>
            {colors.map((color, index) => (
              <Grid item key={index} md={3}>
                <Box
                  className={`${classes.colorSwatch} ${selectedColorIndex === index ? classes.selectedSwatch : ''}`}
                  style={{ backgroundColor: color[500] }}
                  onClick={() => handleColorFamilyClick(index)}
                >
                  <Typography className={classes.swatchLabel}>
                    {colorNames[index]}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item md={6}>
          <Grid container>
            <Grid item md={12}>
              <Box className={classes.flex}>
                <Box className={classes.numberItem}>
                  <Typography>2</Typography>
                </Box>
                <Typography variant="subtitle1" gutterBottom style={{ fontSize: '1.25rem' }}>
                  {t('colorPalette.standardShades')}
                </Typography>
              </Box>
            </Grid>
            <Grid item md={12} style={{ marginTop: 5 }}>
              <Grid container spacing={2}>
                {availableStandardShades.map((shade) => {
                  const shadeColor = currentColorPalette[shade];
                  const isSelected = shade === selectedShade;
                  const isDark = shade >= 500;

                  return (
                    <Grid item key={shade} xs={4} sm={3} md={3}>
                      <Paper
                        elevation={isSelected ? 8 : 1}
                        onClick={() => handleShadeClick(shade)}
                      >
                        <Box
                          className={classes.shadeSwatch}
                          style={{
                            backgroundColor: shadeColor,
                            border: isSelected ? '2px solid black' : '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography style={{
                            color: isDark ? '#fff' : '#000',
                            fontWeight: isSelected ? 'bold' : 'normal'
                          }}>
                            {shade}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
            {availableAccentShades.length > 0 && <Grid item md={12} className={classes.mt10}>
              <Typography variant="subtitle1" gutterBottom style={{ fontSize: '1.25rem' }}>
                {t('colorPalette.accentShades')}
              </Typography>
              <Grid container spacing={2}>
                {availableAccentShades.map((shade) => {
                  const shadeColor = currentColorPalette[shade];
                  const isSelected = shade === selectedShade;

                  return (
                    <Grid item key={shade} xs={4} sm={3} md={3}>
                      <Paper
                        elevation={isSelected ? 8 : 1}
                        onClick={() => handleShadeClick(shade)}
                      >
                        <Box
                          className={classes.shadeSwatch}
                          style={{
                            backgroundColor: shadeColor,
                            border: isSelected ? '2px solid black' : '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography style={{
                            color: '#fff',
                            fontWeight: isSelected ? 'bold' : 'normal'
                          }}>
                            {shade}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
            }
          </Grid>
        </Grid>
      </Grid>
      <Grid container justifyContent={savedColors.length > 0 ? 'space-between' : 'flex-end'}>
        {savedColors.length > 0 && (
          <Box className={classes.savedColorsSection}>
            <Typography variant="h6" gutterBottom>
              {t('colorPalette.selectedColors')} ({savedColors.length})
            </Typography>
            <Box className={classes.chipContainer}>
              {savedColors.map((color, index) => (
                <Chip
                  key={index}
                  label={`${color.colorName} ${color.shade}`}
                  onDelete={() => removeColor(index)}
                  deleteIcon={<DeleteIcon style={{ width: 52 }} />}
                  className={classes.colorChip}
                  avatar={
                    <Box
                      className={isRTL ? classes.rtlColorIndicator : classes.colorIndicator}
                      style={{ backgroundColor: color.hexCode }}
                    />
                  }
                />
              ))}
            </Box>
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={addCurrentColor}
        >
          {t('colorPalette.addColor')}
        </Button>
      </Grid>
      <Grid container justifyContent='center'>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className={classes.finishButton}
          onClick={handleFinish}
        >
          {t('common.finish')}
        </Button>
      </Grid>
    </Box>
  );
};

export default PulseemColorPicker;